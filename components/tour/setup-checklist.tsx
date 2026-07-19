"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, ChevronLeft, Sparkles } from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useTourStore } from "@/lib/tour/store";
import { CHECKLIST_ITEMS } from "@/lib/tour/registry";
import { tourI18n } from "@/lib/tour/i18n";
import { TourMascot } from "./tour-mascot";
import { useProject } from "@/contexts/project-context";
import { LAUNCH_CONFIG } from "@/lib/launch/config";

export function SetupChecklist() {
  const { activeProject } = useProject();
  const { persisted, startTour, hasSeenTour, showWelcome, isOpen } = useTourStore();
  const hideXp = LAUNCH_CONFIG.roadmap.hideGamification;

  const items = useMemo(() => {
    const projectType = activeProject?.projectType;
    const persona = persisted.persona ?? "general";
    return CHECKLIST_ITEMS.filter((item) => {
      if (item.projectTypes?.length && projectType) {
        if (!item.projectTypes.includes(projectType as "startup" | "traditional" | "creator")) {
          return false;
        }
      }
      if (item.personas?.length && persona !== "general") {
        if (!item.personas.includes(persona)) return false;
      }
      return true;
    });
  }, [activeProject?.projectType, persisted.persona]);

  const completedCount = items.filter((i) => hasSeenTour(i.tourId)).length;
  const total = items.length;
  const progress = total > 0 ? Math.round((completedCount / total) * 100) : 0;
  const allDone = completedCount === total && total > 0;

  if (showWelcome || allDone) return null;

  return (
    <Card
      data-tour-id="setup-checklist"
      className="p-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-violet-500/5 relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute top-3 start-3 opacity-20">
        <TourMascot mood="welcome" size="sm" />
      </div>

      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-primary" />
            <h3 className="font-bold text-foreground">{tourI18n.setupTitle}</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {tourI18n.setupProgress}: {toPersianDigits(completedCount)}/{toPersianDigits(total)}
          </p>
        </div>

        {/* Circular progress */}
        <div className="relative w-14 h-14 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-muted/30" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${progress} 100`}
              className="text-primary transition-all duration-500"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
            {toPersianDigits(progress)}٪
          </span>
        </div>
      </div>

      <ul className="space-y-2">
        {items.map((item, i) => {
          const done = hasSeenTour(item.tourId);
          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "flex items-center gap-3 p-2.5 rounded-xl border transition-colors",
                done
                  ? "bg-emerald-500/5 border-emerald-500/20"
                  : "bg-card/50 border-border/50 hover:border-primary/30"
              )}
            >
              <div
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                  done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check size={12} /> : <span className="text-[10px] font-bold">{toPersianDigits(i + 1)}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("text-sm font-medium", done && "line-through text-muted-foreground")}>
                  {item.title}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>
              </div>
              {!done && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="shrink-0 text-primary h-8 px-2"
                  disabled={isOpen}
                  onClick={() => startTour(item.tourId, 0, true)}
                >
                  شروع
                  <ChevronLeft size={14} />
                </Button>
              )}
              {!hideXp && (
                <span className="text-[10px] font-bold text-amber-500 shrink-0">
                  +{item.xpReward} XP
                </span>
              )}
            </motion.li>
          );
        })}
      </ul>
    </Card>
  );
}
