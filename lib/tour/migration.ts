import type { TourPersistedState } from "./types";

const STORAGE_PREFIX = "karnex-tour-v2";
const LEGACY_PREFIX = "karnex_completed_tours";

export function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}_${userId}`;
}

export function defaultPersistedState(): TourPersistedState {
  return {
    completedTours: [],
    skippedTours: [],
    completedChecklistItems: [],
    dismissedBeacons: [],
    persona: null,
    hasSeenWelcome: false,
    disableAutoStart: false,
    activeTourId: null,
    activeStepIndex: 0,
    lastSeenWhatsNewVersion: null,
  };
}

export function loadPersistedState(userId: string): TourPersistedState {
  if (typeof window === "undefined") return defaultPersistedState();
  try {
    const key = getStorageKey(userId);
    const raw = localStorage.getItem(key);
    if (raw) {
      return { ...defaultPersistedState(), ...JSON.parse(raw) };
    }
    return migrateLegacyState(userId);
  } catch {
    return defaultPersistedState();
  }
}

export function savePersistedState(userId: string, state: TourPersistedState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(getStorageKey(userId), JSON.stringify(state));
}

function migrateLegacyState(userId: string): TourPersistedState {
  const state = defaultPersistedState();
  try {
    const userKey = `${LEGACY_PREFIX}_${userId}`;
    const guestKey = `${LEGACY_PREFIX}_guest`;
    const legacyRaw =
      localStorage.getItem(userKey) ?? localStorage.getItem(LEGACY_PREFIX) ?? localStorage.getItem(guestKey);
    if (legacyRaw) {
      const completed: string[] = JSON.parse(legacyRaw);
      state.completedTours = completed;
      state.hasSeenWelcome = completed.length > 0;
      state.completedChecklistItems = completed.map((id) => `checklist-${id}`);
    }
  } catch {
    // ignore
  }
  return state;
}

export function persistPartial(userId: string, partial: Partial<TourPersistedState>) {
  const current = loadPersistedState(userId);
  const next = { ...current, ...partial };
  savePersistedState(userId, next);
  return next;
}
