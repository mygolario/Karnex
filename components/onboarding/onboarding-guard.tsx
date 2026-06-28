"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { trackExistingUserReonboarded } from "@/lib/onboarding/analytics";

const BYPASS_PREFIXES = ["/onboarding", "/login", "/signup", "/auth"];

export function useOnboardingGuard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const tracked = useRef(false);

  useEffect(() => {
    if (loading || !user) return;
    if (BYPASS_PREFIXES.some((p) => pathname.startsWith(p))) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/onboarding");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        if (data.redirectTo && !pathname.startsWith(data.redirectTo)) {
          if (data.user?.needsReonboard && !tracked.current) {
            trackExistingUserReonboarded();
            tracked.current = true;
          }
          router.replace(data.redirectTo);
        }
      } catch {
        // ignore
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user, loading, pathname, router]);
}

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  useOnboardingGuard();
  return <>{children}</>;
}
