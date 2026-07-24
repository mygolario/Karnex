export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
};

const STORAGE_KEY = "karnex_utm";
const COOKIE_NAME = "karnex_utm";
/** First-touch attribution window */
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

type StoredUtm = UtmParams & { capturedAt: number };

function parseStored(raw: string | null): StoredUtm | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StoredUtm;
    if (!parsed || typeof parsed.capturedAt !== "number") return null;
    if (Date.now() - parsed.capturedAt > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.slice(name.length + 1));
}

function writeCookie(name: string, value: string, maxAgeSeconds: number) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}

function toUtmParams(stored: StoredUtm): UtmParams {
  const out: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = stored[key];
    if (typeof value === "string" && value.length > 0) {
      out[key] = value;
    }
  }
  return out;
}

/** Read UTM params from the current URL (no persistence). */
export function readUtmFromSearch(search: string): UtmParams {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search
  );
  const out: UtmParams = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) out[key] = value;
  }
  return out;
}

function hasAnyUtm(utm: UtmParams): boolean {
  return UTM_KEYS.some((key) => Boolean(utm[key]));
}

/**
 * Capture first-touch UTMs from the landing URL into localStorage + cookie.
 * Does not overwrite an existing unexpired first-touch attribution.
 */
export function captureUtmFromUrl(search?: string): UtmParams {
  if (typeof window === "undefined") return {};

  const existing = getStoredUtm();
  if (existing && hasAnyUtm(existing)) return existing;

  const fromUrl = readUtmFromSearch(
    search ?? window.location.search
  );
  if (!hasAnyUtm(fromUrl)) return existing ?? {};

  const stored: StoredUtm = {
    ...fromUrl,
    capturedAt: Date.now(),
  };
  const serialized = JSON.stringify(stored);
  try {
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // ignore quota / private mode
  }
  writeCookie(COOKIE_NAME, serialized, Math.floor(TTL_MS / 1000));
  return fromUrl;
}

/** Return persisted first-touch UTMs (or empty). */
export function getStoredUtm(): UtmParams {
  if (typeof window === "undefined") return {};

  const fromLs = parseStored(
    (() => {
      try {
        return localStorage.getItem(STORAGE_KEY);
      } catch {
        return null;
      }
    })()
  );
  if (fromLs) return toUtmParams(fromLs);

  const fromCookie = parseStored(readCookie(COOKIE_NAME));
  if (fromCookie) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fromCookie));
    } catch {
      // ignore
    }
    return toUtmParams(fromCookie);
  }

  return {};
}

/** Merge stored UTMs into event properties (does not overwrite explicit keys). */
export function withUtmProps(
  props?: Record<string, string | number | boolean | undefined>
): Record<string, string | number | boolean | undefined> {
  const utm = getStoredUtm();
  return { ...utm, ...props };
}
