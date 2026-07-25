"use client";

import { useSyncExternalStore } from "react";

/** Single source of truth for the mobile/desktop split. Matches Tailwind's `md`. */
export const MOBILE_BREAKPOINT = 768;

const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;
const STANDALONE_QUERY = "(display-mode: standalone)";

const subscribeCache = new Map<string, (onChange: () => void) => () => void>();

function subscribeTo(query: string) {
  let subscribe = subscribeCache.get(query);
  if (!subscribe) {
    subscribe = (onChange: () => void) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    };
    subscribeCache.set(query, subscribe);
  }
  return subscribe;
}

const getMobileSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;

const getStandaloneSnapshot = () =>
  window.matchMedia(STANDALONE_QUERY).matches ||
  // iOS Safari legacy
  ("standalone" in window.navigator &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

const getServerSnapshot = () => false;

/**
 * True on narrow viewports (< 768px).
 *
 * `useSyncExternalStore` keeps this hydration-safe: React renders the server
 * snapshot (`false`) during hydration and re-renders with the real value
 * immediately after, without a mismatch warning.
 *
 * Layout must NOT depend on this — it is `false` on the server, so anything
 * affecting first paint belongs in a Tailwind breakpoint. Use this only for
 * behaviour: sheet vs dialog, immersive mode, event wiring.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    subscribeTo(MOBILE_QUERY),
    getMobileSnapshot,
    getServerSnapshot
  );
}

/** True when running as an installed PWA. Standalone on a large screen stays desktop. */
export function useIsStandalone(): boolean {
  return useSyncExternalStore(
    subscribeTo(STANDALONE_QUERY),
    getStandaloneSnapshot,
    getServerSnapshot
  );
}