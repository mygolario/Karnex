"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTourStore } from "@/lib/tour/store";
import { getTourWithDynamic } from "@/lib/tour/registry";
import { tourI18n } from "@/lib/tour/i18n";
import { TourMascotPeek } from "./tour-mascot";
import {
  trackReengagementNudgeAccepted,
  trackReengagementNudgeShown,
} from "@/lib/tour/analytics";
import { useEffect, useRef } from "react";

/**
 * A single, gentle, dismissible suggestion to resume a previously-skipped tour.
 * Session-scoped and shown at most once — never re-appears or nags.
 */
export function TourReengagementNudge() {
  const { reengagementCandidate, dismissReengagement, startTour } = useTourStore();
  const tour = reengagementCandidate ? getTourWithDynamic(reengagementCandidate) : null;
  const trackedRef = useRef<string | null>(null);

  useEffect(() => {
    if (tour && trackedRef.current !== tour.id) {
      trackedRef.current = tour.id;
      trackReengagementNudgeShown(tour.id);
    }
  }, [tour]);

  return (
    <AnimatePresence>
      {tour && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 start-6 z-[9500] w-[300px] rounded-2xl border border-border bg-card shadow-2xl p-4"
          dir="rtl"
        >
          <div className="flex items-start gap-3">
            <TourMascotPeek />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground mb-1">
                {tourI18n.reengagementTitle}
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                {tourI18n.reengagementBody(tour.title)}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="gradient"
                  className="h-8 text-xs"
                  onClick={() => {
                    trackReengagementNudgeAccepted(tour.id);
                    dismissReengagement();
                    startTour(tour.id, 0, true);
                  }}
                >
                  {tourI18n.reengagementAccept}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 text-xs"
                  onClick={dismissReengagement}
                >
                  {tourI18n.reengagementDismiss}
                </Button>
              </div>
            </div>
            <button
              onClick={dismissReengagement}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted/50 shrink-0"
              aria-label={tourI18n.reengagementDismiss}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
