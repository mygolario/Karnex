"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getPlanFromCloud, toggleStepCompletion, BusinessPlan } from "@/lib/db";
import { MapPin, CheckCircle2, Circle } from "lucide-react";
import { useRouter } from "next/navigation";

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

  if (loading || !plan) return <div className="p-8 text-center text-slate-400">در حال دریافت برنامه...</div>;

  // Calculate Stats
  const totalSteps = plan.roadmap.reduce((acc, phase) => acc + phase.steps.length, 0);
  const progressPercent = Math.round((completedSteps.length / totalSteps) * 100) || 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header & Progress */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">نقشه راه اجرایی</h1>
            <p className="text-slate-500">قدم به قدم تا موفقیت</p>
          </div>
          <div className="text-3xl font-bold text-blue-600">
            {progressPercent}%
          </div>
        </div>
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Vertical Timeline */}
      <div className="relative border-r-2 border-slate-200 mr-4 md:mr-8 space-y-12 py-4">
        
        {plan.roadmap.map((phase, phaseIndex) => (
          <div key={phaseIndex} className="relative pr-8 md:pr-12">
            
            {/* Timeline Marker */}
            <div className="absolute -right-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-blue-500 shadow-sm z-10"></div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="text-blue-600">#{phaseIndex + 1}</span>
              {phase.phase}
            </h3>

            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              {phase.steps.map((step: any, stepIndex: any) => {
                const isChecked = completedSteps.includes(step);
                return (
                  <div 
                    key={stepIndex}
                    onClick={() => handleToggle(step)}
                    className={`
                      group flex items-center gap-4 p-4 border-b last:border-0 cursor-pointer transition-all duration-200
                      ${isChecked ? 'bg-slate-50' : 'hover:bg-blue-50/30'}
                    `}
                  >
                    <div className={`
                      transition-colors duration-300
                      ${isChecked ? 'text-emerald-500' : 'text-slate-300 group-hover:text-blue-400'}
                    `}>
                      {isChecked ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </div>
                    
                    <span className={`
                      text-lg transition-all duration-300 select-none
                      ${isChecked ? 'text-slate-400 line-through decoration-slate-300' : 'text-slate-700'}
                    `}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
