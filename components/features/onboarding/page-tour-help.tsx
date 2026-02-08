"use client";

import { useTour } from "@/components/features/onboarding/tour-context";
import { Button } from "@/components/ui/button";
import { CircleHelp } from "lucide-react";
import { useEffect } from "react";

interface PageTourHelpProps {
  tourId: string;
  autoStart?: boolean;
}

export function PageTourHelp({ tourId, autoStart = true }: PageTourHelpProps) {
  const { startTour, hasSeenTour, isOpen, activeTourId } = useTour();

  useEffect(() => {
    // If autoStart is on, user hasn't seen it, AND it's not already running
    if (autoStart && !hasSeenTour(tourId)) {
        if (isOpen && activeTourId === tourId) return;

        const timer = setTimeout(() => {
            startTour(tourId);
        }, 1000);
        return () => clearTimeout(timer);
    }
  }, [tourId, autoStart, hasSeenTour, startTour, isOpen, activeTourId]);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="text-muted-foreground hover:text-primary"
      onClick={() => startTour(tourId)}
      title="راهنمای صفحه"
    >
      <CircleHelp size={20} />
    </Button>
  );
}
