"use client";

import { TourOverlay } from "./tour-overlay";
import { TourWelcome } from "./tour-welcome";
import { TourCelebration } from "./tour-celebration";
import { useTourStore } from "@/lib/tour/store";
import { useInterruptionSlot } from "@/lib/ui/interruption-queue";

/** Mount all global tour UI layers */
export function TourRoot() {
  const isOpen = useTourStore((s) => s.isOpen);
  const showWelcome = useTourStore((s) => s.showWelcome);

  // A running tour holds the top-priority slot, so banners and nudges stay
  // out of the way until it finishes.
  useInterruptionSlot("tour", isOpen || showWelcome);

  return (
    <>
      <TourOverlay />
      <TourWelcome />
      <TourCelebration />
    </>
  );
}
