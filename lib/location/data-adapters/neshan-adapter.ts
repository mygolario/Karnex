import "server-only";
import {
  inferCategoryFromText,
  suggestRadius,
} from "../osm-tags";
import type { OsmFetchResult } from "./osm-adapter";

/**
 * Neshan (نشان) Iranian map adapter — mirrors the OSM adapter interface so the
 * Geo-Location pipeline can use Iranian-specific data (Persian reverse geocode,
 * local POI database) instead of OSM's sparse Iran coverage.
 *
 * API docs: https://platform.neshan.org/api
 * Auth header: `Api-Key: <NESHAN_API_KEY>`.
 * Base: https://api.neshan.org/v2/... (geocoding/reverse) and /v1/search (places).
 */

const NESHAN_BASE = "https://api.neshan.org";

function neshanHeaders(): Record<string, string> {
  return {
    "Api-Key": process.env.NESHAN_API_KEY || "",
    "Content-Type": "application/json",
  };
}

export function isNeshanConfigured(): boolean {
  return !!process.env.NESHAN_API_KEY;
}

export interface NeshanReverseResult {
  address?: string;
  neighbourhood?: string;
  city?: string;
  county?: string;
  region?: string;
  raw?: Record<string, unknown>;
}

/**
 * Reverse geocode: lat,lon → Persian address.
 */
export async function neshanReverseGeocode(
  lat: number,
  lon: number
): Promise<NeshanReverseResult | null> {
  if (!isNeshanConfigured()) return null;
  try {
    const url = `${NESHAN_BASE}/v2/reverse?lat=${lat}&lng=${lon}`;
    const res = await fetch(url, {
      headers: neshanHeaders(),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.status !== "OK" && data?.address == null) return null;
    return {
      address: data.address,
      neighbourhood: data.neighbourhood,
      city: data.city,
      county: data.county,
      region: data.region,
      raw: data,
    };
  } catch {
    return null;
  }
}

/**
 * Forward geocode: address + city → coordinates.
 */
export async function neshanForwardGeocode(
  address: string,
  city: string
): Promise<{ lat: number; lon: number } | null> {
  if (!isNeshanConfigured()) return null;
  try {
    const term = `${address} ${city}`.trim();
    // v1 search needs a reference point; use Tehran as default center.
    const refLat = 35.6892;
    const refLng = 51.389;
    const url = `${NESHAN_BASE}/v1/search?term=${encodeURIComponent(
      term
    )}&lat=${refLat}&lng=${refLng}`;
    const res = await fetch(url, {
      headers: neshanHeaders(),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const item = data?.items?.[0];
    if (!item?.location) return null;
    // Neshan v1 search returns location as { x: lng, y: lat }.
    const loc = item.location;
    const lat = loc.y ?? loc.lat;
    const lon = loc.x ?? loc.lng;
    if (typeof lat !== "number" || typeof lon !== "number") return null;
    return { lat, lon };
  } catch {
    return null;
  }
}

/**
 * Places nearby: competitor POIs by category term around a center.
 */
export async function neshanPlacesNearby(
  lat: number,
  lon: number,
  term: string
): Promise<{ name: string; lat: number; lon: number }[]> {
  if (!isNeshanConfigured() || !term) return [];
  try {
    const url = `${NESHAN_BASE}/v1/search?term=${encodeURIComponent(
      term
    )}&lat=${lat}&lng=${lon}`;
    const res = await fetch(url, {
      headers: neshanHeaders(),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items: any[] = Array.isArray(data?.items) ? data.items : [];
    const seen = new Set<string>();
    const out: { name: string; lat: number; lon: number }[] = [];
    for (const it of items) {
      const name = it.title || it.name;
      const loc = it.location;
      const pLat = loc?.y ?? loc?.lat;
      const pLon = loc?.x ?? loc?.lng;
      if (name && typeof pLat === "number" && typeof pLon === "number" && !seen.has(name)) {
        seen.add(name);
        out.push({ name, lat: pLat, lon: pLon });
      }
    }
    return out;
  } catch {
    return [];
  }
}

/**
 * Full location fetch via Neshan, returning the same shape as the OSM adapter so
 * the analysis pipeline can consume either interchangeably.
 */
export async function fetchLocationNeshanData(params: {
  city: string;
  address: string;
  businessDescription?: string;
  businessCategory?: string;
  radius?: number;
  /** Optional pre-resolved coordinates (e.g. from a dropped pin). */
  coordinates?: { lat: number; lon: number };
}): Promise<OsmFetchResult | null> {
  if (!isNeshanConfigured()) return null;

  const categorySlug = inferCategoryFromText(
    params.businessDescription || "",
    params.businessCategory
  );
  const radius = params.radius ?? suggestRadius(categorySlug);

  // Resolve center: prefer provided coordinates, else forward-geocode the address.
  let center: { lat: number; lon: number } | undefined = params.coordinates;
  if (!center) {
    center = (await neshanForwardGeocode(params.address, params.city)) || undefined;
  }
  if (!center) return null; // cannot proceed without coordinates → let caller fall back to OSM

  const reverse = await neshanReverseGeocode(center.lat, center.lon);
  const searchTerm = params.businessDescription || categorySlug || params.businessCategory || "";
  const competitors = await neshanPlacesNearby(center.lat, center.lon, searchTerm);

  const osmLines = competitors
    .slice(0, 12)
    .map((c) => `- ${c.name} (${c.lat.toFixed(5)}, ${c.lon.toFixed(5)})`)
    .join("\n");

  const osmDataBlock = `[داده نقشه نشان — واقعی، ایران]
مختصات: ${center.lat}, ${center.lon}
شعاع تحلیل: ${radius}m
دسته: ${categorySlug}
آدرس معکوس (نشان): ${reverse?.address || "نامشخص"}
محله: ${reverse?.neighbourhood || "نامشخص"}
شهر: ${reverse?.city || params.city}
چگالی POI در شعاع: ${competitors.length}
رقبای شناسایی‌شده (نشان):
${osmLines || "هیچ رقیب یافت نشد"}`;

  const mapillaryUrl = `https://www.mapillary.com/app/?lat=${center.lat}&lng=${center.lon}&z=17`;

  return {
    osmDataBlock,
    centerCoordinates: center,
    competitorsList: competitors,
    radius,
    categorySlug,
    poiDensity: competitors.length,
    transitStops: 0, // Neshan doesn't expose transit stops in v1 search; OSM fallback fills this
    buildingTags: [],
    landmark: reverse?.neighbourhood,
    mapillaryUrl,
    provider: "neshan",
  };
}
