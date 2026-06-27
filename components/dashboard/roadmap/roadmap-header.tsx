"use client";

import { motion } from "framer-motion";
import { Map, TrendingUp, CheckCircle2, Clock, Layers, Zap } from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { RoadmapPhase, RoadmapStep } from "@/lib/db";

interface RoadmapHeaderProps {
  projectName?: string;
  projectType?: string;
  progressPercent: number;
  completedCount: number;
  remainingCount: number;
  roadmap: RoadmapPhase[];
  velocity: { perWeek: number; totalDone: number; estimatedRemaining: number };
  completedSteps: string[];
}

export function RoadmapHeader({
  projectName,
  progressPercent,
  completedCount,
  remainingCount,
  roadmap,
  velocity,
  completedSteps,
}: RoadmapHeaderProps) {
  const totalPhases = roadmap.length;
  const completedPhases = roadmap.filter((phase) =>
    phase.steps.every((s) => {
      const title = typeof s === "string" ? s : (s as RoadmapStep).title;
      return completedSteps.includes(title);
    })
  ).length;

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
      {/* Left: title + progress ring */}
      <div className="flex items-start gap-5">
        {/* Segmented progress ring */}
        <ProgressRing
          progressPercent={progressPercent}
        />

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
              <Map size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
              نقشه راه
            </h1>
          </div>
          <p className="text-muted-foreground max-w-xl text-sm md:text-base leading-relaxed">
            نقشه راه اختصاصی برای{" "}
            <span className="text-foreground font-bold border-b-2 border-primary/20">
              {projectName || "پروژه شما"}
            </span>
            . هر قدم یک فصل از داستان موفقیت شماست.
          </p>
        </div>
      </div>

      {/* Right: stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
        <StatCard
          icon={<TrendingUp size={16} />}
          label="پیشرفت کل"
          value={`${toPersianDigits(progressPercent)}%`}
          gradient="from-blue-600 to-cyan-500"
        />
        <StatCard
          icon={<CheckCircle2 size={16} />}
          label="تکمیل شده"
          value={toPersianDigits(completedCount)}
          color="text-emerald-500"
        />
        <StatCard
          icon={<Clock size={16} />}
          label="باقیمانده"
          value={toPersianDigits(remainingCount)}
          color="text-foreground"
        />
        <StatCard
          icon={<Layers size={16} />}
          label="فازها"
          value={`${toPersianDigits(completedPhases)}/${toPersianDigits(totalPhases)}`}
          color="text-amber-500"
        />
      </div>

      {/* Velocity indicator */}
      {velocity.perWeek > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 rounded-full px-3 py-1.5">
          <Zap size={12} className="text-amber-500" />
          سرعت: {toPersianDigits(velocity.perWeek)} گام در هفته
          {velocity.estimatedRemaining > 0 && (
            <span className="text-muted-foreground/60">
              · ~{toPersianDigits(velocity.estimatedRemaining)} هفته باقی‌مانده
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
  gradient,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color?: string;
  gradient?: string;
}) {
  return (
    <Card
      variant="muted"
      padding="sm"
      className="flex flex-col gap-1 min-w-[100px] hover:bg-card transition-colors"
    >
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div
        className={cn(
          "text-xl font-bold",
          gradient &&
            "bg-clip-text text-transparent bg-gradient-to-r " + gradient,
          color
        )}
      >
        {value}
      </div>
    </Card>
  );
}

function ProgressRing({
  progressPercent,
}: {
  progressPercent: number;
}) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="relative w-24 h-24 shrink-0">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
        {/* Background track */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-muted/30"
        />
        {/* Progress arc */}
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="url(#progressGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          {toPersianDigits(progressPercent)}%
        </span>
        <span className="text-[9px] text-muted-foreground">تکمیل</span>
      </div>
    </div>
  );
}
