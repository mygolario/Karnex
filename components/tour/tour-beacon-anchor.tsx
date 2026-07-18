"use client";

import { useTourStore } from "@/lib/tour/store";
import { TourBeacon } from "./tour-beacon";
import { trackBeaconClicked, trackBeaconDismissed } from "@/lib/tour/analytics";
import { cn } from "@/lib/utils";

interface TourBeaconAnchorProps {
  /** Matches the element's data-tour-id and is used as the dismissedBeacons key */
  targetId: string;
  /** Tour to launch (defaults to targetId's own micro-step via startTour(tourId)) */
  tourId: string;
  label?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Wraps a feature control with a small pulsing coachmark that appears the first
 * time a user hasn't discovered that feature yet, and disappears forever once
 * clicked, dismissed, or the related tour has been seen.
 */
export function TourBeaconAnchor({
  targetId,
  tourId,
  label,
  className,
  children,
}: TourBeaconAnchorProps) {
  const { persisted, beaconsEnabled, isOpen, dismissBeacon, startTour } = useTourStore();

  const alreadySeen =
    persisted.dismissedBeacons.includes(targetId) ||
    persisted.completedTours.includes(tourId) ||
    (persisted.skippedTours ?? []).includes(tourId);

  const showBeacon = beaconsEnabled && !alreadySeen && !isOpen;

  return (
    <div className={cn("relative inline-flex", className)}>
      {children}
      {showBeacon && (
        <TourBeacon
          targetId={targetId}
          label={label}
          className="-top-1.5 -end-1.5"
          onClick={() => {
            trackBeaconClicked(targetId);
            dismissBeacon(targetId);
            startTour(tourId, 0, true);
          }}
        />
      )}
    </div>
  );
}

export function useDismissBeaconOnMount(targetId: string) {
  const dismissBeacon = useTourStore((s) => s.dismissBeacon);
  return () => {
    trackBeaconDismissed(targetId);
    dismissBeacon(targetId);
  };
}
