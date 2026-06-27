"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CircleHelp } from "lucide-react";
import { useTourStore } from "@/lib/tour/store";

interface PageTourHelpProps {
  tourId: string;
  autoStart?: boolean;
}

/** Per-page help button to launch contextual tour */
export function PageTourHelp({ tourId, autoStart = true }: PageTourHelpProps) {
  const { startTour, hasSeenTour, isOpen, persisted } = useTourStore();

  useEffect(() => {
    if (!autoStart || hasSeenTour(tourId)) return;
    if (persisted.skippedTours?.includes(tourId)) return;
    if (isOpen && persisted.activeTourId === tourId) return;

    const timer = setTimeout(() => {
      startTour(tourId);
    }, 1200);
    return () => clearTimeout(timer);
  }, [tourId, autoStart, hasSeenTour, startTour, isOpen, persisted.activeTourId, persisted.skippedTours]);

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
