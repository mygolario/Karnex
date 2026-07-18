"use client";

import { motion } from "framer-motion";
import {
  CheckCircle2,
  Lock,
  Flag,
  Trophy,
  Link2,
  SkipForward,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { cn, toPersianDigits } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { StepCard } from "./step-card";
import type { RoadmapStep, RoadmapPhase, SubTask } from "@/lib/db";
import { StepDisplayState } from "@/lib/roadmap/constants";
import { getRoadmapTheme } from "@/lib/roadmap/themes";

interface RoadmapJourneyProps {
  roadmap: RoadmapPhase[];
  completedSteps: string[];
  getStepDisplayState: (step: string | RoadmapStep) => StepDisplayState;
  onToggleStep: (step: string | RoadmapStep) => void;
  onOpenStepDetail: (step: string | RoadmapStep, phase?: RoadmapPhase) => void;
  subTasks?: SubTask[];
  projectType?: string;
}

export function RoadmapJourney({
  roadmap,
  completedSteps,
  getStepDisplayState,
  onToggleStep,
  onOpenStepDetail,
  subTasks,
  projectType = "startup",
}: RoadmapJourneyProps) {
  const theme = getRoadmapTheme(projectType);

  const getSubTasks = (title: string) =>
    subTasks?.filter((s) => s.parentStep === title);

  const totalPhases = roadmap.length;
  const completedPhases = roadmap.filter((phase) =>
    phase.steps.every((s) => {
      const title = typeof s === "string" ? s : (s as RoadmapStep).title;
      return completedSteps.includes(title);
    })
  ).length;

  return (
    <div className="relative w-full max-w-4xl mx-auto py-8 px-4">
      {/* Central path line (Glowing River Timeline Line) */}
      <div
        className={cn(
          "absolute start-4 md:start-1/2 top-0 bottom-0 w-1.5 -translate-x-1/2 hidden md:block rounded-full bg-gradient-to-b",
          theme.timelineGradient
        )}
        style={{
          boxShadow: `0 0 15px ${theme.timelineGlow}`,
        }}
      />
      <div
        className={cn(
          "absolute start-8 top-0 bottom-0 w-1.5 md:hidden rounded-full bg-gradient-to-b",
          theme.timelineGradient
        )}
        style={{
          boxShadow: `0 0 10px ${theme.timelineGlow}`,
        }}
      />

      {/* Start flag */}
      <div className="relative z-10 flex justify-center mb-16 md:mb-20">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-black shadow-lg shadow-primary/20 flex items-center gap-2 border-4 border-background"
        >
          <Flag size={20} className="fill-current" />
          <span>شروع ماجراجویی نقشه راه</span>
        </motion.div>
      </div>

      <div className="space-y-20">
        {roadmap.map((phase, phaseIndex) => {
          const phaseSteps = phase.steps;
          const phaseDone = phaseSteps.filter((s) => {
            const title =
              typeof s === "string" ? s : (s as RoadmapStep).title;
            return completedSteps.includes(title);
          }).length;
          const phaseTotal = phaseSteps.length;
          const phaseProgress =
            phaseTotal > 0 ? Math.round((phaseDone / phaseTotal) * 100) : 0;
          const isPhaseComplete = phaseDone === phaseTotal && phaseTotal > 0;

          return (
            <div key={phaseIndex} className="relative">
              {/* Phase marker */}
              <div className="sticky top-24 z-20 flex justify-center mb-10 pointer-events-none">
                <div className="flex flex-col items-center gap-2">
                  <span
                    className={cn(
                      "px-5 py-2 rounded-full text-xs font-bold shadow-md border backdrop-blur-md transition-all duration-300",
                      isPhaseComplete
                        ? "bg-emerald-500/10 border-emerald-500/35 text-emerald-600 dark:text-emerald-400"
                        : "bg-background/95 border-primary/20 text-primary"
                    )}
                  >
                    {isPhaseComplete && "✅ "}
                    فصل {toPersianDigits(phaseIndex + 1)}: {phase.phase}
                  </span>
                  {phaseTotal > 0 && (
                    <div className="flex items-center gap-2 bg-background/80 backdrop-blur-md rounded-full px-3 py-1 border border-border/40 shadow-sm">
                      <Progress
                        value={phaseProgress}
                        className="h-1.5 w-24"
                        indicatorClassName={
                          isPhaseComplete ? "bg-emerald-500" : "bg-primary"
                        }
                      />
                      <span className="text-[10px] text-muted-foreground font-bold font-mono">
                        {toPersianDigits(phaseDone)}/{toPersianDigits(phaseTotal)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-10">
                {phaseSteps.map((s, stepIndex) => {
                  const step =
                    typeof s === "string"
                      ? { title: s }
                      : (s as RoadmapStep);
                  const state = getStepDisplayState(step);
                  const stepSubs = getSubTasks(step.title);
                  const isLeft = stepIndex % 2 === 0;

                  return (
                    <motion.div
                      key={step.title}
                      initial={{ opacity: 0, y: 24 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-80px" }}
                      transition={{ duration: 0.4 }}
                      className={cn(
                        "relative flex items-center md:gap-12",
                        "md:flex-row flex-col-reverse items-start md:items-center ps-16 md:ps-0"
                      )}
                    >
                      {/* Desktop: alternating layout */}
                      <div
                        className={cn(
                          "hidden md:block flex-1 text-start pe-8",
                          !isLeft && "order-3 ps-8 text-end pe-0"
                        )}
                      >
                        {isLeft ? (
                          <div className="space-y-2">
                            <StepCard
                              step={step}
                              state={state}
                              onClick={() => onOpenStepDetail(step, phase)}
                              onQuickToggle={(e) => {
                                e.stopPropagation();
                                if (state !== "locked") onToggleStep(step);
                              }}
                              subTasks={stepSubs}
                              projectType={projectType}
                            />
                            {state === "locked" && step.dependsOn && (
                              <DependencyHint deps={step.dependsOn} />
                            )}
                          </div>
                        ) : (
                          <MissionNumber
                            index={stepIndex + 1 + phaseIndex * 5}
                            isLeft={false}
                          />
                        )}
                      </div>

                      {/* Center node */}
                      <div
                        className={cn(
                          "absolute md:static start-5 md:start-auto md:order-2 flex-shrink-0 z-10 w-8 h-8 rounded-full border-4 border-background shadow-md transition-all duration-500 flex items-center justify-center cursor-pointer",
                          state === "completed" &&
                            "bg-emerald-500 scale-125 shadow-emerald-500/30",
                          state === "current" &&
                            "bg-blue-600 scale-150 shadow-blue-500/30 ring-4 ring-blue-500/20",
                          state === "in-progress" &&
                            "bg-blue-400 scale-125 shadow-blue-400/30",
                          state === "blocked" &&
                            "bg-red-500 scale-110 shadow-red-500/30",
                          state === "skipped" &&
                            "bg-muted-foreground/30 scale-90",
                          (state === "locked" || state === "available") &&
                            "bg-muted-foreground/20 scale-100"
                        )}
                        onClick={() => onOpenStepDetail(step, phase)}
                      >
                        {state === "completed" && (
                          <CheckCircle2
                            size={16}
                            className="text-white"
                          />
                        )}
                        {state === "current" && (
                          <Sparkles size={14} className="text-white animate-pulse" />
                        )}
                        {state === "in-progress" && (
                          <Loader2 size={14} className="text-white animate-spin" />
                        )}
                        {state === "blocked" && (
                          <AlertCircle size={14} className="text-white" />
                        )}
                        {state === "skipped" && (
                          <SkipForward size={14} className="text-white" />
                        )}
                        {state === "locked" && (
                          <Lock size={12} className="text-muted-foreground" />
                        )}
                      </div>

                      {/* Desktop right side */}
                      <div
                        className={cn(
                          "hidden md:block flex-1 ps-8",
                          !isLeft && "order-1 pe-8 ps-0 text-start"
                        )}
                      >
                        {isLeft ? (
                          <MissionNumber
                            index={stepIndex + 1 + phaseIndex * 5}
                            isLeft={true}
                          />
                        ) : (
                          <div className="space-y-2">
                            <StepCard
                              step={step}
                              state={state}
                              onClick={() => onOpenStepDetail(step, phase)}
                              onQuickToggle={(e) => {
                                e.stopPropagation();
                                if (state !== "locked") onToggleStep(step);
                              }}
                              subTasks={stepSubs}
                              projectType={projectType}
                            />
                            {state === "locked" && step.dependsOn && (
                              <DependencyHint deps={step.dependsOn} />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Mobile */}
                      <div className="md:hidden w-full">
                        <div className="space-y-2">
                          <StepCard
                            step={step}
                            state={state}
                            onClick={() => onOpenStepDetail(step, phase)}
                            onQuickToggle={(e) => {
                              e.stopPropagation();
                              if (state !== "locked") onToggleStep(step);
                            }}
                            subTasks={stepSubs}
                            projectType={projectType}
                          />
                          {state === "locked" && step.dependsOn && (
                            <DependencyHint deps={step.dependsOn} />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final trophy */}
      <div className="relative z-10 flex justify-center mt-24">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          whileInView={{ scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          className={cn(
            "p-7 rounded-full shadow-2xl border-8 border-background relative transition-all",
            completedSteps.length > 0
              ? "bg-gradient-to-br from-yellow-400 to-amber-600 text-white shadow-amber-500/40"
              : "bg-muted text-muted-foreground shadow-none"
          )}
        >
          <Trophy size={54} className="fill-current" />
          {completedSteps.length > 0 && (
            <div className="absolute inset-0 bg-white/30 blur-xl rounded-full animate-pulse" />
          )}
        </motion.div>
      </div>
      <div className="text-center mt-6">
        <h3
          className={cn(
            "text-2xl font-black",
            completedSteps.length > 0
              ? "bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-yellow-600"
              : "text-muted-foreground"
          )}
        >
          پیروزی نهایی
        </h3>
        <p className="text-muted-foreground mt-2 text-sm">
          {completedSteps.length > 0
            ? "پایان نقشه راه"
            : "با تکمیل مراحل به پیروزی نهایی می‌رسید"}
        </p>
      </div>
    </div>
  );
}

function DependencyHint({ deps }: { deps: string[] }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground ps-2">
      <Link2 size={12} />
      <span>پیش‌نیازها:</span>
      <span className="line-clamp-1 font-bold">
        {deps.slice(0, 2).join("، ")}
        {deps.length > 2 && ` +${toPersianDigits(deps.length - 2)}`}
      </span>
    </div>
  );
}

function MissionNumber({
  index,
  isLeft,
}: {
  index: number;
  isLeft: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 opacity-60 hover:opacity-100 transition-all duration-300 group",
        !isLeft ? "flex-row text-start" : "flex-row-reverse text-end"
      )}
    >
      <div
        className={cn(
          "h-[2px] w-8 md:w-16 bg-gradient-to-r from-border/50 to-transparent",
          !isLeft ? "bg-gradient-to-r" : "bg-gradient-to-l"
        )}
      />
      <div className="flex items-center gap-2 border border-border/60 bg-card/50 rounded-2xl px-3 py-1.5 backdrop-blur-md shadow-sm group-hover:bg-card group-hover:shadow-md group-hover:border-primary/20 transition-all">
        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
          <span className="text-xs font-bold text-primary font-mono">
            {toPersianDigits(index)}
          </span>
        </div>
        <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground transition-colors">
          ماموریت
        </span>
      </div>
    </div>
  );
}
