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
  ChevronLeft, ChevronRight, Calendar, FileText, Brain,
  GripVertical, Play, Pause, AlertTriangle, TrendingUp,
  BarChart3, Layers, Lightbulb
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { StepDetailModal } from "@/components/dashboard/step-detail-modal";
import { cn } from "@/lib/utils";
import { StepGuide } from "@/components/dashboard/step-guide";

// Types
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

interface BlockerAlert {
  step: string;
  message: string;
  suggestion: string;
}

// Helpers
function normalizeStep(step: string | RoadmapStep): RoadmapStep {
  return typeof step === 'string' ? { title: step } : step;
}

function getStepTitle(step: string | RoadmapStep): string {
  return typeof step === 'string' ? step : step.title;
}

export default function RoadmapPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading, updateActiveProject } = useProject();

  // Core state
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [subTasks, setSubTasks] = useState<SubTask[]>([]);
  const [loadingTask, setLoadingTask] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [selectedStep, setSelectedStep] = useState<{ step: RoadmapStep, phase: RoadmapPhase } | null>(null);

  // New enhanced state
  const [viewMode, setViewMode] = useState<'timeline' | 'list'>('timeline');
  const [focusMode, setFocusMode] = useState(false);
  const [sprintMode, setSprintMode] = useState(false);
  const [sprintTasks, setSprintTasks] = useState<{ task: string; priority: string; hours: number }[]>([]);
  const [isGeneratingSprint, setIsGeneratingSprint] = useState(false);
  const [activeWeek, setActiveWeek] = useState(1);
  const [blockerAlerts, setBlockerAlerts] = useState<BlockerAlert[]>([]);
  const [isCheckingBlockers, setIsCheckingBlockers] = useState(false);
  const [estimatedWeeks, setEstimatedWeeks] = useState<number | null>(null);
  const [isEstimatingWeeks, setIsEstimatingWeeks] = useState(false);

  // Estimate project duration with AI
  const estimateProjectDuration = async () => {
    if (!plan || isEstimatingWeeks) return;
    setIsEstimatingWeeks(true);
    
    try {
      const prompt = `You are a project manager. Analyze this project and estimate the total weeks needed:

Project: ${plan.projectName}
Type: ${plan.projectType}
Audience: ${plan.audience || 'general'}
Number of phases: ${plan.roadmap?.length || 0}
Total tasks: ${plan.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 0}

Consider:
- Project complexity
- Number of features
- Market competition level

Return ONLY a number between 4 and 16 representing weeks needed.`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt: "Return ONLY a single number." })
      });

      const data = await response.json();
      if (data.success && data.content) {
        const weeks = parseInt(data.content.trim());
        if (!isNaN(weeks) && weeks >= 4 && weeks <= 16) {
          setEstimatedWeeks(weeks);
        }
      }
    } catch (err) { console.error(err); }
    finally { setIsEstimatingWeeks(false); }
  };

  // Detect blockers with AI
  const detectBlockers = async () => {
    if (!plan || isCheckingBlockers) return;
    setIsCheckingBlockers(true);
    
    try {
      const totalSteps = plan.roadmap?.reduce((acc: number, p: any) => acc + p.steps.length, 0) || 1;
      const progressPercent = Math.round((completedSteps.length / totalSteps) * 100);
      
      // Find stuck tasks (in current phase but not completed for long)
      const currentPhase = plan.roadmap?.find((p: any) => 
        p.steps.some((s: any) => !completedSteps.includes(getStepTitle(s)))
      );
      
      const stuckTasks = currentPhase?.steps
        .filter((s: any) => !completedSteps.includes(getStepTitle(s)))
        .slice(0, 3)
        .map((s: any) => getStepTitle(s)) || [];

      if (stuckTasks.length === 0) {
        setBlockerAlerts([]);
        setIsCheckingBlockers(false);
        return;
      }

      const role = plan.projectType === 'creator' ? 'creator economy expert' : 
                   plan.projectType === 'traditional' ? 'business consultant' : 'startup advisor';

      const prompt = `You are a ${role}. Analyze these potentially stuck tasks and suggest solutions:

Project: ${plan.projectName}
Progress: ${progressPercent}%
Potentially stuck tasks: ${stuckTasks.join(", ")}

For each task, identify if it seems stuck and suggest a solution.
Return ONLY valid JSON array:
[{"step": "task name", "message": "why it might be stuck", "suggestion": "what to do"}]
Persian only. Max 2 items.`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt: "Return ONLY valid JSON array." })
      });

      const data = await response.json();
      if (data.success && data.content) {
        const parsed = JSON.parse(data.content.replace(/```json|```/g, "").trim());
        if (Array.isArray(parsed)) {
          setBlockerAlerts(parsed);
        }
      }
    } catch (err) { console.error(err); }
    finally { setIsCheckingBlockers(false); }
  };

  // Generate weekly sprint
  const generateWeeklySprint = async () => {
    if (!plan || isGeneratingSprint) return;
    setIsGeneratingSprint(true);
    
    try {
      const activePhase = plan.roadmap.find((p: RoadmapPhase) => p.weekNumber === activeWeek) || plan.roadmap[activeWeek - 1];
      const incompleteTasks = activePhase?.steps
        .filter((s: any) => !completedSteps.includes(getStepTitle(s)))
        .map((s: any) => getStepTitle(s)) || [];
      
      const prompt = `Create a weekly sprint plan for these tasks:

Project: ${plan.projectName}
Tasks: ${incompleteTasks.join(", ")}

Return ONLY valid JSON array with 3-5 prioritized tasks:
[{"task": "تسک ۱", "priority": "high", "hours": 4}]

Priority: high/medium/low. Hours: estimated time. Persian only.`;

      const response = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt: "Return ONLY valid JSON array." }),
      });

      const data = await response.json();
      if (data.success && data.content) {
        const parsed = JSON.parse(data.content.replace(/```json|```/g, "").trim());
        setSprintTasks(parsed);
        setSprintMode(true);
      }
    } catch (err) { console.error(err); }
    finally { setIsGeneratingSprint(false); }
  };

  // Handle toggle
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

  // Handle stuck - break task
  const handleStuck = async (stepTitle: string) => {
    if (loadingTask) return;
    setLoadingTask(stepTitle);

    try {
      const res = await fetch("/api/break-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskName: stepTitle, projectContext: plan?.projectName || "" })
      });

      const data = await res.json();
      if (data.subTasks?.length > 0) {
        const newSubTasks: SubTask[] = data.subTasks.map((text: string) => ({
          parentStep: stepTitle, text, isCompleted: false
        }));
        const updatedSubTasks = [...subTasks.filter(s => s.parentStep !== stepTitle), ...newSubTasks];
        setSubTasks(updatedSubTasks);
        setExpandedSteps([...expandedSteps, stepTitle]);
        updateActiveProject({ subTasks: updatedSubTasks });
      }
    } catch (error) { console.error("Failed to break task:", error); }
    finally { setLoadingTask(null); }
  };

  // Toggle sub-task
  const handleSubTaskToggle = (subTask: SubTask) => {
    const updatedSubTasks = subTasks.map(s =>
      s.parentStep === subTask.parentStep && s.text === subTask.text
        ? { ...s, isCompleted: !s.isCompleted } : s
    );
    setSubTasks(updatedSubTasks);
    updateActiveProject({ subTasks: updatedSubTasks });

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

  const getSubTasks = (stepTitle: string) => subTasks.filter(s => s.parentStep === stepTitle);

  // Sync state from plan
  useEffect(() => {
    if (plan) {
      setCompletedSteps(plan.completedSteps || []);
      if (plan.subTasks) setSubTasks(plan.subTasks);
      
      if (plan.roadmap) {
        const currentWeekIdx = plan.roadmap.findIndex((phase: any) =>
          phase.steps.some((s: any) => !plan.completedSteps?.includes(getStepTitle(s)))
        );
        if (currentWeekIdx >= 0) {
          const phase = plan.roadmap[currentWeekIdx] as RoadmapPhase;
          setActiveWeek(phase.weekNumber || currentWeekIdx + 1);
        }
      }
      
      // Auto-estimate weeks
      if (!estimatedWeeks) {
        estimateProjectDuration();
      }
    }
  }, [plan]);

  // Get flattened steps
  const allSteps = plan?.roadmap?.flatMap((phase: RoadmapPhase) =>
    phase.steps.map((step) => ({ step: normalizeStep(step), phase }))
  ) || [];

  const currentStepData = allSteps.find((s: any) => !completedSteps.includes(s.step.title));

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
  const totalWeeks = estimatedWeeks || plan.roadmap.length;
  const activePhase = plan.roadmap.find((p: RoadmapPhase) => p.weekNumber === activeWeek) || plan.roadmap[activeWeek - 1];
  const phaseProgress = activePhase ?
    Math.round((activePhase.steps.filter((s: any) => completedSteps.includes(getStepTitle(s))).length / activePhase.steps.length) * 100) : 0;

  // === FOCUS MODE ===
  if (focusMode && currentStepData) {
    const stepObj = currentStepData.step;
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-xl mb-8">
          <Button variant="ghost" onClick={() => setFocusMode(false)} className="mb-4">
            <ArrowLeft size={16} /> خروج از حالت تمرکز
          </Button>
          <div className="text-center">
            <Badge variant="outline" className="mb-3">{currentStepData.phase.phase}</Badge>
            <p className="text-sm text-muted-foreground">پیشرفت: {completedSteps.length} از {totalSteps}</p>
          </div>
        </div>

        <Card variant="glass" className="w-full max-w-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
            <Target size={40} className="text-white" />
          </div>

          <h2 className="text-sm font-medium text-muted-foreground mb-2">تنها هدف امروز:</h2>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-4 leading-relaxed">{stepObj.title}</h1>

          {stepObj.description && <p className="text-muted-foreground text-sm mb-6">{stepObj.description}</p>}

          <div className="flex flex-col gap-3">
            <Button variant="gradient" size="xl" className="w-full" onClick={(e) => handleToggle(stepObj.title, e)}>
              <CheckCircle2 size={20} /> تمام شد!
            </Button>
            {getSubTasks(stepObj.title).length === 0 && (
              <Button variant="outline" onClick={() => handleStuck(stepObj.title)} disabled={loadingTask === stepObj.title}>
                {loadingTask === stepObj.title ? (
                  <><Loader2 size={16} className="animate-spin" /> در حال شکستن تسک...</>
                ) : (
                  <><AlertCircle size={16} /> 🤯 گیر کردم — تسک رو بشکن</>
                )}
              </Button>
            )}
          </div>
        </Card>

        <div className="mt-8 w-full max-w-xl">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-500" style={{ width: `${progressPercent}%` }} />
          </div>
          <p className="text-center text-sm text-muted-foreground mt-2">{progressPercent}% تکمیل شده</p>
        </div>
      </div>
    );
  }

  // === MAIN ROADMAP VIEW ===
  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20">
            <Map size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-black text-foreground">نقشه راه هوشمند</h1>
              {isEstimatingWeeks ? (
                <Loader2 size={16} className="animate-spin text-primary" />
              ) : estimatedWeeks && (
                <Badge variant="outline" className="bg-primary/10">
                  <Brain size={12} className="ml-1" />
                  {estimatedWeeks} هفته
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{plan.projectName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant={focusMode ? "gradient" : "outline"}
            onClick={() => setFocusMode(!focusMode)}
            size="sm"
          >
            <Focus size={16} /> تمرکز
          </Button>

          <Button
            variant="outline"
            onClick={detectBlockers}
            disabled={isCheckingBlockers}
            size="sm"
          >
            {isCheckingBlockers ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
            بلاکرها
          </Button>

          <Button
            variant={sprintMode ? "gradient" : "shimmer"}
            onClick={generateWeeklySprint}
            disabled={isGeneratingSprint}
            size="sm"
          >
            {isGeneratingSprint ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            اسپرینت
          </Button>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <ProgressRing progress={progressPercent} size={50} strokeWidth={5} />
          <div>
            <div className="text-xl font-black text-foreground">{progressPercent}%</div>
            <div className="text-xs text-muted-foreground">پیشرفت کل</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
            <CheckCircle2 size={24} className="text-emerald-500" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">{completedSteps.length}/{totalSteps}</div>
            <div className="text-xs text-muted-foreground">تسک‌ها</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Calendar size={24} className="text-blue-500" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">هفته {activeWeek}</div>
            <div className="text-xs text-muted-foreground">از {totalWeeks}</div>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
            <Layers size={24} className="text-purple-500" />
          </div>
          <div>
            <div className="text-xl font-black text-foreground">{plan.roadmap.length}</div>
            <div className="text-xs text-muted-foreground">فاز کلی</div>
          </div>
        </Card>
      </div>

      {/* Blocker Alerts */}
      {blockerAlerts.length > 0 && (
        <Card className="p-5 border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-amber-500" />
            <h3 className="font-bold text-foreground">هشدار بلاکر</h3>
          </div>
          <div className="space-y-3">
            {blockerAlerts.map((alert, i) => (
              <div key={i} className="bg-card rounded-xl p-4">
                <p className="font-medium text-foreground mb-1">{alert.step}</p>
                <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Lightbulb size={14} />
                  <span>{alert.suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Sprint Mode Banner */}
      {sprintMode && sprintTasks.length > 0 && (
        <Card className="p-5 border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Sparkles size={20} className="text-purple-500" />
              اسپرینت این هفته
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setSprintMode(false)}>بستن</Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sprintTasks.map((task, i) => (
              <div
                key={i}
                className={cn(
                  "bg-card rounded-xl p-4 border-r-4",
                  task.priority === "high" ? "border-r-red-500" :
                  task.priority === "medium" ? "border-r-amber-500" : "border-r-green-500"
                )}
              >
                <p className="font-medium mb-2">{task.task}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant={task.priority === "high" ? "danger" : "secondary"}>
                    {task.priority === "high" ? "فوری" : task.priority === "medium" ? "عادی" : "کم"}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {task.hours} ساعت
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Gantt-Style Timeline */}
      <Card className="p-6">
        <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" />
          نمای تایم‌لاین
        </h3>
        <div className="space-y-3">
          {plan.roadmap.map((phase: RoadmapPhase, idx: number) => {
            const weekNum = phase.weekNumber || idx + 1;
            const weekSteps = phase.steps;
            const weekCompleted = weekSteps.filter((s: any) => completedSteps.includes(getStepTitle(s))).length;
            const weekProgress = Math.round((weekCompleted / weekSteps.length) * 100);
            const isActive = weekNum === activeWeek;

            return (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer",
                  isActive ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"
                )}
                onClick={() => setActiveWeek(weekNum)}
              >
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0",
                  weekProgress === 100 ? "bg-emerald-500 text-white" :
                  isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {weekNum}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-foreground truncate">{phase.phase}</span>
                    <span className="text-xs text-muted-foreground">{weekProgress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        weekProgress === 100 ? "bg-emerald-500" : "bg-primary"
                      )}
                      style={{ width: `${weekProgress}%` }}
                    />
                  </div>
                </div>
                <div className="text-xs text-muted-foreground shrink-0">
                  {weekCompleted}/{weekSteps.length}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Active Week Tasks */}
      {activePhase && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                  <Calendar size={12} className="ml-1" />
                  هفته {activePhase.weekNumber || activeWeek}
                </Badge>
                {activePhase.theme && <Badge variant="secondary">{activePhase.theme}</Badge>}
              </div>
              <h2 className="text-xl font-bold text-foreground">{activePhase.phase}</h2>
            </div>
            <ProgressRing progress={phaseProgress} size={50} strokeWidth={5} />
          </div>

          <div className="space-y-3">
            {activePhase.steps.map((step: string | RoadmapStep, stepIdx: number) => {
              const stepName = getStepTitle(step);
              const stepObj = normalizeStep(step);
              const isCompleted = completedSteps.includes(stepName);
              const stepSubTasks = getSubTasks(stepName);
              const isExpanded = expandedSteps.includes(stepName);

              return (
                <div
                  key={stepIdx}
                  className={cn(
                    "relative bg-card border rounded-xl p-4 transition-all duration-300",
                    isCompleted
                      ? "border-primary/20 bg-primary/5"
                      : "border-border hover:border-primary/50 hover:shadow-md"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={(e) => handleToggle(step, e)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all",
                        isCompleted
                          ? "bg-gradient-to-br from-primary to-purple-600 border-transparent text-white"
                          : "border-muted-foreground/30 hover:border-primary"
                      )}
                    >
                      {isCompleted && <CheckCircle2 size={14} />}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className={cn(
                          "font-medium text-lg transition-colors",
                          isCompleted ? "text-muted-foreground line-through" : "text-foreground"
                        )}>
                          {stepName}
                        </h3>
                        {typeof step !== 'string' && step.priority && (
                          <Badge variant={step.priority.toLowerCase() === 'high' ? 'danger' : 'secondary'} className="text-[10px]">
                            {step.priority}
                          </Badge>
                        )}
                      </div>

                      {typeof step !== 'string' && step.description && (
                        <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                      )}

                      {/* Sub-tasks */}
                      {stepSubTasks.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {stepSubTasks.map((sub, i) => (
                            <button
                              key={i}
                              onClick={() => handleSubTaskToggle(sub)}
                              className={cn(
                                "flex items-center gap-2 w-full text-right text-sm p-2 rounded-lg hover:bg-muted/50",
                                sub.isCompleted && "opacity-50"
                              )}
                            >
                              <div className={cn(
                                "w-4 h-4 rounded border flex items-center justify-center",
                                sub.isCompleted ? "bg-primary border-primary text-white" : "border-muted-foreground/30"
                              )}>
                                {sub.isCompleted && <CheckCircle2 size={10} />}
                              </div>
                              <span className={sub.isCompleted ? "line-through" : ""}>{sub.text}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-3">
                        <StepGuide stepName={stepName} stepPhase={activePhase.phase} projectName={plan.projectName} />
                        {stepSubTasks.length === 0 && !isCompleted && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStuck(stepName)}
                            disabled={loadingTask === stepName}
                            className="h-7 text-xs"
                          >
                            {loadingTask === stepName ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <><ListTree size={12} className="ml-1" /> شکستن تسک</>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Celebration */}
      {progressPercent === 100 && (
        <Card className="p-8 text-center border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-500/10">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black text-foreground mb-3">تبریک! شما قهرمانید! 🏆</h2>
          <p className="text-muted-foreground text-lg mb-6">تمام مراحل نقشه راه با موفقیت به پایان رسید!</p>
          <Link href="/dashboard/overview">
            <Button variant="gradient" size="lg">بازگشت به داشبورد</Button>
          </Link>
        </Card>
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
          onToggleComplete={() => { handleToggle(selectedStep.step.title); setSelectedStep(null); }}
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
