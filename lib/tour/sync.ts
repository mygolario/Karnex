"use client";

import type { TourPersistedState } from "./types";

export interface RemoteTourProgress {
  persisted: TourPersistedState;
  gamification: { xp: number; level: number; streak: number; lastActiveDate: string | null };
}

const SYNC_DEBOUNCE_MS = 1500;
let pendingPatch: Record<string, unknown> = {};
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
let syncEnabled = false;

/** Fetch the server copy of tour progress. Returns null for guests or on failure. */
export async function fetchRemoteTourProgress(): Promise<RemoteTourProgress | null> {
  try {
    const res = await fetch("/api/tour/progress", { method: "GET" });
    if (!res.ok) return null;
    const data = await res.json();
    return data.progress ?? null;
  } catch {
    return null;
  }
}

function flush() {
  if (!syncEnabled || Object.keys(pendingPatch).length === 0) return;
  const patch = pendingPatch;
  pendingPatch = {};
  fetch("/api/tour/progress", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  }).catch(() => {
    // Background sync is best-effort; localStorage remains the source of truth locally.
  });
}

/** Enable/disable background sync (disabled for guests, since there's no account to sync to). */
export function setTourSyncEnabled(enabled: boolean) {
  syncEnabled = enabled;
  if (!enabled) {
    pendingPatch = {};
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = null;
  }
}

/** Queue a partial update to be pushed to the server after a short debounce. */
export function queueTourProgressSync(patch: Record<string, unknown>) {
  if (!syncEnabled) return;
  pendingPatch = { ...pendingPatch, ...patch };
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(flush, SYNC_DEBOUNCE_MS);
}

/** Immediately flush any pending changes (e.g. on tab close). */
export function flushTourProgressSync() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = null;
  flush();
}

/** Merge a server snapshot with the local one, preferring whichever was updated more recently. */
export function reconcilePersistedState(
  local: TourPersistedState,
  remote: TourPersistedState
): TourPersistedState {
  if (remote.updatedAt > local.updatedAt) {
    return {
      ...remote,
      // Active tour/step is a transient, single-device concept — never resume it from another device.
      activeTourId: local.activeTourId,
      activeStepIndex: local.activeStepIndex,
    };
  }
  return local;
}
