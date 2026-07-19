"use client";

import { motion } from "framer-motion";
import { Flame, Zap, Brain, CheckCircle2, Clock, Layers, ArrowRight } from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RoadmapPhase, RoadmapStep } from "@/lib/db";
import { getRoadmapTheme, getRankTitle } from "@/lib/roadmap/themes";
import type { GamificationState } from "@/hooks/use-gamification";

interface RoadmapMissionControlProps {
  projectName?: string;
  projectType?: string;
  progressPercent: number;
  completedCount: number;
  remainingCount: number;
  totalSteps: number;
  roadmap: RoadmapPhase[];
  velocity: { perWeek: number; totalDone: number; estimatedRemaining: number };
  completedSteps: string[];
  gamification: GamificationState;
  aiInsight?: string | null;
  isLoadingInsight?: boolean;
  topPrioritySteps: RoadmapStep[];
  streak: number;
  bestStreak: number;
  hideGamification?: boolean;
}

export function RoadmapMissionControl({
  projectName,
  projectType,
  progressPercent,
  completedCount,
  remainingCount,
  totalSteps,
  roadmap,
  velocity,
  completedSteps,
  gamification,
  aiInsight,
  isLoadingInsight,
  topPrioritySteps,
  streak,
  bestStreak,
  hideGamification = false,
}: RoadmapMissionControlProps) {
  const theme = getRoadmapTheme(projectType);
  const rankTitle = getRankTitle(gamification.level, projectType);
  const projectTypeLabel =
    projectType === "startup"
      ? "استارتاپ"
      : projectType === "traditional"
        ? "کسب‌وکار سنتی"
        : projectType === "creator"
          ? "تولید محتوا"
          : projectType;

  // SVG progress ring constants
  const size = 140;
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progressPercent / 100) * circumference;
  const gradientId = "missionControlProgressGradient";

  const statCards = [
    {
      label: "پیشرفت کل",
      value: `${toPersianDigits(progressPercent)}%`,
      icon: <Layers className="w-4 h-4" />,
    },
    {
      label: "تکمیل شده",
      value: toPersianDigits(completedCount),
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    {
      label: "باقی‌مانده",
      value: toPersianDigits(remainingCount),
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: "سرعت",
      value:
        velocity.perWeek > 0
          ? `${toPersianDigits(velocity.perWeek)}/هفته`
          : "هنوز شروع نشده",
      icon: <Zap className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Row 1: 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Progress Ring */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0 }}
          className="flex flex-col items-center gap-4"
        >
          {/* SVG Ring */}
          <div className="relative flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
              <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={theme.primary} />
                  <stop offset="100%" stopColor={theme.accent} />
                </linearGradient>
              </defs>
              {/* Track */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth={strokeWidth}
                className="text-muted/30"
              />
              {/* Progress arc */}
              <motion.circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={`url(#${gradientId})`}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: dashOffset }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
              />
            </svg>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
              <span className="text-2xl font-bold leading-none">
                {toPersianDigits(progressPercent)}%
              </span>
              <span className="text-xs text-muted-foreground mt-0.5">تکمیل</span>
            </div>
          </div>

          {/* Project name & badges */}
          <div className="flex flex-col items-center gap-2 text-center">
            {projectName && (
              <p className="font-bold text-base leading-snug">{projectName}</p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {projectType && (
                <Badge variant="secondary" className="text-xs">
                  {projectTypeLabel}
                </Badge>
              )}
              {!hideGamification && (
                <Badge
                  variant="outline"
                  className="text-xs border-amber-400 text-amber-500 bg-amber-50 dark:bg-amber-950/30"
                >
                  {rankTitle}
                </Badge>
              )}
            </div>

            {/* Streak row */}
            {!hideGamification && (
            <div className="flex items-center gap-1.5 mt-1">
              <Flame
                className={cn(
                  "w-4 h-4",
                  streak > 0 ? "text-orange-500" : "text-muted-foreground"
                )}
              />
              <span className="text-sm font-medium">
                {streak > 0
                  ? `${toPersianDigits(streak)} روز متوالی`
                  : "اولین گام را بردار"}
              </span>
            </div>
            )}
          </div>
        </motion.div>

        {/* Column 2: Today's Top 3 Priorities */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card variant="muted" className="h-full p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-500 shrink-0" />
              <span className="font-semibold text-sm">اولویت‌های امروز</span>
            </div>

            {topPrioritySteps.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                همه گام‌ها تکمیل شده! 🎉
              </p>
            ) : (
              <ol className="flex flex-col gap-2">
                {topPrioritySteps.slice(0, 3).map((step, idx) => {
                  return (
                  <li
                    key={step.id || step.title || idx}
                    className="flex items-center gap-3 cursor-pointer group rounded-md px-2 py-1.5 hover:bg-muted/60 transition-colors"
                  >
                    {/* Number circle */}
                    <span
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: theme.primary }}
                    >
                      {toPersianDigits(idx + 1)}
                    </span>
                    <span className="text-sm truncate flex-1 group-hover:text-foreground text-muted-foreground transition-colors">
                      {step.title}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </li>
                  );
                })}
              </ol>
            )}
          </Card>
        </motion.div>

        {/* Column 3: AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card variant="muted" className="h-full p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500 shrink-0" />
              <span className="font-semibold text-sm">بینش هوشمند</span>
            </div>

            {isLoadingInsight ? (
              <div className="flex flex-col gap-2 py-1">
                <div className="animate-pulse bg-muted rounded h-3 w-full" />
                <div className="animate-pulse bg-muted rounded h-3 w-4/5" />
                <div className="animate-pulse bg-muted rounded h-3 w-3/5" />
              </div>
            ) : aiInsight ? (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {aiInsight}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                برای دریافت بینش روزانه صبر کنید...
              </p>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Row 2: 4 stat mini-cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
          >
            <Card
              variant="muted"
              className="p-4 flex flex-col gap-1.5"
            >
              <div className="flex items-center gap-1.5 text-muted-foreground">
                {stat.icon}
                <span className="text-xs font-medium">{stat.label}</span>
              </div>
              <p className="text-xl font-bold tracking-tight">{stat.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
