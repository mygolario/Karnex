import { track as vercelTrack } from "@vercel/analytics";
import { SIGNUP_COOKIE } from "@/lib/analytics/constants";
import { getStoredUtm, withUtmProps } from "@/lib/analytics/utm";

export { SIGNUP_COOKIE };

export type ProductAnalyticsPayload = Record<
  string,
  string | number | boolean | undefined
>;

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: ProductAnalyticsPayload) => void;
      identify: (
        distinctId: string,
        properties?: Record<string, string | number | boolean | null | undefined>
      ) => void;
      register?: (properties: Record<string, string | number | boolean | undefined>) => void;
      reset?: () => void;
    };
  }
}

interface QueuedEvent {
  event: string;
  properties?: ProductAnalyticsPayload;
}

/** Conversion events also mirrored to Vercel Analytics custom Events panel. */
const VERCEL_EVENT_ALLOWLIST = new Set([
  "signup_completed",
  "project_created",
  "activation_completed",
  "checkout_started",
  "payment_completed",
  "feedback_submitted",
]);

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
 * Guaranteed-delivery PostHog capture: queues until the SDK is ready.
 */
function capturePostHog(event: string, properties?: ProductAnalyticsPayload) {
  if (typeof window === "undefined") return;

  if (window.posthog) {
    try {
      window.posthog.capture(event, properties);
      return;
    } catch {
      // fall through to queue
    }
  }

  queue.push({ event, properties });
  if (queue.length > MAX_QUEUE) queue.shift();
  scheduleFlush();
}

function trackVercel(event: string, properties?: ProductAnalyticsPayload) {
  if (!VERCEL_EVENT_ALLOWLIST.has(event)) return;
  try {
    const clean: Record<string, string | number | boolean> = {};
    if (properties) {
      for (const [key, value] of Object.entries(properties)) {
        if (value === undefined) continue;
        clean[key] = value;
      }
    }
    vercelTrack(event, clean);
  } catch {
    // never break UX
  }
}

/**
 * Product analytics: PostHog (+ queue) and Vercel track for conversion allowlist.
 * Always attaches first-touch UTM props when available.
 */
export function trackProductEvent(
  event: string,
  properties?: ProductAnalyticsPayload
) {
  if (typeof window === "undefined") return;

  const enriched = withUtmProps({
    path:
      typeof window !== "undefined" ? window.location.pathname : undefined,
    ...properties,
  });

  capturePostHog(event, enriched);
  trackVercel(event, enriched);
}

/** Identify the logged-in user in PostHog (no-op if SDK not loaded). */
export function identifyProductUser(
  distinctId: string,
  traits?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === "undefined" || !window.posthog?.identify) return;
  try {
    const utm = getStoredUtm();
    window.posthog.identify(distinctId, {
      ...utm,
      ...traits,
    });
  } catch {
    // ignore
  }
}

/** Clear PostHog identity on sign-out. */
export function resetProductUser() {
  if (typeof window === "undefined" || !window.posthog?.reset) return;
  try {
    window.posthog.reset();
  } catch {
    // ignore
  }
}

/** Register UTM (and other) super-properties for all subsequent PostHog events. */
export function registerProductSuperProperties(
  properties: Record<string, string | number | boolean | undefined>
) {
  if (typeof window === "undefined" || !window.posthog?.register) return;
  try {
    const clean: Record<string, string | number | boolean> = {};
    for (const [key, value] of Object.entries(properties)) {
      if (value === undefined) continue;
      clean[key] = value;
    }
    if (Object.keys(clean).length === 0) return;
    window.posthog.register(clean);
  } catch {
    // ignore
  }
}

/** Session flag so signup_completed fires once per browser signup. */
const SIGNUP_FLAG = "karnex_signup_tracked";

export function markSignupCompletedOnce(
  properties?: ProductAnalyticsPayload
): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(SIGNUP_FLAG) === "1") return false;
    sessionStorage.setItem(SIGNUP_FLAG, "1");
  } catch {
    // still fire once this call
  }
  trackProductEvent("signup_completed", properties);
  return true;
}

export function consumeSignupCookieAndTrack(): boolean {
  if (typeof document === "undefined") return false;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${SIGNUP_COOKIE}=`));
  if (!match) return false;
  // Clear cookie
  document.cookie = `${SIGNUP_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  return markSignupCompletedOnce({ method: "oauth_or_confirm" });
}
