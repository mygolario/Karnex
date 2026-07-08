import { TOUR_VERSION } from "./registry";
import type { TourPersistedState } from "./types";

export interface AutoStartQuery {
  initialized: boolean;
  showWelcome: boolean;
  persisted: TourPersistedState;
}

export interface AutoStartCandidate {
  tourId: string;
  force?: boolean;
}

/**
 * Single source of truth for "what should auto-start on the dashboard shell".
 * Consolidates what used to be an ad-hoc 2s timer duplicated across components.
 */
export function getGlobalAutoStartCandidate(query: AutoStartQuery): AutoStartCandidate | null {
  const { initialized, showWelcome, persisted } = query;
  if (!initialized || showWelcome || persisted.disableAutoStart) return null;

  const dashboardSeen =
    persisted.completedTours.includes("dashboard") ||
    (persisted.skippedTours ?? []).includes("dashboard");

  if (!dashboardSeen) {
    return { tourId: "dashboard" };
  }

  const whatsNewEligible =
    persisted.lastSeenWhatsNewVersion !== TOUR_VERSION &&
    !(persisted.skippedTours ?? []).includes("whats-new");

  if (whatsNewEligible) {
    return { tourId: "whats-new", force: true };
  }

  return null;
}

export interface PageAutoStartQuery {
  initialized: boolean;
  disableAutoStart: boolean;
  isTourOpen: boolean;
  hasSeenTour: boolean;
}

/** Should a per-page contextual tour (e.g. roadmap, canvas, copilot) auto-start? */
export function shouldAutoStartPageTour(query: PageAutoStartQuery): boolean {
  const { initialized, disableAutoStart, isTourOpen, hasSeenTour } = query;
  if (!initialized || disableAutoStart || isTourOpen || hasSeenTour) return false;
  return true;
}
