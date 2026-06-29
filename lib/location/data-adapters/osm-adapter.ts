import {
  buildOverpassCompetitorQuery,
  inferCategoryFromText,
  suggestRadius,
} from "../osm-tags";

const OVERPASS_HEADERS = {
  "User-Agent": "Karnex-App/1.0",
  "Content-Type": "application/x-www-form-urlencoded",
};

async function overpassFetch(query: string, timeoutMs = 8000): Promise<Response> {
  return fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: OVERPASS_HEADERS,
    body: "data=" + encodeURIComponent(query),
    signal: AbortSignal.timeout(timeoutMs),
  });
}

export interface OsmFetchResult {
  osmDataBlock: string;
  centerCoordinates: { lat: number; lon: number };
  competitorsList: { name: string; lat: number; lon: number }[];
  radius: number;
  categorySlug: string;
  poiDensity: number;
  transitStops: number;
  buildingTags: string[];
  landmark?: string;
  mapillaryUrl?: string;
}

export async function fetchLocationOsmData(params: {
  city: string;
  address: string;
  businessDescription?: string;
  businessCategory?: string;
  radius?: number;
}): Promise<OsmFetchResult> {
  const fetchStart = Date.now();
  const categorySlug = inferCategoryFromText(
    params.businessDescription || "",
    params.businessCategory
  );
  const radius = params.radius ?? suggestRadius(categorySlug);
  let centerCoordinates = { lat: 35.6892, lon: 51.3890 };
  const competitorsList: { name: string; lat: number; lon: number }[] = [];
  let poiDensity = 0;
  let transitStops = 0;
  const buildingTags: string[] = [];
  let landmark: string | undefined;

  const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    params.address + ", " + params.city + ", Iran"
  )}&format=json&limit=1&addressdetails=1`;

  let geoData: Array<{
    lat: string;
    lon: string;
    display_name?: string;
    address?: Record<string, string>;
  }> | null = null;

  try {
    const geoStart = Date.now();
    const geoRes = await fetch(geoUrl, {
      headers: { "User-Agent": "Karnex-App/1.0" },
    });
    if (geoRes.ok) geoData = await geoRes.json();
    // #region agent log
    fetch('http://127.0.0.1:7443/ingest/9ae0ee8b-1865-4481-b3b2-37ccf5719385',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'50a938'},body:JSON.stringify({sessionId:'50a938',location:'osm-adapter.ts:nominatim',message:'nominatim done',data:{geoMs:Date.now()-geoStart,found:!!geoData?.length},timestamp:Date.now(),hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
  } catch (e) {
    console.error("Geocoding failed:", e);
  }

  if (geoData?.length) {
    const lat = parseFloat(geoData[0].lat);
    const lon = parseFloat(geoData[0].lon);
    centerCoordinates = { lat, lon };
    landmark =
      geoData[0].address?.neighbourhood ||
      geoData[0].address?.suburb ||
      geoData[0].address?.road;

    const query = buildOverpassCompetitorQuery(lat, lon, radius, categorySlug);
    const infraQuery = `[out:json][timeout:10];(node["highway"="bus_stop"](around:${radius},${lat},${lon});node["railway"="station"](around:${radius * 2},${lat},${lon});way["building"](around:80,${lat},${lon}););out tags center;`;

    try {
      const [overpassRes, infraRes] = await Promise.all([
        overpassFetch(query),
        overpassFetch(infraQuery),
      ]);

      // #region agent log
      fetch('http://127.0.0.1:7443/ingest/9ae0ee8b-1865-4481-b3b2-37ccf5719385',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'50a938'},body:JSON.stringify({sessionId:'50a938',location:'osm-adapter.ts:overpass-parallel',message:'parallel overpass done',data:{competitorsStatus:overpassRes.status,infraStatus:infraRes.status,totalOsmMs:Date.now()-fetchStart},timestamp:Date.now(),hypothesisId:'H1',runId:'post-fix'})}).catch(()=>{});
      // #endregion

      if (overpassRes.ok) {
        const overpassJson = await overpassRes.json();
        const seen = new Set<string>();
        overpassJson.elements?.forEach((el: Record<string, unknown>) => {
          const tags = el.tags as Record<string, string> | undefined;
          const name = tags?.["name:fa"] || tags?.name;
          if (name && !seen.has(name)) {
            seen.add(name);
            competitorsList.push({
              name,
              lat:
                (el.lat as number) ||
                (el.center as { lat: number })?.lat ||
                lat,
              lon:
                (el.lon as number) ||
                (el.center as { lon: number })?.lon ||
                lon,
            });
          }
        });
        poiDensity = overpassJson.elements?.length ?? 0;
      }

      if (infraRes.ok) {
        const infraJson = await infraRes.json();
        infraJson.elements?.forEach((el: Record<string, unknown>) => {
          const tags = el.tags as Record<string, string> | undefined;
          if (tags?.highway === "bus_stop" || tags?.railway === "station") {
            transitStops += 1;
          }
          if (tags?.building && buildingTags.length < 5) {
            buildingTags.push(`${tags.building}${tags["building:levels"] ? ` (${tags["building:levels"]} طبقه)` : ""}`);
          }
        });
      }
    } catch (e) {
      console.error("OSM parallel fetch error:", e);
    }
  }

  const osmLines = competitorsList
    .slice(0, 12)
    .map((c) => `- ${c.name} (${c.lat.toFixed(5)}, ${c.lon.toFixed(5)})`)
    .join("\n");

  const osmDataBlock = `[داده نقشه OSM — واقعی]
مختصات: ${centerCoordinates.lat}, ${centerCoordinates.lon}
شعاع تحلیل: ${radius}m
دسته OSM: ${categorySlug}
چگالی POI در شعاع: ${poiDensity}
ایستگاه حمل‌ونقل نزدیک: ${transimentLabel(transitStops)}
برچسب ساختمان: ${buildingTags.join(" | ") || "نامشخص"}
رقبای شناسایی‌شده:
${osmLines || "هیچ رقیب نام‌دار یافت نشد"}`;

  const mapillaryUrl = `https://www.mapillary.com/app/?lat=${centerCoordinates.lat}&lng=${centerCoordinates.lon}&z=17`;

  return {
    osmDataBlock,
    centerCoordinates,
    competitorsList,
    radius,
    categorySlug,
    poiDensity,
    transitStops,
    buildingTags,
    landmark,
    mapillaryUrl,
  };
}

function transimentLabel(count: number): string {
  if (count >= 5) return `${count} (بالا)`;
  if (count >= 2) return `${count} (متوسط)`;
  return `${count} (پایین)`;
}
