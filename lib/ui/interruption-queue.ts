"use client";

import { useEffect, useSyncExternalStore } from "react";

/**
 * Coordinates the app's attention-grabbing overlays so at most one shows at a
 * time. Without this they all mount independently and stack on top of each
 * other — and on top of the mobile bottom nav.
 *
 * Higher number wins. A tour outranks everything because the user asked for it.
 */
export const INTERRUPTION_PRIORITY = {
  tour: 100,
  "genesis-coach": 80,
  "pwa-modal": 60,
  "cookie-banner": 50,
  "pwa-banner": 40,
  "tour-repersonalize": 20,
  "tour-nudge": 10,
} as const;

export type InterruptionId = keyof typeof INTERRUPTION_PRIORITY;

const active = new Set<InterruptionId>();
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getHolder(): InterruptionId | null {
  let best: InterruptionId | null = null;
  for (const id of active) {
    if (best === null || INTERRUPTION_PRIORITY[id] > INTERRUPTION_PRIORITY[best]) {
      best = id;
    }
  }
  return best;
}

const getServerHolder = () => null;

function claim(id: InterruptionId) {
  if (active.has(id)) return;
  active.add(id);
  emit();
}

function release(id: InterruptionId) {
  if (active.delete(id)) emit();
}

/**
 * Ask for the single interruption slot.
 *
 * @param wants whether the caller currently has something to show
 * @returns true only when this caller outranks every other pending overlay
 */
export function useInterruptionSlot(id: InterruptionId, wants: boolean): boolean {
  useEffect(() => {
    if (!wants) return;
    claim(id);
    return () => release(id);
  }, [id, wants]);

  const holder = useSyncExternalStore(subscribe, getHolder, getServerHolder);
  return wants && holder === id;
}

const SESSION_KEY = "karnex-interruptions-shown";

function readSessionShown(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** True if `id` has already had its turn during this browser session. */
export function wasShownThisSession(id: InterruptionId): boolean {
  return readSessionShown().includes(id);
}

/** Caps an overlay to a single appearance per session. */
export function markShownThisSession(id: InterruptionId): void {
  if (typeof window === "undefined") return;
  const shown = readSessionShown();
  if (shown.includes(id)) return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify([...shown, id]));
  } catch {
    // Private-mode sessionStorage can throw; a repeated nudge is acceptable.
  }
}
