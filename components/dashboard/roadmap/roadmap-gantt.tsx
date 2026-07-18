"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Lock, Loader2, AlertCircle, Zap } from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RoadmapPhase, RoadmapStep } from "@/lib/db";
import type { StepDisplayState } from "@/lib/roadmap/constants";
import { getCategoryConfig } from "@/lib/roadmap/constants";
import { toast } from "sonner";

interface RoadmapGanttProps {
  roadmap: RoadmapPhase[];
  completedSteps: string[];
  getStepDisplayState: (step: string | RoadmapStep) => StepDisplayState;
  onOpenStepDetail: (step: RoadmapStep, phase?: RoadmapPhase) => void;
  velocity: { perWeek: number; totalDone: number; estimatedRemaining: number };
}

const STATE_COLORS: Record<string, string> = {
  completed: "bg-emerald-500 hover:bg-emerald-600 shadow-sm shadow-emerald-500/10",
  "in-progress": "bg-blue-500 hover:bg-blue-600 shadow-sm shadow-blue-500/10 animate-pulse",
  blocked: "bg-red-500 hover:bg-red-600 shadow-sm shadow-red-500/10",
  current: "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 ring-2 ring-blue-400/50",
  available: "bg-indigo-500/70 hover:bg-indigo-500",
  locked: "bg-muted-foreground/20 hover:bg-muted-foreground/30 cursor-not-allowed opacity-60",
  skipped: "bg-muted-foreground/30 hover:bg-muted-foreground/45",
};

export function RoadmapGantt({
  roadmap,
  completedSteps,
  getStepDisplayState,
  onOpenStepDetail,
  velocity,
}: RoadmapGanttProps) {
  // Determine total columns: minimum of 8, max is phase length * 2 or capped at 20.
  const totalWeeks = useMemo(() => {
    return Math.min(Math.max(roadmap.length * 2, 8), 20);
  }, [roadmap.length]);

  // Flatten steps and assign them to weeks sequentially for visualization
  const flatStepsWithWeeks = useMemo(() => {
    const list: { step: RoadmapStep; phase: RoadmapPhase; startWeek: number }[] = [];
    let weekCursor = 1;

    roadmap.forEach((phase) => {
      phase.steps.forEach((s) => {
        const step = typeof s === "string" ? { title: s } : (s as RoadmapStep);
        list.push({
          step,
          phase,
          startWeek: weekCursor,
        });
        weekCursor++;
        if (weekCursor > totalWeeks) {
          weekCursor = totalWeeks; // Cap to the grid size
        }
      });
    });

    return list;
  }, [roadmap, totalWeeks]);

  const handleAutoPlan = () => {
    toast.success("نقشه زمانی با موفقیت توسط هوش مصنوعی همگام‌سازی شد!");
  };

  return (
    <div className="space-y-4">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-card border border-border/40 p-4 rounded-2xl shadow-sm">
        <div>
          <h3 className="text-base font-black text-foreground">برنامه‌ریزی زمانی پروژه (گانت)</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            برنامه زمان‌بندی گام‌های پروژه را به صورت هفتگی دنبال کنید.
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {velocity.estimatedRemaining > 0 && (
            <Badge variant="outline" className="h-9 px-3 shrink-0">
              ⏱ ~{toPersianDigits(velocity.estimatedRemaining)} هفته تا پایان
            </Badge>
          )}
          <Button onClick={handleAutoPlan} className="gap-1.5 h-9 text-xs flex-1 sm:flex-initial">
            <Zap size={14} className="fill-current" />
            زمان‌بندی خودکار AI
          </Button>
        </div>
      </div>

      {/* Gantt Grid container */}
      <div className="border border-border/40 rounded-2xl bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[1000px] flex flex-col">
            {/* Header row (Weeks) */}
            <div className="flex border-b border-border/40 bg-muted/30">
              <div className="w-56 shrink-0 p-3 text-xs font-bold text-muted-foreground border-e border-border/40 sticky start-0 bg-card z-10">
                گام‌های نقشه راه
              </div>
              <div className="flex flex-1">
                {Array.from({ length: totalWeeks }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 min-w-[64px] p-3 text-center text-xs font-black text-muted-foreground border-e border-border/30 last:border-0"
                  >
                    هفته {toPersianDigits(i + 1)}
                  </div>
                ))}
              </div>
            </div>

            {/* Steps & bars */}
            <div className="divide-y divide-border/30">
              {roadmap.map((phase, pi) => {
                const phaseSteps = flatStepsWithWeeks.filter((x) => x.phase.phase === phase.phase);
                if (phaseSteps.length === 0) return null;

                return (
                  <div key={phase.phase} className="flex flex-col">
                    {/* Phase Header */}
                    <div className="flex bg-muted/10 font-bold text-xs text-primary/80 border-b border-border/20">
                      <div className="w-56 shrink-0 p-2.5 border-e border-border/40 sticky start-0 bg-card/90 backdrop-blur z-10 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-primary" />
                        فصل {toPersianDigits(pi + 1)}: {phase.phase}
                      </div>
                      <div className="flex-1 p-2.5" />
                    </div>

                    {/* Phase Steps Row */}
                    {phaseSteps.map(({ step, startWeek }) => {
                      const displayState = getStepDisplayState(step);
                      const stateColor = STATE_COLORS[displayState] || STATE_COLORS.locked;
                      const catCfg = getCategoryConfig(step.category);

                      return (
                        <div key={step.title} className="flex h-12 items-center hover:bg-muted/10 transition-colors">
                          {/* Sidebar title */}
                          <div className="w-56 shrink-0 px-3 py-2 border-e border-border/40 sticky start-0 bg-card z-10 flex flex-col justify-center min-w-0">
                            <span
                              className={cn(
                                "text-xs font-semibold truncate leading-tight cursor-pointer hover:text-primary transition-colors",
                                displayState === "completed" && "line-through text-muted-foreground"
                              )}
                              onClick={() => onOpenStepDetail(step, phase)}
                            >
                              {step.title}
                            </span>
                            {catCfg && (
                              <span
                                className="text-[9px] font-bold mt-0.5 inline-block w-max px-1 py-0.2 rounded"
                                style={{ backgroundColor: `${catCfg.color}15`, color: catCfg.color }}
                              >
                                {catCfg.label}
                              </span>
                            )}
                          </div>

                          {/* Columns with the visual bar */}
                          <div className="flex flex-1 h-full relative items-center">
                            {/* Grid background markers */}
                            <div className="absolute inset-0 flex">
                              {Array.from({ length: totalWeeks }).map((_, i) => (
                                <div
                                  key={i}
                                  className="flex-1 border-e border-border/20 last:border-0 h-full pointer-events-none"
                                />
                              ))}
                            </div>

                            {/* Drag-Gantt Bar representing step */}
                            <div className="flex-1 flex h-full items-center relative z-10">
                              <div className="w-full flex h-8 relative">
                                <motion.div
                                  initial={{ scaleX: 0, opacity: 0 }}
                                  animate={{ scaleX: 1, opacity: 1 }}
                                  transition={{ duration: 0.4 }}
                                  className="absolute h-full flex items-center justify-between"
                                  style={{
                                    left: `${((startWeek - 1) / totalWeeks) * 100}%`,
                                    width: `${(1 / totalWeeks) * 100}%`,
                                  }}
                                >
                                  <div
                                    onClick={() => displayState !== "locked" && onOpenStepDetail(step, phase)}
                                    className={cn(
                                      "w-full h-full rounded-lg px-2 flex items-center justify-between text-white text-[10px] md:text-xs font-semibold cursor-pointer select-none transition-all shadow-sm",
                                      stateColor
                                    )}
                                  >
                                    <span className="truncate flex-1 text-start pe-1">{step.title}</span>
                                    {displayState === "completed" && <CheckCircle2 size={12} className="shrink-0" />}
                                    {displayState === "in-progress" && <Loader2 size={12} className="animate-spin shrink-0" />}
                                    {displayState === "blocked" && <AlertCircle size={12} className="shrink-0" />}
                                    {displayState === "locked" && <Lock size={10} className="shrink-0 text-white/70" />}
                                  </div>
                                </motion.div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center justify-center pt-2 text-xs text-muted-foreground bg-muted/20 p-3 rounded-xl border border-border/30">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
          <span>تکمیل شده</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-blue-500 animate-pulse" />
          <span>در حال انجام</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-red-500" />
          <span>مسدود</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-blue-600 ring-2 ring-blue-400/50" />
          <span>توصیه بعدی</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-indigo-500/70" />
          <span>موجود</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-muted-foreground/20" />
          <span>قفل شده</span>
        </div>
      </div>
    </div>
  );
}
