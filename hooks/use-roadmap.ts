"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { toggleStepCompletion, RoadmapStep } from "@/lib/db";

// Types
export interface RoadmapStepObject {
  title: string;
  description?: string;
  estimatedHours?: number | string;
  priority?: "high" | "medium" | "low" | string;
  category?: string;
}

export type RoadmapPhase = {
  phase: string;
  weekNumber?: number;
  theme?: string;
  steps: (string | RoadmapStepObject)[];
};

export interface UseRoadmapReturn {
  // Data
  plan: any;
  loading: boolean;
  roadmap: RoadmapPhase[];
  completedSteps: string[];
  
  // Computed
  progressPercent: number;
  totalSteps: number;
  activeWeek: number;
  
  // Actions
  toggleStep: (step: string | RoadmapStepObject) => Promise<void>;
  isCompleted: (step: string | RoadmapStepObject) => boolean;
  getStepTitle: (step: string | RoadmapStepObject) => string;
}

export function useRoadmap(): UseRoadmapReturn {
  const { user } = useAuth();
  const { activeProject: plan, loading, updateActiveProject } = useProject();
  
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [activeWeek, setActiveWeek] = useState(1);

  // Sync state from plan
  useEffect(() => {
    if (plan) {
      setCompletedSteps(plan.completedSteps || []);
      
      // Auto-detect active week based on first incomplete step
      if (plan.roadmap) {
        const currentWeekIdx = plan.roadmap.findIndex((phase: any) =>
          phase.steps.some((s: any) => !plan.completedSteps?.includes(typeof s === 'string' ? s : s.title))
        );
        if (currentWeekIdx >= 0) {
          const phase = plan.roadmap[currentWeekIdx] as RoadmapPhase;
          setActiveWeek(phase.weekNumber || currentWeekIdx + 1);
        }
      }
    }
  }, [plan]);

  const getStepTitle = (step: string | RoadmapStepObject): string => {
    return typeof step === 'string' ? step : step.title;
  };

  const isCompleted = (step: string | RoadmapStepObject) => {
    return completedSteps.includes(getStepTitle(step));
  };

  const toggleStep = async (step: string | RoadmapStepObject) => {
    if (!user || !plan) return;

    const stepName = getStepTitle(step);
    const isNowCompleted = !completedSteps.includes(stepName);
    
    // Optimistic update
    const newCompletedSteps = isNowCompleted 
      ? [...completedSteps, stepName] 
      : completedSteps.filter(s => s !== stepName);
    
    setCompletedSteps(newCompletedSteps);
    updateActiveProject({ completedSteps: newCompletedSteps });

    try {
      await toggleStepCompletion(user.uid, stepName, isNowCompleted, plan.id || 'current');
    } catch (error) {
      console.error("Sync failed", error);
      // Revert on failure
      setCompletedSteps(completedSteps);
      updateActiveProject({ completedSteps: completedSteps });
    }
  };

  const roadmap = (plan?.roadmap || []) as RoadmapPhase[];
  
  const totalSteps = useMemo(() => {
    return roadmap.reduce((acc: number, phase: RoadmapPhase) => acc + (phase.steps?.length || 0), 0);
  }, [roadmap]);

  const progressPercent = useMemo(() => {
    if (totalSteps === 0) return 0;
    return Math.round((completedSteps.length / totalSteps) * 100);
  }, [completedSteps.length, totalSteps]);

  return {
    plan,
    loading,
    roadmap,
    completedSteps,
    progressPercent,
    totalSteps,
    activeWeek,
    toggleStep,
    isCompleted,
    getStepTitle,
  };
}
