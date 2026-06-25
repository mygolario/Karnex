"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Lock, Map, ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface UpcomingTasksProps {
  plan: { roadmap?: unknown; completedSteps?: string[] } | null;
}

function getStepTitle(step: unknown): string {
  if (typeof step === "string") return step;
  if (step && typeof step === "object" && "title" in step) {
    return (step as { title: string }).title || "";
  }
  return "";
}

export function UpcomingTasks({ plan }: UpcomingTasksProps) {
  const roadmap = (plan?.roadmap as Array<{ steps: unknown[]; phase?: string; title?: string }>) || null;

  if (!roadmap) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-4 h-4 text-muted-foreground" />
          <h3 className="font-bold text-foreground">مراحل بعدی</h3>
        </div>
        <div className="text-center py-8">
          <Map className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">نقشه راه آماده نیست</p>
        </div>
      </Card>
    );
  }

  const completed = plan?.completedSteps || [];

  // Flatten all steps and find upcoming (not completed)
  const allSteps: { title: string; phase: string; index: number }[] = [];
  roadmap.forEach((phase) => {
    const steps = phase.steps || [];
    const phaseTitle = phase.phase || phase.title || "";
    steps.forEach((step) => {
      allSteps.push({
        title: getStepTitle(step),
        phase: phaseTitle,
        index: allSteps.length,
      });
    });
  });

  // Find next 4 incomplete steps
  const upcoming = allSteps.filter(s => !completed.includes(s.title)).slice(0, 4);

  // Determine state: completed / current / locked
  const getStepState = (title: string, index: number) => {
    if (completed.includes(title)) return "completed";
    // First incomplete step is "current"
    const firstIncomplete = allSteps.findIndex(s => !completed.includes(s.title));
    if (index === firstIncomplete) return "current";
    return "locked";
  };

  if (upcoming.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Map className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">مراحل بعدی</h3>
        </div>
        <div className="text-center py-8">
          <CheckCircle2 className="w-10 h-10 text-emerald-500/50 mx-auto mb-2" />
          <p className="text-sm text-foreground font-bold">تمام مراحل انجام شد! 🎉</p>
          <p className="text-xs text-muted-foreground mt-1">پروژه شما کامل شده است</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-foreground">مراحل بعدی</h3>
        </div>
        <Link href="/dashboard/roadmap">
          <Button variant="ghost" size="sm" className="text-xs font-bold gap-1">
            همه
            <ArrowLeft className="w-3 h-3" />
          </Button>
        </Link>
      </div>

      <div className="space-y-2">
        {upcoming.map((step, i) => {
          const state = getStepState(step.title, step.index);
          const Icon = state === "completed" ? CheckCircle2 : state === "current" ? Circle : Lock;

          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border transition-all",
                state === "current"
                  ? "border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer"
                  : "border-border/40 hover:bg-muted/30"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                state === "completed"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : state === "current"
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  state === "locked" ? "text-muted-foreground" : "text-foreground"
                )}>
                  {step.title}
                </p>
                {step.phase && (
                  <p className="text-[10px] text-muted-foreground">{step.phase}</p>
                )}
              </div>
              {state === "current" && (
                <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary text-primary-foreground shrink-0">
                  الان
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
