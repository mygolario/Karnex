type TourAnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: TourAnalyticsPayload) => void;
    };
  }
}

function capture(event: string, properties?: TourAnalyticsPayload) {
  if (typeof window === "undefined") return;
  try {
    window.posthog?.capture(event, properties);
  } catch {
    // PostHog optional
  }
}

export function trackTourStarted(tourId: string, source: string) {
  capture("tour_started", { tour_id: tourId, source });
}

export function trackTourStep(tourId: string, stepId: string, stepIndex: number) {
  capture("tour_step", { tour_id: tourId, step_id: stepId, step_index: stepIndex });
}

export function trackTourSkipped(tourId: string, stepIndex: number) {
  capture("tour_skipped", { tour_id: tourId, step_index: stepIndex });
}

export function trackTourCompleted(tourId: string, totalSteps: number) {
  capture("tour_completed", { tour_id: tourId, total_steps: totalSteps });
}

export function trackChecklistItemCompleted(itemId: string, tourId: string) {
  capture("tour_checklist_completed", { item_id: itemId, tour_id: tourId });
}

export function trackWelcomeCompleted(persona: string) {
  capture("tour_welcome_completed", { persona });
}
