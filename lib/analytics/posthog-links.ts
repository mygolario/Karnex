/** Karnex PostHog EU project — used for founder deep-links from admin. */
export const POSTHOG_PROJECT_ID = 107791;
export const POSTHOG_APP_HOST = "https://eu.posthog.com";

export function posthogPersonSearchUrl(email: string): string {
  const q = encodeURIComponent(email.trim());
  return `${POSTHOG_APP_HOST}/project/${POSTHOG_PROJECT_ID}/persons#q=${q}`;
}

export function posthogReplayHomeUrl(): string {
  return `${POSTHOG_APP_HOST}/project/${POSTHOG_PROJECT_ID}/replay`;
}

export function posthogFunnelDashboardUrl(): string {
  return `${POSTHOG_APP_HOST}/project/${POSTHOG_PROJECT_ID}/dashboard/847356`;
}

export function posthogLiveEventsUrl(): string {
  return `${POSTHOG_APP_HOST}/project/${POSTHOG_PROJECT_ID}/activity/explore`;
}
