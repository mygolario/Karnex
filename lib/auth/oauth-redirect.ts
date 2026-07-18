const DEFAULT_SITE_URL = "https://www.karnex.ir";

/** Canonical site origin for Supabase OAuth/email redirects (no trailing slash). */
export function getSiteOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;

  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return DEFAULT_SITE_URL;
}

/** Supabase OAuth callback URL passed as `redirectTo`. */
export function getOAuthRedirectUrl(nextPath: string): string {
  return `${getSiteOrigin()}/auth/callback?next=${encodeURIComponent(nextPath)}`;
}

/** Password recovery / email confirmation redirect target. */
export function getAuthConfirmRedirectUrl(type: "recovery" | "signup" = "recovery"): string {
  return `${getSiteOrigin()}/auth/confirm?type=${type}`;
}
