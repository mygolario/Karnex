"use client";

import { useEffect, useRef } from "react";
import posthog from "posthog-js";
import { useAuth } from "@/contexts/auth-context";
import {
  consumeSignupCookieAndTrack,
  identifyProductUser,
  registerProductSuperProperties,
  resetProductUser,
} from "@/lib/analytics/product";
import { captureUtmFromUrl, getStoredUtm } from "@/lib/analytics/utm";

function getInitialConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem("cookieConsent");
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

/**
 * Loads PostHog when key is set and cookie consent is accepted.
 * Captures first-touch UTMs, identifies logged-in users, consumes signup cookie.
 */
export function PostHogProvider() {
  const { user } = useAuth();
  const initialized = useRef(false);
  const identifiedId = useRef<string | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    const host =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

    const boot = () => {
      const consent = getInitialConsent();
      if (consent !== true) {
        if (initialized.current) {
          try {
            posthog.opt_out_capturing();
          } catch {
            // ignore
          }
        }
        return;
      }

      const utm = captureUtmFromUrl();

      if (!initialized.current) {
        posthog.init(key, {
          api_host: host,
          person_profiles: "identified_only",
          capture_pageview: true,
          capture_pageleave: true,
          persistence: "localStorage+cookie",
        });
        // Expose for tour queue + product analytics
        window.posthog = posthog;
        initialized.current = true;
      } else {
        try {
          posthog.opt_in_capturing();
        } catch {
          // ignore
        }
      }

      if (Object.keys(utm).length > 0) {
        registerProductSuperProperties(utm);
      } else {
        const stored = getStoredUtm();
        if (Object.keys(stored).length > 0) {
          registerProductSuperProperties(stored);
        }
      }

      consumeSignupCookieAndTrack();
    };

    boot();

    const onConsent = () => boot();
    window.addEventListener("cookie-consent-change", onConsent);
    window.addEventListener("storage", onConsent);
    return () => {
      window.removeEventListener("cookie-consent-change", onConsent);
      window.removeEventListener("storage", onConsent);
    };
  }, []);

  useEffect(() => {
    if (!initialized.current && !process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (!window.posthog) return;

    if (user?.id) {
      if (identifiedId.current === user.id) return;
      identifyProductUser(user.id, {
        email: user.email ?? undefined,
        name: user.name ?? undefined,
        role: user.role ?? undefined,
      });
      identifiedId.current = user.id;
      consumeSignupCookieAndTrack();
    } else if (identifiedId.current) {
      resetProductUser();
      identifiedId.current = null;
    }
  }, [user?.id, user?.email, user?.name, user?.role]);

  return null;
}
