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
  status?: "todo" | "in-progress" | "done";
  checklist?: string[];
  tips?: string[];
  resources?: string[];
  dueDate?: string; // ISO date string
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
  completedSteps: string[]; // Legacy support
  
  // Computed
  progressPercent: number;
  totalSteps: number;
  activeWeek: number;
  
  // Actions
  toggleStep: (step: string | RoadmapStepObject) => Promise<void>;
  updateStepStatus: (step: string | RoadmapStepObject, status: "todo" | "in-progress" | "done") => Promise<void>;
  isCompleted: (step: string | RoadmapStepObject) => boolean;
  getStepTitle: (step: string | RoadmapStepObject) => string;
  getStepStatus: (step: string | RoadmapStepObject) => "todo" | "in-progress" | "done";
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

  const getStepStatus = (step: string | RoadmapStepObject): "todo" | "in-progress" | "done" => {
    // Priority: if it's in completedSteps, it's done.
    if (isCompleted(step)) return "done";
    if (typeof step !== 'string' && step.status) return step.status;
    return "todo";
  };

  const updateStepStatus = async (step: string | RoadmapStepObject, status: "todo" | "in-progress" | "done") => {
     if (!user || !plan) return;

    const stepName = getStepTitle(step);
    // Logic for legacy array: if status is 'done', add to list. If not, remove.
    // Ideally we should update the actual step object in the roadmap array too, 
    // but for now we sync with the `completedSteps` array for backward compatibility
    const isNowCompleted = status === 'done';
    
    // Optimistic update
    const newCompletedSteps = isNowCompleted 
      ? [...completedSteps, stepName] 
      : completedSteps.filter(s => s !== stepName);
    
    setCompletedSteps(newCompletedSteps);
    
    // Also update the local plan object to reflect status change in UI immediately if using object properties
    // This is complex because we need to find the step in the nested array. 
    // For this MVP, we rely on `completedSteps` array for "done" status,
    // and we might need a local state for "in-progress" if we want to track it without DB changes yet.
    
    updateActiveProject({ completedSteps: newCompletedSteps });

    try {
      await toggleStepCompletion(user.id!, stepName, isNowCompleted, plan.id || 'current');
    } catch (error) {
      console.error("Sync failed", error);
      // Revert on failure
      setCompletedSteps(completedSteps);
      updateActiveProject({ completedSteps: completedSteps });
    }
  };

  // Legacy toggle wrapper
  const toggleStep = async (step: string | RoadmapStepObject) => {
    const current = getStepStatus(step);
    const newStatus = current === 'done' ? 'todo' : 'done';
    await updateStepStatus(step, newStatus);
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
    updateStepStatus,
    isCompleted,
    getStepTitle,
    getStepStatus,
  };
}
