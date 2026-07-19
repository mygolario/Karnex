"use client";

import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useTourStore } from "@/lib/tour/store";
import { getNextRecommendedTour } from "@/lib/tour/registry";
import { tourI18n } from "@/lib/tour/i18n";
import { TourMascot } from "./tour-mascot";
import { XpToast } from "@/components/gamification/xp-toast";
import { useTourGamification } from "@/hooks/use-tour-gamification";
import { useProject } from "@/contexts/project-context";
import { prefersReducedMotion } from "@/lib/tour/positioning";
import { LAUNCH_CONFIG } from "@/lib/launch/config";

export function TourCelebration() {
  const { showCelebration, celebration, closeCelebration, startTour, persisted } =
    useTourStore();
  const { activeProject } = useProject();
  const { lastXp } = useTourGamification();
  const hideXp = LAUNCH_CONFIG.roadmap.hideGamification;

  useEffect(() => {
    if (!showCelebration || prefersReducedMotion()) return;
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#6366f1", "#8b5cf6", "#a855f7", "#f59e0b"],
    });
  }, [showCelebration]);

  const nextTour = getNextRecommendedTour(
    persisted.completedTours,
    activeProject?.projectType
  );

  if (!showCelebration || !celebration) return null;

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          dir="rtl"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="flex justify-center mb-4">
              <TourMascot mood="celebrate" size="lg" />
            </div>
            <h2 className="text-2xl font-black text-foreground mb-2">
              {tourI18n.celebrationTitle}
            </h2>
            <p className="text-muted-foreground mb-2">{celebration.tourTitle}</p>
            {!hideXp && (
              <p className="text-amber-500 font-bold text-lg mb-6">
                +{celebration.xpReward} XP
              </p>
            )}
            {hideXp && <div className="mb-6" />}

            {nextTour && (
              <div className="mb-4">
                <p className="text-xs text-muted-foreground mb-2">
                  {tourI18n.nextRecommended}
                </p>
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={() => {
                    closeCelebration();
                    startTour(nextTour.id, 0, true);
                  }}
                >
                  {nextTour.title}
                </Button>
              </div>
            )}

            <Button variant="ghost" onClick={closeCelebration} className="w-full">
              {tourI18n.finish}
            </Button>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {!hideXp && lastXp && (
        <XpToast
          xp={lastXp.xp}
          reason={lastXp.reason}
          isVisible={!!lastXp}
          onHide={() => {}}
        />
      )}
    </>
  );
}
