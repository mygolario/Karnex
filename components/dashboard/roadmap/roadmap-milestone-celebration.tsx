"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Share2, ArrowRight } from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getRoadmapTheme } from "@/lib/roadmap/themes";

interface RoadmapMilestoneCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  phaseName: string;
  phaseNumber: number;
  totalPhases: number;
  newRank?: string;
  projectType?: string;
}

export function RoadmapMilestoneCelebration({
  isOpen,
  onClose,
  phaseName,
  phaseNumber,
  totalPhases,
  newRank,
  projectType = "startup",
}: RoadmapMilestoneCelebrationProps) {
  const theme = getRoadmapTheme(projectType);

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti celebration
      (async () => {
        try {
          const { triggerConfetti } = await import(
            "@/components/dashboard/assistant/celebration"
          );
          triggerConfetti();
        } catch (err) {
          console.warn("Failed to load confetti", err);
        }
      })();
    }
  }, [isOpen]);

  const handleShare = () => {
    toast.info("قابلیت اشتراک‌گذاری به زودی اضافه می‌شود");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Celebration Card */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={cn(
              "relative bg-card border border-border/60 rounded-3xl p-8 max-w-md w-full mx-4 text-center shadow-2xl overflow-hidden z-10"
            )}
          >
            {/* Background themed glow */}
            <div
              className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: theme.primary }}
            />
            <div
              className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: theme.accent }}
            />

            {/* Content */}
            <div className="relative z-10 space-y-6">
              {/* Trophy Icon */}
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Trophy size={40} className="text-white animate-bounce" />
              </div>

              {/* Title & Celebration Label */}
              <div className="space-y-1">
                <div className="text-sm font-black uppercase tracking-wider text-amber-500">
                  {theme.completionLabel}
                </div>
                <h2 className="text-2xl font-black text-foreground">
                  فصل {toPersianDigits(phaseNumber)} با موفقیت تکمیل شد!
                </h2>
              </div>

              {/* Phase name badge */}
              <Badge
                variant="outline"
                className="py-1.5 px-4 text-sm font-bold border-primary/30 bg-primary/5 text-primary"
              >
                {phaseName}
              </Badge>

              {/* New Rank Display */}
              {newRank && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center">
                  <div className="text-xs text-amber-600 font-bold mb-1">
                    🏆 ارتقای مقام کارآفرینی!
                  </div>
                  <div className="text-lg font-black text-amber-700 dark:text-amber-400">
                    {newRank}
                  </div>
                </div>
              )}

              {/* Progress summary */}
              <div className="text-xs text-muted-foreground">
                فاز {toPersianDigits(phaseNumber)} از {toPersianDigits(totalPhases)} نقشه راه پروژه شما به پایان رسید.
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <Button variant="gradient" className="w-full gap-2 py-6 text-sm" onClick={onClose}>
                  ادامه مسیر موفقیت
                  <ArrowRight size={16} className="rtl:rotate-180" />
                </Button>
                <Button variant="outline" className="w-full gap-2 py-6 text-sm" onClick={handleShare}>
                  <Share2 size={16} />
                  اشتراک‌گذاری موفقیت
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
