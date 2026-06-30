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
  const { startTour, hasSeenTour, isOpen, initialized, persisted } = useTourStore();

  useEffect(() => {
    const seen = hasSeenTour(tourId);
    const skipped = persisted.skippedTours?.includes(tourId);
    // #region agent log
    fetch('http://127.0.0.1:7443/ingest/9ae0ee8b-1865-4481-b3b2-37ccf5719385',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'176184'},body:JSON.stringify({sessionId:'176184',location:'page-tour-help.tsx:effect',message:'PageTourHelp autoStart check',data:{tourId,autoStart,initialized,isOpen,seen,skipped,skippedTours:persisted.skippedTours},timestamp:Date.now(),hypothesisId:'H3,H5'})}).catch(()=>{});
    // #endregion
    if (!autoStart || !initialized) return;
    if (seen) return;
    if (skipped) return;
    if (isOpen) return;

    const timer = setTimeout(() => {
      const current = useTourStore.getState();
      // #region agent log
      fetch('http://127.0.0.1:7443/ingest/9ae0ee8b-1865-4481-b3b2-37ccf5719385',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'176184'},body:JSON.stringify({sessionId:'176184',location:'page-tour-help.tsx:timer',message:'PageTourHelp timer firing startTour',data:{tourId,isOpen:current.isOpen,hasSeen:current.hasSeenTour(tourId),skippedTours:current.persisted.skippedTours},timestamp:Date.now(),hypothesisId:'H3,H5'})}).catch(()=>{});
      // #endregion
      if (current.isOpen) return;
      if (!current.initialized) return;
      startTour(tourId);
    }, 1200);
    return () => clearTimeout(timer);
  }, [tourId, autoStart, hasSeenTour, startTour, isOpen, initialized, persisted.skippedTours]);

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
