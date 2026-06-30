import type { LocationAnalysis } from "@/lib/db";

const KEY_PREFIX = "karnex-location-session";

export interface LocationSessionState {
  city: string;
  address: string;
  businessDescription: string;
  activeTab: string;
  /** Demo or unsaved preview — restored until a real analysis is persisted */
  draftAnalysis?: LocationAnalysis | null;
}

function storageKey(projectId: string) {
  return `${KEY_PREFIX}:${projectId}`;
}

export function readLocationSession(projectId: string): LocationSessionState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(storageKey(projectId));
    return raw ? (JSON.parse(raw) as LocationSessionState) : null;
  } catch {
    return null;
  }
}

export function writeLocationSession(projectId: string, state: LocationSessionState) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(storageKey(projectId), JSON.stringify(state));
  } catch {
    /* quota / private mode */
  }
}

export function clearLocationDraft(projectId: string) {
  const existing = readLocationSession(projectId);
  if (!existing) return;
  writeLocationSession(projectId, { ...existing, draftAnalysis: null });
}
