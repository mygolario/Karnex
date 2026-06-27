"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Lock,
  Clock,
  Calendar,
  Link2,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  SkipForward,
} from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { RoadmapStep, RoadmapPhase, SubTask } from "@/lib/db";
import {
  StepStatus,
  StepDisplayState,
  STATUS_CONFIG,
  getCategoryConfig,
} from "@/lib/roadmap/constants";

interface RoadmapListProps {
  roadmap: RoadmapPhase[];
  getStepStatus: (step: string | RoadmapStep) => StepStatus;
  getStepDisplayState: (step: string | RoadmapStep) => StepDisplayState;
  onToggleStep: (step: string | RoadmapStep) => void;
  onOpenStepDetail: (step: string | RoadmapStep, phase?: RoadmapPhase) => void;
  onUpdateStepStatus: (
    step: string | RoadmapStep,
    status: StepStatus
  ) => void;
  subTasks?: SubTask[];
}

function StateIcon({
  state,
  size = 18,
}: {
  state: StepDisplayState;
  size?: number;
}) {
  if (state === "completed")
    return <CheckCircle2 size={size} className="text-emerald-500" />;
  if (state === "in-progress")
    return <Loader2 size={size} className="text-blue-500 animate-spin" />;
  if (state === "blocked")
    return <AlertCircle size={size} className="text-red-500" />;
  if (state === "skipped")
    return <SkipForward size={size} className="text-muted-foreground" />;
  if (state === "locked")
    return <Lock size={size} className="text-muted-foreground/50" />;
  return <Circle size={size} className="text-muted-foreground/40" />;
}

export function RoadmapList({
  roadmap,
  getStepStatus,
  getStepDisplayState,
  onToggleStep,
  onOpenStepDetail,
  onUpdateStepStatus,
  subTasks,
}: RoadmapListProps) {
  const getSubTasks = (title: string) =>
    subTasks?.filter((s) => s.parentStep === title);

  return (
    <div className="space-y-6">
      {roadmap.map((phase, phaseIndex) => {
        const phaseSteps = phase.steps;
        const phaseDone = phaseSteps.filter((s) => {
          const step =
            typeof s === "string" ? { title: s } : (s as RoadmapStep);
          return getStepStatus(step) === "done";
        }).length;
        const phaseTotal = phaseSteps.length;
        const phaseProgress =
          phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;

        return (
          <div key={phaseIndex}>
            {/* Phase header */}
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                  {toPersianDigits(phaseIndex + 1)}
                </div>
                <h3 className="text-sm font-bold text-foreground">
                  {phase.phase}
                </h3>
                {phase.theme && (
                  <Badge variant="muted" size="sm">
                    {phase.theme}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 flex-1 max-w-[200px]">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${phaseProgress}%` }}
                  />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap">
                  {toPersianDigits(phaseDone)}/{toPersianDigits(phaseTotal)}
                </span>
              </div>
            </div>

            {/* Steps */}
            <Card padding="none" className="overflow-hidden">
              {phaseSteps.map((s, stepIndex) => {
                const step =
                  typeof s === "string"
                    ? { title: s }
                    : (s as RoadmapStep);
                const state = getStepDisplayState(step);
                const status = getStepStatus(step);
                const statusCfg = STATUS_CONFIG[status];
                const catCfg = getCategoryConfig(step.category);
                const stepSubs = getSubTasks(step.title) || [];
                const completedSubs = stepSubs.filter((s) => s.isCompleted).length;
                const isOverdue =
                  step.dueDate &&
                  state !== "completed" &&
                  new Date(step.dueDate) < new Date();

                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: stepIndex * 0.03 }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 border-b border-border/30 last:border-b-0 transition-all group hover:bg-muted/30 cursor-pointer",
                      state === "locked" && "opacity-50",
                      state === "completed" && "bg-emerald-500/5"
                    )}
                    onClick={() => onOpenStepDetail(step, phase)}
                  >
                    {/* Toggle button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (state !== "locked") onToggleStep(step);
                      }}
                      disabled={state === "locked"}
                      className="shrink-0 hover:scale-110 transition-transform"
                    >
                      <StateIcon state={state} />
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "text-sm font-medium leading-tight",
                            state === "completed" &&
                              "line-through text-muted-foreground"
                          )}
                        >
                          {step.title}
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
                      {step.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                          {step.description}
                        </p>
                      )}
                    </div>

                    {/* Meta chips */}
                    <div className="hidden md:flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                      {step.estimatedHours != null && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {toPersianDigits(step.estimatedHours)}س
                        </span>
                      )}
                      {step.dueDate && (
                        <span
                          className={cn(
                            "flex items-center gap-1",
                            isOverdue && "text-red-500 font-medium"
                          )}
                        >
                          <Calendar size={12} />
                          {toPersianDigits(step.dueDate)}
                        </span>
                      )}
                      {step.dependsOn && step.dependsOn.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Link2 size={12} />
                          {toPersianDigits(step.dependsOn.length)}
                        </span>
                      )}
                      {stepSubs.length > 0 && (
                        <span className="font-mono text-[10px]">
                          {toPersianDigits(completedSubs)}/
                          {toPersianDigits(stepSubs.length)}
                        </span>
                      )}
                    </div>

                    {/* Status badge */}
                    <Badge
                      variant="muted"
                      size="sm"
                      className={cn("border-0 shrink-0", statusCfg.badgeClass)}
                    >
                      {statusCfg.label}
                    </Badge>

                    {/* Actions menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => onOpenStepDetail(step, phase)}>
                          مشاهده جزئیات
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {status !== "todo" && (
                          <DropdownMenuItem
                            onClick={() => onUpdateStepStatus(step, "todo")}
                          >
                            منتقل به «در صف»
                          </DropdownMenuItem>
                        )}
                        {status !== "in-progress" && state !== "locked" && (
                          <DropdownMenuItem
                            onClick={() => onUpdateStepStatus(step, "in-progress")}
                          >
                            شروع انجام
                          </DropdownMenuItem>
                        )}
                        {status !== "blocked" && state !== "locked" && (
                          <DropdownMenuItem
                            onClick={() => onUpdateStepStatus(step, "blocked")}
                          >
                            علامت‌گذاری به‌عنوان مسدود
                          </DropdownMenuItem>
                        )}
                        {status !== "done" && state !== "locked" && (
                          <DropdownMenuItem
                            onClick={() => onUpdateStepStatus(step, "done")}
                          >
                            تکمیل شد
                          </DropdownMenuItem>
                        )}
                        {status !== "skipped" && (
                          <DropdownMenuItem
                            onClick={() => onUpdateStepStatus(step, "skipped")}
                          >
                            رد کردن
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </motion.div>
                );
              })}
            </Card>
          </div>
        );
      })}
    </div>
  );
}
