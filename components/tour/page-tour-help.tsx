"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CircleHelp } from "lucide-react";
import { useTourStore } from "@/lib/tour/store";
import { shouldAutoStartPageTour } from "@/lib/tour/trigger-queue";

interface PageTourHelpProps {
  tourId: string;
  autoStart?: boolean;
}

const AUTO_START_DELAY_MS = 1200;

/** Per-page help button to launch contextual tour */
export function PageTourHelp({ tourId, autoStart = true }: PageTourHelpProps) {
  const { startTour, hasSeenTour, isOpen, initialized, persisted } = useTourStore();

  useEffect(() => {
    if (!autoStart) return;
    const canSchedule = shouldAutoStartPageTour({
      initialized,
      disableAutoStart: persisted.disableAutoStart,
      isTourOpen: isOpen,
      hasSeenTour: hasSeenTour(tourId),
    });
    if (!canSchedule) return;

    const timer = setTimeout(() => {
      const current = useTourStore.getState();
      const stillEligible = shouldAutoStartPageTour({
        initialized: current.initialized,
        disableAutoStart: current.persisted.disableAutoStart,
        isTourOpen: current.isOpen,
        hasSeenTour: current.hasSeenTour(tourId),
      });
      if (!stillEligible) return;
      startTour(tourId);
    }, AUTO_START_DELAY_MS);

    return () => clearTimeout(timer);
  }, [tourId, autoStart, hasSeenTour, startTour, isOpen, initialized, persisted.disableAutoStart]);

  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground hover:text-primary"
      onClick={() => startTour(tourId, 0, true)}
      title="راهنمای صفحه"
    >
      <CircleHelp size={20} />
    </Button>
  );
}
