import "server-only";
import { fetchLocationOsmData, OsmFetchResult } from "./osm-adapter";
import { fetchLocationNeshanData, isNeshanConfigured } from "./neshan-adapter";

export type { OsmFetchResult } from "./osm-adapter";
export { neshanReverseGeocode, isNeshanConfigured } from "./neshan-adapter";

/**
 * Unified location-data fetch: try Neshan first (Iranian-accurate, Persian
 * reverse geocode, local POI DB), fall back to OSM on failure/empty/no-key.
 * Merges OSM transit/building context on top of a Neshan success so the AI
 * prompt keeps transit-stop density (which Neshan v1 search doesn't expose).
 */
export async function fetchLocationData(params: {
  city: string;
  address: string;
  businessDescription?: string;
  businessCategory?: string;
  radius?: number;
  coordinates?: { lat: number; lon: number };
}): Promise<OsmFetchResult> {
  if (isNeshanConfigured()) {
    try {
      const neshanResult = await fetchLocationNeshanData(params);
      if (neshanResult) {
        // Enrich with OSM transit/building tags (cheap, parallel) so the prompt
        // still has transit-stop density without re-doing competitor search.
        try {
          const osmSupplement = await fetchLocationOsmData({
            city: params.city,
            address: params.address,
            businessDescription: params.businessDescription,
            businessCategory: params.businessCategory,
            radius: params.radius,
          });
          if (neshanResult.transitStops === 0 && osmSupplement.transitStops > 0) {
            neshanResult.transitStops = osmSupplement.transitStops;
          }
          if (neshanResult.buildingTags.length === 0 && osmSupplement.buildingTags.length > 0) {
            neshanResult.buildingTags = osmSupplement.buildingTags;
          }
          // Merge any OSM competitors not already found by Neshan (dedup by name).
          const seen = new Set(neshanResult.competitorsList.map((c) => c.name));
          for (const c of osmSupplement.competitorsList) {
            if (!seen.has(c.name)) {
              seen.add(c.name);
              neshanResult.competitorsList.push(c);
            }
          }
        } catch {
          // OSM supplement is best-effort; Neshan result stands alone if it fails.
        }
        return neshanResult;
      }
    } catch (err) {
      console.warn("[location] Neshan adapter failed, falling back to OSM:", err);
    }
  }

  // Fallback: pure OSM.
  return fetchLocationOsmData(params);
}
