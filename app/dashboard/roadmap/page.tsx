"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getPlanFromCloud, toggleStepCompletion, BusinessPlan } from "@/lib/db";
import { Map, CheckCircle2, Circle, Sparkles, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RoadmapPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [plan, setPlan] = useState<BusinessPlan | null>(null);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/new-project'); return; }

    const init = async () => {
      const data = await getPlanFromCloud(user.uid);
      if (data) {
        setPlan(data);
        setCompletedSteps(data.completedSteps || []);
      }
      setLoading(false);
    };
    init();
  }, [user, authLoading, router]);

  // Handle Check/Uncheck
  const handleToggle = async (step: string) => {
    if (!user) return;

    // 1. Optimistic UI Update (Instant feel)
    const isNowCompleted = !completedSteps.includes(step);
    setCompletedSteps(prev => 
      isNowCompleted ? [...prev, step] : prev.filter(s => s !== step)
    );

    // 2. Sync with Cloud
    try {
      await toggleStepCompletion(user.uid, step, isNowCompleted);
    } catch (error) {
      // Revert if error
      console.error("Sync failed", error);
    }
  };

  if (loading || !plan) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
          <Map size={32} className="text-white" />
        </div>
        <p className="text-muted-foreground">در حال دریافت برنامه...</p>
      </div>
    );
  }

  // Calculate Stats
  const totalSteps = plan.roadmap.reduce((acc, phase) => acc + phase.steps.length, 0);
  const progressPercent = Math.round((completedSteps.length / totalSteps) * 100) || 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      
      {/* Header & Progress */}
      <Card variant="glass" className="relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        
        <div className="relative flex justify-between items-end mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-black text-foreground">نقشه راه اجرایی</h1>
              <Badge variant="gradient" size="sm">
                <Sparkles size={12} />
                تعاملی
              </Badge>
            </div>
            <p className="text-muted-foreground">قدم به قدم تا موفقیت</p>
          </div>
          
          <div className="text-left">
            <div className="text-4xl font-black text-gradient mb-1">
              {progressPercent}%
            </div>
            <div className="text-sm text-muted-foreground">
              {completedSteps.length} از {totalSteps} انجام شده
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-4 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-primary via-purple-500 to-secondary transition-all duration-700 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Shimmer Effect */}
          <div 
            className="absolute inset-y-0 right-0 bg-gradient-to-l from-white/30 to-transparent animate-pulse rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {/* Celebration */}
        {progressPercent === 100 && (
          <div className="mt-4 flex items-center gap-2 text-secondary">
            <Trophy size={20} />
            <span className="font-bold">تبریک! شما تمام مراحل را کامل کردید!</span>
          </div>
        )}
      </Card>

      {/* Vertical Timeline */}
      <div className="relative border-r-2 border-border mr-4 md:mr-8 space-y-10 py-4">
        
        {plan.roadmap.map((phase, phaseIndex) => {
          // Calculate phase progress
          const phaseStepsCompleted = phase.steps.filter((s: string) => completedSteps.includes(s)).length;
          const phaseProgress = Math.round((phaseStepsCompleted / phase.steps.length) * 100);
          
          return (
            <div key={phaseIndex} className="relative pr-8 md:pr-12">
              
              {/* Timeline Marker */}
              <div className={`absolute -right-[11px] top-0 w-5 h-5 rounded-full border-4 border-background shadow-lg z-10 transition-colors ${
                phaseProgress === 100 
                  ? 'bg-secondary' 
                  : phaseProgress > 0 
                    ? 'bg-primary' 
                    : 'bg-muted'
              }`} />
              
              {/* Phase Header */}
              <div className="flex items-center gap-3 mb-4">
                <Badge 
                  variant={phaseProgress === 100 ? "success" : phaseProgress > 0 ? "info" : "muted"} 
                  size="lg"
                >
                  فاز {phaseIndex + 1}
                </Badge>
                <h3 className="text-xl font-bold text-foreground">
                  {phase.phase}
                </h3>
                {phaseProgress === 100 && (
                  <CheckCircle2 size={20} className="text-secondary" />
                )}
              </div>

              {/* Steps Card */}
              <Card variant="default" padding="none" className="overflow-hidden">
                {phase.steps.map((step: any, stepIndex: any) => {
                  const isChecked = completedSteps.includes(step);
                  return (
                    <div 
                      key={stepIndex}
                      onClick={() => handleToggle(step)}
                      className={`
                        group flex items-center gap-4 p-4 border-b border-border last:border-0 cursor-pointer transition-all duration-200
                        ${isChecked 
                          ? 'bg-secondary/5' 
                          : 'hover:bg-primary/5'
                        }
                      `}
                    >
                      {/* Checkbox */}
                      <div className={`
                        w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0
                        ${isChecked 
                          ? 'bg-secondary text-white shadow-lg shadow-secondary/25' 
                          : 'bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary'
                        }
                      `}>
                        {isChecked ? (
                          <CheckCircle2 size={18} />
                        ) : (
                          <Circle size={18} />
                        )}
                      </div>
                      
                      {/* Step Text */}
                      <span className={`
                        text-base transition-all duration-300 select-none
                        ${isChecked 
                          ? 'text-muted-foreground line-through decoration-muted-foreground/50' 
                          : 'text-foreground'
                        }
                      `}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
