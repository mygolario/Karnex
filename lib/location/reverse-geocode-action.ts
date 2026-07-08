"use server";

import { neshanReverseGeocode, isNeshanConfigured } from "./data-adapters/neshan-adapter";

/**
 * Reverse-geocode a dropped pin into a real Persian address via Neshan.
 * Used by the Location workspace so pin-drop analysis uses a human-readable
 * address instead of raw "lat, lon" coordinates.
 */
export async function reverseGeocodeAction(
  lat: number,
  lon: number
): Promise<{ success: boolean; address?: string; neighbourhood?: string; city?: string }> {
  if (!isNeshanConfigured()) {
    return { success: false };
  }
  const result = await neshanReverseGeocode(lat, lon);
  if (!result?.address) return { success: false };
  return {
    success: true,
    address: result.address,
    neighbourhood: result.neighbourhood,
    city: result.city,
  };
}
