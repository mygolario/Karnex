"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { toggleStepCompletion, RoadmapStep } from "@/lib/db";
import {
  Map, CheckCircle2, Sparkles, Circle, Flag,
  Focus, ListTree, Loader2, Zap, ChevronDown, ChevronUp,
  AlertCircle, Target, ArrowLeft, Clock, FolderOpen,
  ChevronLeft, ChevronRight, Calendar, FileText, ArrowDown
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { StepDetailModal } from "@/components/dashboard/step-detail-modal";
import { cn } from "@/lib/utils";
import { StepGuide } from "@/components/dashboard/step-guide";

// Types for enhanced roadmap
// (RoadmapStep is imported from db, but we can extend or re-declare if needed)
interface RoadmapPhase {
  phase: string;
  weekNumber?: number;
  theme?: string;
  steps: (string | RoadmapStep)[];
}

interface SubTask {
  parentStep: string;
  text: string;
  isCompleted: boolean;
}

// Helper to normalize step to object format
function normalizeStep(step: string | RoadmapStep): RoadmapStep {
  if (typeof step === 'string') {
    return { title: step };
  }
  return step;
}

// Helper to get step title
function getStepTitle(step: string | RoadmapStep): string {
  return typeof step === 'string' ? step : step.title;
}

export default function RoadmapPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading, updateActiveProject } = useProject();

  // State
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [focusMode, setFocusMode] = useState(false);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [activeWeek, setActiveWeek] = useState(1);
  const [selectedStep, setSelectedStep] = useState<{ step: RoadmapStep, phase: RoadmapPhase } | null>(null);

  // Sync state from plan
  useEffect(() => {
    if (plan) {
      setCompletedSteps(plan.completedSteps || []);
      if (plan.subTasks) {
        setSubTasks(plan.subTasks);
      }
      // Find current week (first incomplete)
      if (plan.roadmap) {
        const currentWeekIdx = plan.roadmap.findIndex((phase: any) =>
          phase.steps.some((s: any) => !plan.completedSteps?.includes(getStepTitle(s)))
        );
        if (currentWeekIdx >= 0) {
          const phase = plan.roadmap[currentWeekIdx] as RoadmapPhase;
          setActiveWeek(phase.weekNumber || currentWeekIdx + 1);
        }
      }
    }
  }, [plan]);

  // Get all steps flattened for focus mode
  const allSteps = plan?.roadmap?.flatMap((phase: RoadmapPhase) =>
    phase.steps.map((step) => ({ step: normalizeStep(step), phase }))
  ) || [];

  // Find current (first incomplete) step
  const currentStepData = allSteps.find(
    (s: any) => !completedSteps.includes(s.step.title)
  );

  // Handle Check/Uncheck
  const handleToggle = async (step: string | RoadmapStep, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!user || !plan) return;

    const stepName = typeof step === 'string' ? step : step.title;
    const isNowCompleted = !completedSteps.includes(stepName);
    
    const newCompletedSteps = isNowCompleted 
      ? [...completedSteps, stepName] 
      : completedSteps.filter(s => s !== stepName);
    
    setCompletedSteps(newCompletedSteps);
    updateActiveProject({ completedSteps: newCompletedSteps });

    try {
      await toggleStepCompletion(user.uid, stepName, isNowCompleted, plan.id || 'current');
    } catch (error) {
      console.error("Sync failed", error);
      setCompletedSteps(completedSteps);
      updateActiveProject({ completedSteps: completedSteps });
    }
  };

  // Handle "Stuck" button - break task into sub-tasks
  const handleStuck = async (stepTitle: string) => {
    if (loadingTask) return;

    setLoadingTask(stepTitle);

    try {
      const res = await fetch("/api/break-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: stepTitle,
          projectContext: plan?.projectName || ""
        })
      });

      const data = await res.json();

      if (data.subTasks && data.subTasks.length > 0) {
        const newSubTasks: SubTask[] = data.subTasks.map((text: string) => ({
          parentStep: stepTitle,
          text,
          isCompleted: false
        }));

        const updatedSubTasks = [...subTasks.filter(s => s.parentStep !== stepTitle), ...newSubTasks];
        setSubTasks(updatedSubTasks);
        setExpandedSteps([...expandedSteps, stepTitle]);
        updateActiveProject({ subTasks: updatedSubTasks });
      }
    } catch (error) {
      console.error("Failed to break task:", error);
    } finally {
      setLoadingTask(null);
    }
  };

  // Toggle sub-task completion
  const handleSubTaskToggle = (subTask: SubTask) => {
    const updatedSubTasks = subTasks.map(s =>
      s.parentStep === subTask.parentStep && s.text === subTask.text
        ? { ...s, isCompleted: !s.isCompleted }
        : s
    );
    setSubTasks(updatedSubTasks);
    updateActiveProject({ subTasks: updatedSubTasks });

    // Auto-complete parent if all sub-tasks done
    const parentSubTasks = updatedSubTasks.filter(s => s.parentStep === subTask.parentStep);
    const allCompleted = parentSubTasks.every(s => s.isCompleted);
    if (allCompleted && !completedSteps.includes(subTask.parentStep)) {
      const newCompleted = [...completedSteps, subTask.parentStep];
      setCompletedSteps(newCompleted);
      updateActiveProject({ completedSteps: newCompleted });
      if (user && plan) {
        toggleStepCompletion(user.uid, subTask.parentStep, true, plan.id || 'current');
      }
    }
  };

  // Get sub-tasks for a step
  const getSubTasks = (stepTitle: string) => subTasks.filter(s => s.parentStep === stepTitle);

  if (loading || !plan) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">در حال بارگذاری نقشه...</p>
      </div>
    );
  }

  const totalSteps = plan.roadmap.reduce((acc: number, phase: RoadmapPhase) => acc + phase.steps.length, 0);
  const progressPercent = Math.round((completedSteps.length / totalSteps) * 100) || 0;
  const totalWeeks = plan.roadmap.length;

  // Get active phase
  const activePhase = plan.roadmap.find((p: RoadmapPhase) => p.weekNumber === activeWeek) || plan.roadmap[activeWeek - 1];
  const phaseProgress = activePhase ?
    Math.round((activePhase.steps.filter((s: any) => completedSteps.includes(getStepTitle(s))).length / activePhase.steps.length) * 100) : 0;

  // Get priority color
  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'high': return 'border-r-red-500';
      case 'medium': return 'border-r-amber-500';
      case 'low': return 'border-r-green-500';
      default: return 'border-r-transparent';
    }
  };

  // === FOCUS MODE VIEW ===
  if (focusMode && currentStepData) {
    const stepObj = currentStepData.step;
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl mb-8">
          <Button variant="ghost" onClick={() => setFocusMode(false)} className="mb-4">
            <ArrowLeft size={16} />
            خروج از حالت تمرکز
          </Button>

          <div className="text-center">
            <Badge variant="outline" className="mb-3">
              {currentStepData.phase.phase}
            </Badge>
            <p className="text-sm text-muted-foreground">
              پیشرفت: {completedSteps.length} از {totalSteps}
            </p>
          </div>
        </div>

        <Card variant="glass" className="w-full max-w-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 animate-pulse">
            <Target size={40} className="text-white" />
          </div>

          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            تنها هدف امروز:
          </h2>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-4 leading-relaxed">
            {stepObj.title}
          </h1>

          {stepObj.description && (
            <p className="text-muted-foreground text-sm mb-6">{stepObj.description}</p>
          )}

          {stepObj.estimatedHours && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
              <Clock size={14} />
              <span>زمان تخمینی: {stepObj.estimatedHours} ساعت</span>
            </div>
          )}

          {/* Sub-tasks */}
          {getSubTasks(stepObj.title).length > 0 && (
            <div className="bg-muted/50 rounded-xl p-4 mb-6 text-right space-y-3">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <ListTree size={16} className="text-primary" />
                گام‌های کوچکتر:
              </p>
              {getSubTasks(stepObj.title).map((sub, i) => (
                <button
                  key={i}
                  onClick={() => handleSubTaskToggle(sub)}
                  className={cn(
                    "flex items-center gap-3 w-full text-right p-2 rounded-lg transition-all",
                    sub.isCompleted && "opacity-50"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                    sub.isCompleted
                      ? "bg-primary border-primary text-white"
                      : "border-muted-foreground/30"
                  )}>
                    {sub.isCompleted && <CheckCircle2 size={12} />}
                  </div>
                  <span className={cn(
                    "text-sm",
                    sub.isCompleted && "line-through text-muted-foreground"
                  )}>
                    {sub.text}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button
              variant="gradient"
              size="xl"
              className="w-full"
              onClick={(e) => handleToggle(stepObj.title, e)}
            >
              <CheckCircle2 size={20} />
              تمام شد!
            </Button>

            {getSubTasks(stepObj.title).length === 0 && (
              <Button
                variant="outline"
                onClick={() => handleStuck(stepObj.title)}
                disabled={loadingTask === stepObj.title}
              >
                {loadingTask === stepObj.title ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    در حال شکستن تسک...
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} />
                    🤯 گیر کردم — تسک رو بشکن
                  </>
                )}
              </Button>
            )}
          </div>
        </Card>

        <div className="mt-8 w-full max-w-xl">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">
            {progressPercent}% تکمیل شده
          </p>
        </div>
      </div>
    );
  }

  // === FULL ROADMAP VIEW ===
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <Map size={28} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground">نقشه راه ۱۲ هفته‌ای</h1>
            <p className="text-sm text-muted-foreground mt-1">{plan.projectName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Button
            variant={focusMode ? "gradient" : "outline"}
            onClick={() => setFocusMode(!focusMode)}
            className="gap-2"
          >
            <Focus size={18} />
            حالت تمرکز
          </Button>

          <div className="flex items-center gap-4 glass px-4 py-2.5 rounded-xl">
            <div className="text-left">
              <div className="text-xs text-muted-foreground">پیشرفت کل</div>
              <div className="text-xl font-black text-foreground">{progressPercent}%</div>
            </div>
            <ProgressRing progress={progressPercent} size={50} strokeWidth={5} />
          </div>
        </div>
      </div>

      {/* Week Tabs */}
      <div className="relative">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setActiveWeek(Math.max(1, activeWeek - 1))}
            disabled={activeWeek === 1}
          >
            <ChevronRight size={20} />
          </Button>

          {plan.roadmap.map((phase: RoadmapPhase, idx: number) => {
            const weekNum = phase.weekNumber || idx + 1;
            const weekSteps = phase.steps;
            const weekCompleted = weekSteps.filter((s: any) => completedSteps.includes(getStepTitle(s))).length;
            const isComplete = weekCompleted === weekSteps.length;
            const isActive = weekNum === activeWeek;

            return (
              <button
                key={idx}
                onClick={() => setActiveWeek(weekNum)}
                className={cn(
                  "shrink-0 px-4 py-2 rounded-xl transition-all flex flex-col items-center gap-1 min-w-[80px]",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : isComplete
                      ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted"
                )}
              >
                <span className="text-xs font-medium">هفته</span>
                <span className="text-lg font-black">{weekNum}</span>
                {isComplete && <CheckCircle2 size={14} className="text-emerald-500" />}
              </button>
            );
          })}

          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => setActiveWeek(Math.min(totalWeeks, activeWeek + 1))}
            disabled={activeWeek === totalWeeks}
          >
            <ChevronLeft size={20} />
          </Button>
        </div>
      </div>

      {/* Active Week Content */}
      {activePhase && (
        <div className="space-y-6">
          {/* Week Header */}
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    <Calendar size={12} className="ml-1" />
                    هفته {activePhase.weekNumber || activeWeek}
                  </Badge>
                  {activePhase.theme && (
                    <Badge variant="secondary">{activePhase.theme}</Badge>
                  )}
                </div>
                <h2 className="text-xl font-bold text-foreground">{activePhase.phase}</h2>
              </div>
              
              {/* Phase Progress */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                    <div className="text-xs text-muted-foreground mb-1">پیشرفت این هفته</div>
                    <div className="text-2xl font-black text-foreground">{phaseProgress}%</div>
                </div>
                <ProgressRing progress={phaseProgress} size={50} strokeWidth={5} />
              </div>
            </div>

            <div className="grid gap-4">
                  {activePhase.steps.map((step: string | RoadmapStep, stepIdx: number) => {
                    const stepName = typeof step === 'string' ? step : step.title;
                    const stepObj = normalizeStep(step);
                    const isCompleted = completedSteps.includes(stepName);
                    
                    return (
                      <div 
                        key={stepIdx}
                        className={`
                          group/card relative bg-card border transition-all duration-300 rounded-xl p-4
                          ${isCompleted 
                            ? "border-primary/20 bg-primary/5 hover:border-primary/40" 
                            : "border-border hover:border-primary/50 hover:shadow-md hover:-translate-x-1"}
                        `}
                      >
                         <div className="flex items-start gap-4">
                            {/* Checkbox */}
                            <button
                              onClick={(e) => handleToggle(step, e)}
                              className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all
                                ${isCompleted 
                                  ? "bg-gradient-primary border-transparent text-white scale-110" 
                                  : "border-muted-foreground/30 text-transparent hover:border-primary hover:scale-105"}
                              `}
                            >
                              <CheckCircle2 size={14} fill="currentColor" className={isCompleted ? "opacity-100" : "opacity-0"} />
                            </button>

                            <div className="flex-1">
                              <div className="flex items-center justify-between gap-2">
                                <h3 className={`font-medium text-lg mb-1 transition-colors ${isCompleted ? "text-muted-foreground line-through decoration-primary/30" : "text-foreground"}`}>
                                  {stepName}
                                </h3>
                                {typeof step !== 'string' && step.priority && (
                                  <Badge variant={step.priority?.toLowerCase() === 'high' ? 'danger' : 'secondary'} className="text-[10px] h-5">
                                    {step.priority}
                                  </Badge>
                                )}
                              </div>
                              
                              {typeof step !== 'string' && (
                                <div className="text-sm text-muted-foreground mb-3 space-y-1">
                                  {step.description && <p>{step.description}</p>}
                                  <div className="flex items-center gap-3 text-xs opacity-80 pt-1">
                                    {step.estimatedHours && (
                                      <div className="flex items-center gap-1">
                                        <Clock size={12} />
                                        <span>{step.estimatedHours} ساعت</span>
                                      </div>
                                    )}
                                    {step.category && (
                                       <div className="flex items-center gap-1">
                                        <FileText size={12} />
                                        <span>{step.category}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Action Bar */}
                              <div className="flex items-center gap-2 mt-2">
                                <StepGuide 
                                  stepName={stepName} 
                                  stepPhase={activePhase.phase} 
                                  projectName={plan.projectName}
                                />
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => setSelectedStep({ step: stepObj, phase: activePhase })}
                                    className="h-7 text-xs px-2"
                                >
                                    جزئیات بیشتر
                                </Button>
                              </div>
                            </div>
                         </div>
                      </div>
                    );
                  })}
                </div>
          </div>
        </div>
      )}

      {/* Celebration if 100% */}
      {progressPercent === 100 && (
        <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-500 shadow-2xl shadow-amber-500/30">
          <div className="bg-card rounded-[22px] p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles size={40} className="text-yellow-600" />
            </div>
            <h2 className="text-3xl font-black text-foreground mb-3">تبریک! شما قهرمانید! 🏆</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              تمام مراحل نقشه راه ۱۲ هفته‌ای با موفقیت به پایان رسید!
            </p>
            <Link href="/dashboard/overview">
              <Button variant="gradient" size="lg" className="mt-8">
                بازگشت به داشبورد
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Step Detail Modal */}
      {selectedStep && (
        <StepDetailModal
          step={{
            ...selectedStep.step,
            estimatedHours: selectedStep.step.estimatedHours ? Number(selectedStep.step.estimatedHours) : undefined,
            priority: selectedStep.step.priority as "high" | "medium" | "low" | undefined
          }}
          phaseName={selectedStep.phase.phase}
          weekNumber={selectedStep.phase.weekNumber}
          isOpen={!!selectedStep}
          onClose={() => setSelectedStep(null)}
          isCompleted={completedSteps.includes(selectedStep.step.title)}
          onToggleComplete={() => {
            handleToggle(selectedStep.step.title);
            setSelectedStep(null);
          }}
          subTasks={getSubTasks(selectedStep.step.title)}
          onSubTaskToggle={handleSubTaskToggle}
          onBreakTask={() => handleStuck(selectedStep.step.title)}
          isBreakingTask={loadingTask === selectedStep.step.title}
          projectName={plan.projectName}
        />
      )}
    </div>
  );
}
