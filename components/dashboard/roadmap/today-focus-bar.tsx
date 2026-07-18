"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Target,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { RoadmapStep, RoadmapPhase } from "@/lib/db";
import { getCategoryConfig } from "@/lib/roadmap/constants";

interface TodayFocusBarProps {
  currentStep: { step: RoadmapStep; phase: RoadmapPhase } | null;
  progressPercent: number;
  velocity: { perWeek: number; totalDone: number; estimatedRemaining: number };
  remainingCount: number;
  onOpenStep: (step: RoadmapStep, phase: RoadmapPhase) => void;
  onQuickComplete: (step: RoadmapStep) => void;
}

export function TodayFocusBar({
  currentStep,
  progressPercent,
  velocity,
  remainingCount,
  onOpenStep,
  onQuickComplete,
}: TodayFocusBarProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 300);
    return () => clearTimeout(t);
  }, []);

  if (!currentStep) {
    return (
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card
              variant="gradient"
              padding="default"
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 size={28} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    🎉 همه گام‌ها تکمیل شد!
                  </h3>
                  <p className="text-white/80 text-sm">
                    شما با موفقیت نقشه راه را پشت سر گذاشتید.
                  </p>
                </div>
              </div>
              <Badge className="bg-white/20 text-white border-0 text-lg font-bold">
                {toPersianDigits(100)}%
              </Badge>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  const step = currentStep.step;
  const catCfg = getCategoryConfig(step.category);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="sticky bottom-4 z-30"
        >
          <Card
            variant="elevated"
            padding="default"
            className="border-primary/20 shadow-xl shadow-primary/10 backdrop-blur-xl"
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Target size={24} />
                </div>
                <div className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center animate-pulse">
                  <Sparkles size={10} className="text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                    ماموریت امروز
                  </span>
                  {catCfg && (
                    <span
                      className={cn(
                        "text-[10px] px-1.5 py-0.5 rounded-full",
                        catCfg.bgClass,
                        catCfg.textClass
                      )}
                    >
                      {catCfg.label}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-foreground truncate">
                  {step.title}
                </h3>
                {step.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Velocity mini */}
              {velocity.perWeek > 0 && (
                <div className="hidden md:flex flex-col items-center text-center shrink-0 border-s border-border/40 ps-4">
                  <TrendingUp size={14} className="text-amber-500 mb-0.5" />
                  <span className="text-[10px] text-muted-foreground">سرعت</span>
                  <span className="text-xs font-bold text-foreground">
                    {toPersianDigits(velocity.perWeek)}/هفته
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenStep(step, currentStep.phase)}
                >
                  جزئیات
                  <ChevronLeft size={14} className="rtl:rotate-180" />
                </Button>
                <Button
                  variant="gradient"
                  size="sm"
                  onClick={() => onQuickComplete(step)}
                  className="gap-1.5"
                >
                  <CheckCircle2 size={16} />
                  انجام دادم
                </Button>
              </div>
            </div>

            {/* Progress strip */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                {toPersianDigits(progressPercent)}% ·{" "}
                {toPersianDigits(remainingCount)} باقی‌مانده
              </span>
            </div>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
