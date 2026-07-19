"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronDown, ChevronUp, Zap, ArrowLeftRight } from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { RoadmapStep } from "@/lib/db";
import { getRoadmapTheme } from "@/lib/roadmap/themes";

interface RoadmapSprintPanelProps {
  sprintSteps: RoadmapStep[];
  completedSteps: string[];
  weekNumber: number;
  weekStart: string;
  weekEnd: string;
  onToggleStep: (step: RoadmapStep) => void;
  onOpenStep: (step: RoadmapStep) => void;
  projectType?: string;
  hideGamification?: boolean;
}

export function RoadmapSprintPanel({
  sprintSteps,
  completedSteps,
  weekNumber,
  weekStart,
  weekEnd,
  onToggleStep,
  onOpenStep,
  projectType = "startup",
  hideGamification = false,
}: RoadmapSprintPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const theme = getRoadmapTheme(projectType);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOpen(window.innerWidth >= 768);
    }
  }, []);

  if (!sprintSteps || sprintSteps.length === 0) return null;

  const completedSprintSteps = sprintSteps.filter((s) =>
    completedSteps.includes(s.title)
  );
  const completedCount = completedSprintSteps.length;
  const totalCount = sprintSteps.length;
  const isSprintComplete = completedCount === totalCount && totalCount > 0;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Format dates in Jalali/Solar Hijri format if possible or display as is
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("fa-IR", { month: "long", day: "numeric" });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="border border-border/40 overflow-hidden shadow-md">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors select-none"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
            <Zap size={16} className="fill-current animate-pulse" />
          </div>
          <span className="font-black text-sm md:text-base text-foreground">
            اسپرینت تمرکز هفتگی (هفته {toPersianDigits(weekNumber)})
          </span>
          {isSprintComplete && (
            <Badge variant="success" size="sm" className="hidden sm:inline-flex">
              تکمیل شد!
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground hidden md:inline-block">
            {formatDate(weekStart)} الی {formatDate(weekEnd)}
          </span>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </Button>
        </div>
      </div>

      {/* Body */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/40"
          >
            <div className="p-4 space-y-4">
              {isSprintComplete ? (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto text-xl">
                    🎉
                  </div>
                  <h4 className="font-bold text-emerald-600">همه‌ چیز رو هوا رفت!</h4>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto">
                    {hideGamification
                      ? "تبریک! شما تمامی گام‌های مشخص شده برای اسپرینت این هفته را تکمیل کردید. برای هفته آینده آماده شوید."
                      : "تبریک! شما تمامی گام‌های مشخص شده برای اسپرینت این هفته را تکمیل کردید و ۱۰۰ XP پاداش گرفتید. برای هفته آینده آماده شوید."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {sprintSteps.map((step) => {
                    const isStepDone = completedSteps.includes(step.title);
                    return (
                      <div
                        key={step.title}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-xl border transition-all hover:bg-card/50",
                          isStepDone
                            ? "bg-emerald-500/5 border-emerald-500/15"
                            : "bg-muted/10 border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => onToggleStep(step)}
                            className={cn(
                              "w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all",
                              isStepDone
                                ? "bg-emerald-500 border-emerald-500 text-white"
                                : "border-muted-foreground/30 hover:border-primary"
                            )}
                          >
                            {isStepDone && <CheckCircle2 size={12} />}
                          </button>
                          <span
                            className={cn(
                              "text-sm font-semibold truncate",
                              isStepDone && "line-through text-muted-foreground"
                            )}
                          >
                            {step.title}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs text-primary gap-1"
                          onClick={() => onOpenStep(step)}
                        >
                          بررسی جزئیات
                          <ArrowLeftRight size={12} className="rotate-180" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Progress */}
              <div className="space-y-1.5 pt-2 border-t border-border/20">
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>میزان پیشرفت اسپرینت</span>
                  <span>
                    {toPersianDigits(completedCount)} از {toPersianDigits(totalCount)} گام (
                    {toPersianDigits(progressPercent)}٪)
                  </span>
                </div>
                <Progress
                  value={progressPercent}
                  className="h-2"
                  indicatorClassName={isSprintComplete ? "bg-emerald-500" : "bg-primary"}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
