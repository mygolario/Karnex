"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { toggleStepCompletion } from "@/lib/db";
import { 
  Map, CheckCircle2, Sparkles, Circle, Flag, ArrowDown, 
  Focus, ListTree, Loader2, Zap, ChevronDown, ChevronUp,
  AlertCircle, Target, ArrowLeft
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { StepGuide } from "@/components/dashboard/step-guide";
import { cn } from "@/lib/utils";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
};

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

interface SubTask {
  parentStep: string;
  text: string;
  isCompleted: boolean;
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

  // Sync state from plan
  useEffect(() => {
    if (plan) {
      setCompletedSteps(plan.completedSteps || []);
      // Load saved sub-tasks if any
      if (plan.subTasks) {
        setSubTasks(plan.subTasks);
      }
    }
  }, [plan]);

  // Get all steps flattened for focus mode
  const allSteps = plan?.roadmap?.flatMap((phase: any) => 
    phase.steps.map((step: string) => ({ step, phase: phase.phase }))
  ) || [];
  
  // Find current (first incomplete) step
  const currentStepData = allSteps.find(
    (s: any) => !completedSteps.includes(s.step)
  );

  // Handle toggle completion
  const handleToggle = async (step: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !plan) return;

    const isNowCompleted = !completedSteps.includes(step);
    const newCompletedSteps = isNowCompleted 
      ? [...completedSteps, step] 
      : completedSteps.filter(s => s !== step);
    
    setCompletedSteps(newCompletedSteps);
    updateActiveProject({ completedSteps: newCompletedSteps });

    try {
      await toggleStepCompletion(user.uid, step, isNowCompleted, plan.id || 'current');
    } catch (error) {
      console.error("Sync failed", error);
      setCompletedSteps(completedSteps);
      updateActiveProject({ completedSteps: completedSteps });
    }
  };

  // Handle "Stuck" button - break task into sub-tasks
  const handleStuck = async (step: string) => {
    if (loadingTask) return;
    
    setLoadingTask(step);
    
    try {
      const res = await fetch("/api/break-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskName: step,
          projectContext: plan?.projectName || ""
        })
      });
      
      const data = await res.json();
      
      if (data.subTasks && data.subTasks.length > 0) {
        const newSubTasks: SubTask[] = data.subTasks.map((text: string) => ({
          parentStep: step,
          text,
          isCompleted: false
        }));
        
        const updatedSubTasks = [...subTasks.filter(s => s.parentStep !== step), ...newSubTasks];
        setSubTasks(updatedSubTasks);
        setExpandedSteps([...expandedSteps, step]);
        
        // Save to project
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
  const getSubTasks = (step: string) => subTasks.filter(s => s.parentStep === step);
  
  // Toggle expand/collapse
  const toggleExpand = (step: string) => {
    setExpandedSteps(prev => 
      prev.includes(step) ? prev.filter(s => s !== step) : [...prev, step]
    );
  };

  if (loading || !plan) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="mt-4 text-muted-foreground">در حال بارگذاری نقشه...</p>
      </div>
    );
  }

  const totalSteps = plan.roadmap.reduce((acc: number, phase: any) => acc + phase.steps.length, 0);
  const progressPercent = Math.round((completedSteps.length / totalSteps) * 100) || 0;

  // === FOCUS MODE VIEW ===
  if (focusMode && currentStepData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6">
        {/* Header */}
        <div className="w-full max-w-xl mb-8">
          <Button
            variant="ghost"
            onClick={() => setFocusMode(false)}
            className="mb-4"
          >
            <ArrowLeft size={16} />
            خروج از حالت تمرکز
          </Button>
          
          <div className="text-center">
            <Badge variant="outline" className="mb-3">
              {currentStepData.phase}
            </Badge>
            <p className="text-sm text-muted-foreground">
              پیشرفت: {completedSteps.length} از {totalSteps}
            </p>
          </div>
        </div>

        {/* Focus Card */}
        <Card variant="glass" className="w-full max-w-xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 animate-pulse">
            <Target size={40} className="text-white" />
          </div>
          
          <h2 className="text-sm font-medium text-muted-foreground mb-2">
            تنها هدف امروز:
          </h2>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-8 leading-relaxed">
            {typeof currentStepData.step === 'object' ? (currentStepData.step as any).title || "Task" : currentStepData.step}
          </h1>

          {/* Sub-tasks if broken down */}
          {getSubTasks(currentStepData.step).length > 0 && (
            <div className="bg-muted/50 rounded-xl p-4 mb-6 text-right space-y-3">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <ListTree size={16} className="text-primary" />
                گام‌های کوچکتر:
              </p>
              {getSubTasks(currentStepData.step).map((sub, i) => (
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
              onClick={(e) => handleToggle(currentStepData.step, e)}
            >
              <CheckCircle2 size={20} />
              تمام شد!
            </Button>
            
            {getSubTasks(currentStepData.step).length === 0 && (
              <Button
                variant="outline"
                onClick={() => handleStuck(currentStepData.step)}
                disabled={loadingTask === currentStepData.step}
              >
                {loadingTask === currentStepData.step ? (
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

        {/* Progress */}
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
    <div className="max-w-5xl mx-auto space-y-12 pb-20 stagger-children">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 animate-bounce-gentle">
              <Map size={28} />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">نقشه راه اجرایی</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <Badge variant="outline" className="text-xs font-normal border-primary/20 bg-primary/5 text-primary">
                  فاز به فاز
                </Badge>
                <span className="text-sm text-muted-foreground font-medium">{plan.projectName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Focus Mode Toggle */}
          <Button
            variant={focusMode ? "gradient" : "outline"}
            onClick={() => setFocusMode(!focusMode)}
            className={cn(
               "gap-2 h-12 px-6 rounded-xl transition-all duration-300",
               focusMode ? "shadow-lg shadow-primary/25" : "hover:border-primary/50 hover:bg-primary/5"
            )}
          >
            <Focus size={18} />
            حالت تمرکز
          </Button>

          {/* Progress Ring */}
          <div className="flex items-center gap-6 glass px-6 py-3.5 rounded-2xl shadow-sm border-white/20">
            <div className="text-left">
              <div className="text-xs text-muted-foreground mb-1 font-medium">پیشرفت کل</div>
              <div className="text-2xl font-black text-foreground">{progressPercent}%</div>
            </div>
            <div className="relative">
               <ProgressRing progress={progressPercent} size={64} strokeWidth={6} />
               {progressPercent === 100 && (
                 <div className="absolute inset-0 flex items-center justify-center text-xl">🎉</div>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative border-r-2 border-transparent mr-4 md:mr-8 space-y-16">
        {/* Gradient Line */}
        <div className="absolute top-0 bottom-0 right-[-1px] w-[2px] bg-gradient-to-b from-primary via-purple-500 to-transparent" />

        {plan.roadmap.map((phase: any, phaseIdx: number) => {
          const isPhaseComplete = phase.steps.every((s: string) => completedSteps.includes(s));
          const isPhaseStarted = phase.steps.some((s: string) => completedSteps.includes(s));
          
          return (
            <div key={phaseIdx} className="relative pr-10 md:pr-14 group">
              {/* Phase Marker */}
              <div className={cn(
                "absolute -right-[13px] top-0 w-6 h-6 rounded-full border-4 transition-all duration-500 z-10 shadow-lg",
                isPhaseComplete ? "bg-primary border-primary scale-110 shadow-primary/40" : 
                isPhaseStarted ? "bg-white border-primary animate-pulse" : "bg-muted border-muted-foreground"
              )}>
                {isPhaseComplete && <CheckCircle2 size={14} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
              </div>

              {/* Phase Content */}
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-6 sticky top-20 z-10 bg-background/80 backdrop-blur-md py-2 -my-2 w-fit px-2 rounded-lg">
                  <h2 className={cn(
                    "text-2xl font-black tracking-tight",
                    isPhaseComplete ? "text-primary text-gradient" : "text-foreground"
                  )}>
                    {phase.phase}
                  </h2>
                  {isPhaseComplete && (
                    <Badge variant="success" className="animate-in zoom-in bg-emerald-500/10 text-emerald-600 border-emerald-500/20">تکمیل شد! 🎉</Badge>
                  )}
                </div>

                <div className="grid gap-5">
                  {phase.steps.map((step: string, stepIdx: number) => {
                    const isCompleted = completedSteps.includes(step);
                    const stepSubTasks = getSubTasks(step);
                    const isExpanded = expandedSteps.includes(step);
                    const isCurrentStep = currentStepData?.step === step;
                    
                    return (
                      <div key={stepIdx} className="relative">
                        <div 
                          className={cn(
                            "group/card relative transition-all duration-300 rounded-2xl p-5 border",
                            isCompleted 
                              ? "bg-muted/20 border-border/50 opacity-80" 
                              : "card-glass hover-lift border-white/10 hover:border-primary/20",
                            isCurrentStep && !isCompleted && "ring-2 ring-primary/40 ring-offset-2 ring-offset-background shadow-xl shadow-primary/10"
                          )}
                        >
                           {/* Current Step Indicator */}
                           {isCurrentStep && !isCompleted && (
                             <div className="absolute -left-2 -top-2 w-4 h-4 bg-primary rounded-full animate-ping" />
                           )}

                           <div className="flex items-start gap-5">
                              {/* Checkbox */}
                              <button
                                onClick={(e) => handleToggle(step, e)}
                                className={cn(
                                  "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all duration-300",
                                  isCompleted 
                                    ? "bg-gradient-to-br from-primary to-purple-600 border-transparent text-white scale-110 shadow-lg shadow-primary/30" 
                                    : "border-muted-foreground/30 text-transparent hover:border-primary/60 hover:scale-105 hover:bg-primary/5"
                                )}
                              >
                                <CheckCircle2 size={16} fill="currentColor" className={isCompleted ? "opacity-100" : "opacity-0"} />
                              </button>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-4">
                                  <h3 className={cn(
                                    "font-bold text-lg mb-1.5 transition-colors leading-snug",
                                    isCompleted ? "text-muted-foreground line-through decoration-primary/30" : "text-foreground"
                                  )}>
                                    {typeof step === 'object' ? (step as any).title || "Task" : step}
                                  </h3>
                                  
                                  {/* Expand/Collapse if has sub-tasks */}
                                  {stepSubTasks.length > 0 && (
                                    <button
                                      onClick={() => toggleExpand(step)}
                                      className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/5"
                                    >
                                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                    </button>
                                  )}
                                </div>
                                
                                {/* Action Bar */}
                                <div className="flex items-center gap-3 mt-3 flex-wrap">
                                  <StepGuide 
                                    stepName={step} 
                                    stepPhase={phase.phase} 
                                    projectName={plan.projectName}
                                  />
                                  
                                  {/* Stuck Button */}
                                  {!isCompleted && stepSubTasks.length === 0 && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 text-xs gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg px-3"
                                      onClick={() => handleStuck(step)}
                                      disabled={loadingTask === step}
                                    >
                                      {loadingTask === step ? (
                                        <Loader2 size={14} className="animate-spin" />
                                      ) : (
                                        <Zap size={14} />
                                      )}
                                      گیر کردید؟
                                    </Button>
                                  )}
                                </div>
                              </div>
                           </div>
                        </div>

                        {/* Sub-tasks Panel */}
                        {stepSubTasks.length > 0 && isExpanded && (
                          <div className="mr-8 mt-3 glass rounded-2xl p-5 space-y-3 animate-in slide-in-from-top-4 border-l-4 border-l-primary/20">
                            <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                              <ListTree size={14} />
                              گام‌های کوچکتر
                            </p>
                            {stepSubTasks.map((sub, i) => (
                              <button
                                key={i}
                                onClick={() => handleSubTaskToggle(sub)}
                                className={cn(
                                  "flex items-center gap-3 w-full text-right p-3 rounded-xl transition-all group",
                                  sub.isCompleted 
                                    ? "bg-muted/30 opacity-60" 
                                    : "hover:bg-primary/5 bg-background/50 border border-transparent hover:border-primary/10"
                                )}
                              >
                                <div className={cn(
                                  "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                                  sub.isCompleted 
                                    ? "bg-primary border-primary text-white" 
                                    : "border-muted-foreground/30 group-hover:border-primary/50"
                                )}>
                                  {sub.isCompleted && <CheckCircle2 size={12} />}
                                </div>
                                <span className={cn(
                                  "text-sm font-medium",
                                  sub.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                                )}>
                                  {sub.text}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* End Marker */}
        <div className="absolute -right-[11px] bottom-0 w-5 h-5 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/30" />
      </div>

      {/* Celebration if 100% */}
      {progressPercent === 100 && (
        <div className="relative overflow-hidden rounded-3xl p-1 bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-500 animate-in zoom-in duration-500 shadow-2xl shadow-amber-500/30">
           <div className="bg-card rounded-[22px] p-8 text-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[url('/confetti.png')] opacity-10 bg-cover" />
             <div className="relative z-10">
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-gentle">
                  <Sparkles size={40} className="text-yellow-600" />
                </div>
                <h2 className="text-3xl font-black text-foreground mb-3">تبریک! شما قهرمانید! 🏆</h2>
                <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                   تمام مراحل نقشه راه با موفقیت به پایان رسید. پروژه شما آماده پرواز است!
                </p>
                <Link href="/dashboard/overview">
                  <Button variant="gradient" size="lg" className="mt-8 rounded-xl shadow-lg shadow-primary/20">
                     بازگشت به داشبورد
                  </Button>
                </Link>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
