"use client";

import { TourOverlay } from "./tour-overlay";
import { TourWelcome } from "./tour-welcome";
import { TourCelebration } from "./tour-celebration";

/** Mount all global tour UI layers */
export function TourRoot() {
  return (
    <>
      <TourOverlay />
      <TourWelcome />
      <TourCelebration />
    </>
  );
}
