"use client";

import { Button } from "@/components/ui/button";
import { CircleHelp } from "lucide-react";
import { useTourStore } from "@/lib/tour/store";
import { cn } from "@/lib/utils";

interface PageTourHelpProps {
  tourId: string;
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  className?: string;
}

/**
 * Per-page button that launches that page's contextual tour.
 *
 * Launch-only by design: this used to schedule the tour 1.2s after the page
 * mounted, which meant nine different pages threw an overlay at anyone who
 * simply navigated to them.
 */
export function PageTourHelp({ tourId, size = "icon", className }: PageTourHelpProps) {
  const startTour = useTourStore((s) => s.startTour);

  return (
    <Button
      variant="ghost"
      size={size}
      className={cn("text-muted-foreground hover:text-primary", className)}
      onClick={() => startTour(tourId, 0, true)}
      title="راهنمای صفحه"
    >
      <CircleHelp size={size === "icon-sm" ? 16 : 20} />
    </Button>
  );
}
