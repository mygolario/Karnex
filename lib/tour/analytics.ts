type TourAnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: TourAnalyticsPayload) => void;
    };
  }
}

interface QueuedEvent {
  event: string;
  properties?: TourAnalyticsPayload;
}

const MAX_QUEUE = 50;
const RETRY_INTERVAL_MS = 1000;
const MAX_WAIT_MS = 20000;

let queue: QueuedEvent[] = [];
let flushing = false;
let startedWaitingAt: number | null = null;

function flushQueue() {
  if (typeof window === "undefined" || !window.posthog) return;
  const pending = queue;
  queue = [];
  for (const item of pending) {
    try {
      window.posthog.capture(item.event, item.properties);
    } catch {
      // swallow — analytics must never break the product UX
    }
  }
}

function scheduleFlush() {
  if (flushing || typeof window === "undefined") return;
  flushing = true;
  startedWaitingAt = startedWaitingAt ?? Date.now();

  const tick = () => {
    if (window.posthog) {
      flushQueue();
      flushing = false;
      startedWaitingAt = null;
      return;
    }
    if (Date.now() - (startedWaitingAt ?? 0) > MAX_WAIT_MS) {
      // Give up waiting; drop the queue so it doesn't grow unbounded.
      queue = [];
      flushing = false;
      startedWaitingAt = null;
      return;
    }
    setTimeout(tick, RETRY_INTERVAL_MS);
  };

  setTimeout(tick, RETRY_INTERVAL_MS);
}

/**
 * Guaranteed-delivery event capture: queues events if PostHog hasn't
 * finished loading yet (common on first paint) and flushes once it's ready,
 * instead of silently dropping them like a plain `window.posthog?.capture`.
 */
function capture(event: string, properties?: TourAnalyticsPayload) {
  if (typeof window === "undefined") return;

  if (window.posthog) {
    try {
      window.posthog.capture(event, properties);
      return;
    } catch {
      // fall through to queue as a last resort
    }
  }

  queue.push({ event, properties });
  if (queue.length > MAX_QUEUE) queue.shift();
  scheduleFlush();
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
