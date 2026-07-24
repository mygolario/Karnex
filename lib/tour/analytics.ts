import {
  trackProductEvent,
  type ProductAnalyticsPayload,
} from "@/lib/analytics/product";

type TourAnalyticsPayload = ProductAnalyticsPayload;

function capture(event: string, properties?: TourAnalyticsPayload) {
  trackProductEvent(event, properties);
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
  // Dashboard tour completion = primary activation signal for the week-1 funnel
  if (tourId === "dashboard") {
    capture("activation_completed", {
      source: "dashboard_tour",
      total_steps: totalSteps,
    });
  }
}

export function trackChecklistItemCompleted(itemId: string, tourId: string) {
  capture("tour_checklist_completed", { item_id: itemId, tour_id: tourId });
}

export function trackWelcomeCompleted(persona: string) {
  capture("tour_welcome_completed", { persona });
}

export function trackOnboardingCompleted(
  persona: string,
  experienceLevel: string,
  primaryGoal: string
) {
  capture("tour_onboarding_completed", {
    persona,
    experience_level: experienceLevel,
    primary_goal: primaryGoal,
  });
}

export function trackBeaconClicked(targetId: string) {
  capture("tour_beacon_clicked", { target_id: targetId });
}

export function trackBeaconDismissed(targetId: string) {
  capture("tour_beacon_dismissed", { target_id: targetId });
}

export function trackRepersonalizationAccepted(reason: string) {
  capture("tour_repersonalization_accepted", { reason });
}

export function trackRepersonalizationDismissed(reason: string) {
  capture("tour_repersonalization_dismissed", { reason });
}

export function trackReengagementNudgeShown(tourId: string) {
  capture("tour_reengagement_nudge_shown", { tour_id: tourId });
}

export function trackReengagementNudgeAccepted(tourId: string) {
  capture("tour_reengagement_nudge_accepted", { tour_id: tourId });
}
