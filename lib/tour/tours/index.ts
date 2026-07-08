import type { TourDefinition } from "../types";
import { dashboardTour } from "./dashboard";
import { roadmapTour } from "./roadmap";
import { canvasTour } from "./canvas";
import { copilotTour } from "./copilot";
import { calendarTour } from "./calendar";
import { scriptsTour } from "./scripts";
import { sponsorshipTour } from "./sponsorship";
import { pitchDeckTour } from "./pitch-deck";
import { locationAnalyzerTour } from "./location-analyzer";
import { whatsNewTour } from "./whats-new";

/**
 * All built-in tours, one file per tour under lib/tour/tours/ for maintainability.
 * Order here also drives display order in the Tour Hub / launcher.
 */
export const TOUR_REGISTRY: Record<string, TourDefinition> = {
  dashboard: dashboardTour,
  roadmap: roadmapTour,
  canvas: canvasTour,
  copilot: copilotTour,
  calendar: calendarTour,
  scripts: scriptsTour,
  sponsorship: sponsorshipTour,
  "pitch-deck": pitchDeckTour,
  "location-analyzer": locationAnalyzerTour,
  "whats-new": whatsNewTour,
};
