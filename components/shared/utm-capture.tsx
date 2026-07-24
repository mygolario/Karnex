"use client";

import { useEffect } from "react";
import { captureUtmFromUrl } from "@/lib/analytics/utm";

/** Persist first-touch UTMs on every landing (independent of analytics consent). */
export function UtmCapture() {
  useEffect(() => {
    captureUtmFromUrl();
  }, []);
  return null;
}
