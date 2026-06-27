"use client";

import {
  CheckCircle2,
  Circle,
  Lock,
  ChevronRight,
  Clock,
  Calendar,
  AlertCircle,
  Loader2,
  SkipForward,
  Link2,
  User,
  Zap,
} from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RoadmapStep } from "@/lib/db";
import {
  StepDisplayState,
  STATUS_CONFIG,
  getCategoryConfig,
  getPriorityConfig,
} from "@/lib/roadmap/constants";
import { SubTask } from "@/lib/db";
import { getRoadmapTheme } from "@/lib/roadmap/themes";

export interface StepCardProps {
  step: RoadmapStep;
  state: StepDisplayState;
  onClick?: () => void;
  onQuickToggle?: (e: React.MouseEvent) => void;
  subTasks?: SubTask[];
  compact?: boolean;
  draggable?: boolean;
  dragAttributes?: Record<string, unknown>;
  dragListeners?: Record<string, unknown>;
  isDragging?: boolean;
  projectType?: string;
}

export function StepCard({
  step,
  state,
  onClick,
  onQuickToggle,
  subTasks,
  compact = false,
  draggable,
  dragAttributes,
  dragListeners,
  isDragging,
  projectType = "startup",
}: StepCardProps) {
  const statusKey =
    state === "completed"
      ? "done"
      : state === "in-progress"
        ? "in-progress"
        : state === "blocked"
          ? "blocked"
          : state === "skipped"
            ? "skipped"
            : "todo";
  const statusCfg = STATUS_CONFIG[statusKey];
  const catCfg = getCategoryConfig(step.category);
  const prioCfg = getPriorityConfig(step.priority);
  const theme = getRoadmapTheme(projectType);

  const completedSubs = subTasks?.filter((s) => s.isCompleted).length || 0;
  const totalSubs = subTasks?.length || 0;

  const isOverdue =
    step.dueDate && state !== "completed" && new Date(step.dueDate) < new Date();

  // Color mappings for left indicator line
  const leftBorderColorMap: Record<string, string> = {
    todo: "border-s-slate-400/50",
    "in-progress": "border-s-blue-500",
    blocked: "border-s-red-500",
    done: "border-s-emerald-500",
    skipped: "border-s-muted-foreground/30",
    locked: "border-s-muted/50",
  };

  return (
    <Card
      onClick={onClick}
      {...(draggable ? dragAttributes : {})}
      {...(draggable ? dragListeners : {})}
      className={cn(
        "relative cursor-pointer transition-all duration-300 group border-s-4 overflow-hidden shadow-sm",
        leftBorderColorMap[statusKey] || "border-s-border",
        theme.cardGlass,
        state === "locked" && "opacity-60 hover:opacity-75 hover:border-border/30",
        state === "current" &&
          "ring-2 ring-blue-500/30 shadow-lg shadow-blue-500/10 hover:-translate-y-1 hover:shadow-xl",
        state === "completed" && "grayscale-[0.2] hover:grayscale-0",
        isDragging && "opacity-50 rotate-2 scale-105 shadow-2xl",
        compact ? "p-3" : "p-5"
      )}
    >
      {/* Background glow for current step */}
      {state === "current" && (
        <div className="absolute -end-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
      )}
      {state === "in-progress" && (
        <div className="absolute -end-4 -top-4 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-all" />
      )}

      <div className="flex justify-between items-start gap-3 relative z-10">
        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            {catCfg && (
              <Badge
                variant="muted"
                size="sm"
                className={cn(catCfg.bgClass, catCfg.textClass, "border-0 font-bold")}
              >
                {catCfg.label}
              </Badge>
            )}
            {prioCfg && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full",
                  prioCfg.badgeClass
                )}
              >
                {step.priority === "high" && "🔥"}
                {step.priority === "medium" && "⚑"}
                {step.priority === "low" && "↓"}
                <span className="ms-0.5">{prioCfg.label}</span>
              </span>
            )}
            <Badge
              variant="muted"
              size="sm"
              className={cn("border-0 font-bold", statusCfg.badgeClass)}
            >
              {statusCfg.label}
            </Badge>
          </div>

          {/* Title */}
          <h4
            className={cn(
              "font-black leading-tight mb-1 group-hover:text-primary transition-colors text-start",
              compact ? "text-sm" : "text-base md:text-lg",
              state === "completed" &&
                "line-through text-muted-foreground decoration-emerald-500/50"
            )}
          >
            {step.title}
          </h4>

          {/* Description */}
          {!compact && step.description && (
            <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed text-start">
              {step.description}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap text-[11px] text-muted-foreground">
            {step.estimatedHours != null && (
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-primary/60" />
                {toPersianDigits(step.estimatedHours)} ساعت تخمینی
              </span>
            )}
            {step.dueDate && (
              <span
                className={cn(
                  "flex items-center gap-1",
                  isOverdue && "text-red-500 font-medium"
                )}
              >
                <Calendar size={12} className={isOverdue ? "text-red-500" : "text-primary/60"} />
                {toPersianDigits(step.dueDate)}
                {isOverdue && " (عقب افتاده)"}
              </span>
            )}
            {step.dependsOn && step.dependsOn.length > 0 && (
              <span className="flex items-center gap-1" title={`وابسته به: ${step.dependsOn.join("، ")}`}>
                <Link2 size={12} />
                {toPersianDigits(step.dependsOn.length)} پیش‌نیاز
              </span>
            )}
            {step.assignee && (
              <span className="flex items-center gap-1">
                <User size={12} />
                {step.assignee}
              </span>
            )}
          </div>

          {/* Sub-task mini progress */}
          {totalSubs > 0 && (
            <div className="mt-3 flex items-center gap-2 max-w-xs">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-bold font-mono">
                {toPersianDigits(completedSubs)}/{toPersianDigits(totalSubs)}
              </span>
            </div>
          )}
        </div>

        {/* Action button */}
        {onQuickToggle ? (
          <button
            onClick={onQuickToggle}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0",
              state === "completed"
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 hover:bg-emerald-200"
                : state === "locked"
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-blue-100 text-blue-600 dark:bg-blue-900/40 hover:bg-blue-600 hover:text-white group-hover:scale-110"
            )}
          >
            {state === "locked" ? (
              <Lock size={14} />
            ) : state === "completed" ? (
              <CheckCircle2 size={16} />
            ) : (
              <Circle size={16} className="opacity-40 group-hover:opacity-100" />
            )}
          </button>
        ) : (
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0",
              state === "locked"
                ? "bg-muted text-muted-foreground"
                : state === "completed"
                  ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40"
                  : state === "in-progress"
                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40"
                    : state === "blocked"
                      ? "bg-red-100 text-red-600 dark:bg-red-900/40"
                      : state === "skipped"
                        ? "bg-muted text-muted-foreground"
                        : "bg-blue-100 text-blue-600 dark:bg-blue-900/40 group-hover:bg-blue-600 group-hover:text-white"
            )}
          >
            {state === "locked" ? (
              <Lock size={14} />
            ) : state === "completed" ? (
              <CheckCircle2 size={16} />
            ) : state === "in-progress" ? (
              <Loader2 size={16} className="animate-spin" />
            ) : state === "blocked" ? (
              <AlertCircle size={16} />
            ) : state === "skipped" ? (
              <SkipForward size={16} />
            ) : (
              <ChevronRight size={18} className="rtl:rotate-180" />
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
