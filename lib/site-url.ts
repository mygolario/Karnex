/** Canonical site URL used across metadata, sitemap, and robots. */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.karnex.ir";
}
