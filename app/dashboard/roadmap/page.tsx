"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { toggleStepCompletion } from "@/lib/db";
import { Map, CheckCircle2, Sparkles, Circle, Flag, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { StepGuide } from "@/components/dashboard/step-guide";
import { HoverExplainer } from "@/components/ui/explainer";

export default function RoadmapPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading, updateActiveProject } = useProject();
  
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  // Sync state
  useEffect(() => {
    if (plan) {
      setCompletedSteps(plan.completedSteps || []);
    }
  }, [plan]);

  // Handle Check/Uncheck
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
      setCompletedSteps(completedSteps); // Revert
      updateActiveProject({ completedSteps: completedSteps });
    }
  };

  if (loading || !plan) return <div className="p-12 text-center animate-pulse">در حال بارگذاری نقشه...</div>;

  const totalSteps = plan.roadmap.reduce((acc, phase) => acc + phase.steps.length, 0);
  const progressPercent = Math.round((completedSteps.length / totalSteps) * 100) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Map size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-foreground">نقشه راه اجرایی</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs font-normal">
                  فاز به فاز
                </Badge>
                <span className="text-sm text-muted-foreground">{plan.projectName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-card border border-border px-6 py-3 rounded-2xl shadow-sm">
          <div className="text-left">
            <div className="text-sm text-muted-foreground mb-1">پیشرفت کل</div>
            <div className="text-2xl font-black text-foreground">{progressPercent}%</div>
          </div>
          <ProgressRing progress={progressPercent} size={60} strokeWidth={6}>
            <span className="text-[10px] font-bold text-muted-foreground"></span>
          </ProgressRing>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative border-r-2 border-border/50 mr-4 md:mr-8 space-y-12">
        {plan.roadmap.map((phase, phaseIdx) => {
          const isPhaseComplete = phase.steps.every((s: string) => completedSteps.includes(s));
          const isPhaseStarted = phase.steps.some((s: string) => completedSteps.includes(s));
          
          return (
            <div key={phaseIdx} className="relative pr-8 md:pr-12 group">
              {/* Phase Marker */}
              <div className={`
                absolute -right-[11px] top-0 w-5 h-5 rounded-full border-4 transition-all duration-500 z-10
                ${isPhaseComplete ? "bg-primary border-primary scale-110" : 
                  isPhaseStarted ? "bg-white border-primary" : "bg-muted border-muted-foreground"}
              `}>
                {isPhaseComplete && <CheckCircle2 size={12} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
              </div>

              {/* Phase Content */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <h2 className={`text-xl font-bold ${isPhaseComplete ? "text-primary" : "text-foreground"}`}>
                    {phase.phase}
                  </h2>
                  {isPhaseComplete && (
                    <Badge variant="success" className="animate-in zoom-in">تکمیل شد! 🎉</Badge>
                  )}
                </div>

                <div className="grid gap-4">
                  {phase.steps.map((step: string, stepIdx: number) => {
                    const isCompleted = completedSteps.includes(step);
                    
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
                              <h3 className={`font-medium text-lg mb-1 transition-colors ${isCompleted ? "text-muted-foreground line-through decoration-primary/30" : "text-foreground"}`}>
                                {step}
                              </h3>
                              
                              {/* Action Bar */}
                              <div className="flex items-center gap-2 mt-2">
                                <StepGuide 
                                  stepName={step} 
                                  stepPhase={phase.phase} 
                                  projectName={plan.projectName}
                                />
                              </div>
                            </div>
                         </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* End Marker */}
        <div className="absolute -right-[9px] bottom-0 w-4 h-4 rounded-full bg-muted-foreground/20" />
      </div>

      {/* Celebration if 100% */}
      {progressPercent === 100 && (
        <Card variant="gradient" className="text-center p-8 animate-in zoom-in duration-500">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy size={32} className="text-yellow-300" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">تبریک! شما قهرمانید! 🏆</h2>
          <p className="text-white/90">تمام مراحل نقشه راه با موفقیت به پایان رسید.</p>
        </Card>
      )}
    </div>
  );
}

function Trophy({ size, className }: { size: number, className?: string }) {
  return <Sparkles size={size} className={className} />;
}
