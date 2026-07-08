import "server-only";
import { fetchLocationData } from "./data-adapters";
import {
  buildLocationProjectContextBlock,
  computeCannibalization,
} from "./project-context-block";
import { handleAnalyzeLocation } from "@/lib/ai/generate-handlers";
import type { LocationAnalysis } from "@/lib/db";

/**
 * Shared location-analysis pipeline used by both the `/api/ai-generate`
 * analyze-location action and the Copilot `analyze_location` tool, so the
 * agent runs a real analysis instead of redirecting to the UI.
 */
export async function runLocationAnalysis(params: {
  city: string;
  address: string;
  businessDescription?: string;
  businessCategory?: string;
  radius?: number;
  priceTier?: string;
  footfallDependency?: string;
  rentBudget?: number;
  activeProject?: Record<string, unknown>;
  userId?: string;
  projectId?: string;
  modelOverride?: string;
  coordinates?: { lat: number; lon: number };
  storefrontPhoto?: string;
}): Promise<Record<string, any>> {
  const {
    city,
    address,
    businessDescription,
    businessCategory,
    radius,
    priceTier = "mid",
    footfallDependency = "high",
    rentBudget = 0,
    activeProject,
    userId,
    projectId,
    modelOverride,
    coordinates,
    storefrontPhoto,
  } = params;

  const data = await fetchLocationData({
    city,
    address,
    businessDescription: businessDescription || String(activeProject?.overview || ""),
    businessCategory,
    radius,
    coordinates,
  });

  const projectContextBlock = buildLocationProjectContextBlock(activeProject);

  const json = await handleAnalyzeLocation(
    {
      userId,
      projectId,
      projectType: (activeProject?.projectType as string) || "startup",
      projectName: (activeProject?.projectName as string) || "",
      projectDescription:
        (activeProject?.overview as string) ||
        (activeProject?.tagline as string) ||
        "",
      projectAudience: (activeProject?.audience as string) || "",
      projectData: activeProject as Record<string, unknown> | undefined,
      city,
      address,
      radius: data.radius,
      priceTier,
      footfallDependency,
      rentBudget,
      businessCategory: data.categorySlug,
      businessDescription:
        businessDescription || String(activeProject?.overview || ""),
      osmDataBlock: data.osmDataBlock,
      projectContextBlock,
      storefrontPhoto,
    },
    modelOverride
  );

  json.coordinates = data.centerCoordinates;
  json.osmMeta = {
    landmark: data.landmark,
    buildingTags: data.buildingTags,
    mapillaryUrl: data.mapillaryUrl,
    categorySlug: data.categorySlug,
    provider: data.provider,
  };
  if (!json.catchment) {
    json.catchment = {
      radiusM: data.radius,
      poiDensity: data.poiDensity,
      transitStops: data.transitStops,
      confidence: "real",
    };
  }
  const cann = computeCannibalization(
    data.centerCoordinates.lat,
    data.centerCoordinates.lon,
    activeProject?.locationHistory as LocationAnalysis[] | undefined
  );
  if (!json.cannibalization) {
    json.cannibalization = { ...cann, confidence: "inferred" };
  }

  return json;
}
