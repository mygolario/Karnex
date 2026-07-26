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

const HEARTBEAT_KEY = "karnex_last_seen_heartbeat";
const HEARTBEAT_INTERVAL_MS = 5 * 60 * 1000;

function getInitialConsent(): boolean | null {
  if (typeof window === "undefined") return null;
  const value = localStorage.getItem("cookieConsent");
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

function maybeSendHeartbeat() {
  if (typeof window === "undefined") return;
  try {
    const last = Number(sessionStorage.getItem(HEARTBEAT_KEY) || "0");
    if (Date.now() - last < HEARTBEAT_INTERVAL_MS) return;
    sessionStorage.setItem(HEARTBEAT_KEY, String(Date.now()));
  } catch {
    // still attempt once
  }
  void fetch("/api/analytics/heartbeat", { method: "POST" }).catch(() => {});
}

/**
 * Loads PostHog when key is set and cookie consent is accepted.
 * Captures first-touch UTMs, identifies logged-in users, consumes signup cookie.
 */
export function PostHogProvider() {
  const { user, userProfile } = useAuth();
  const initialized = useRef(false);
  const identifiedId = useRef<string | null>(null);
  const lastTraitsKey = useRef<string | null>(null);

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
          session_recording: {
            maskAllInputs: true,
            maskTextSelector: "[data-ph-mask], .ph-mask, input[type='password']",
            blockSelector: "[data-ph-no-capture], .ph-no-capture",
          },
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
      const plan = userProfile?.subscription?.planId ?? undefined;
      const projectCount =
        typeof userProfile?.credits?.projectsUsed === "number"
          ? userProfile.credits.projectsUsed
          : undefined;
      const traitsKey = `${user.id}|${user.email ?? ""}|${user.role ?? ""}|${userProfile?.is_test_user ? "1" : "0"}|${plan ?? ""}|${projectCount ?? ""}`;

      if (
        identifiedId.current !== user.id ||
        lastTraitsKey.current !== traitsKey
      ) {
        identifyProductUser(user.id, {
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          role: user.role ?? undefined,
          plan,
          project_count: projectCount,
          // PostHog: Filter out internal and test users where is_internal = true
          is_internal:
            user.role === "admin" || Boolean(userProfile?.is_test_user),
          user_kind:
            user.role === "admin"
              ? "internal"
              : userProfile?.is_test_user
                ? "test"
                : "organic",
        });
        identifiedId.current = user.id;
        lastTraitsKey.current = traitsKey;
        consumeSignupCookieAndTrack();
      }
      maybeSendHeartbeat();
    } else if (identifiedId.current) {
      resetProductUser();
      identifiedId.current = null;
      lastTraitsKey.current = null;
    }
  }, [
    user?.id,
    user?.email,
    user?.name,
    user?.role,
    userProfile?.is_test_user,
    userProfile?.subscription?.planId,
    userProfile?.credits?.projectsUsed,
  ]);

  return null;
}
