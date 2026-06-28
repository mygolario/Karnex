"use client";

import { useReducedMotion } from "framer-motion";

/** Shared a11y helpers for onboarding flows */
export function useOnboardingMotion() {
  const reduceMotion = useReducedMotion();
  return {
    reduceMotion: Boolean(reduceMotion),
    transition: reduceMotion ? { duration: 0 } : undefined,
  };
}

export const onboardingFocusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";
