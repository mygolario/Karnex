"use client";

import { useState, useCallback } from "react";
import { useRoadmap } from "@/hooks/use-roadmap";
import { useProject } from "@/contexts/project-context";
import { RoadmapJourney } from "@/components/dashboard/roadmap/roadmap-journey";
import { StepDetailModal } from "@/components/dashboard/step-detail-modal";
import { breakTaskAction } from "@/lib/ai-actions";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Search, Filter, Loader2, Map } from "lucide-react";
import type { RoadmapPhase, RoadmapStepObject } from "@/hooks/use-roadmap";
import type { SubTask } from "@/lib/db";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";

export default function RoadmapPage() {
  const { 
    loading, 
    plan, 
    roadmap, 
    completedSteps, 
    progressPercent, 
    toggleStep, 
    getStepTitle,
    totalSteps
  } = useRoadmap();
  const { activeProject, updateActiveProject } = useProject();

  // StepDetailModal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<RoadmapStepObject | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<RoadmapPhase | null>(null);
  const [isBreakingTask, setIsBreakingTask] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const handleOpenStepDetail = useCallback((step: string | RoadmapStepObject, phase?: RoadmapPhase) => {
    const stepObj = typeof step === "string" ? { title: step, priority: "low" as const } : step;
    const phaseData = phase ?? roadmap.find((p) => p.steps.some((s) => getStepTitle(s) === stepObj.title)) ?? null;
    setSelectedStep(stepObj);
    setSelectedPhase(phaseData ?? null);
    setModalOpen(true);
  }, [roadmap, getStepTitle]);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setSelectedStep(null);
    setSelectedPhase(null);
  }, []);

  const handleBreakTask = useCallback(async () => {
    if (!selectedStep || !activeProject?.id) return;
    setIsBreakingTask(true);
    try {
      const result = await breakTaskAction(selectedStep.title);
      if (result.success && result.data?.subTasks?.length) {
        const existingSubTasks = (activeProject.subTasks || []) as SubTask[];
        const newSubTasks: SubTask[] = result.data.subTasks.map((text, order) => ({
          parentStep: selectedStep.title,
          text,
          isCompleted: false,
          order,
        }));
        const merged = [...existingSubTasks.filter((s) => s.parentStep !== selectedStep.title), ...newSubTasks];
        await updateActiveProject({ subTasks: merged });
      } else if (result.error === "AI_LIMIT_REACHED") {
          setShowLimitModal(true);
      }
    } catch (error) {
      console.error("Failed to break task:", error);
    } finally {
      setIsBreakingTask(false);
    }
  }, [selectedStep, activeProject, updateActiveProject]);

  const handleSubTaskToggle = useCallback((subTask: SubTask) => {
    if (!activeProject?.subTasks) return;
    const list = activeProject.subTasks as SubTask[];
    const updated = list.map((s) =>
      s.parentStep === subTask.parentStep && s.text === subTask.text
        ? { ...s, isCompleted: !s.isCompleted }
        : s
    );
    updateActiveProject({ subTasks: updated });
  }, [activeProject, updateActiveProject]);

  const handleToggleComplete = useCallback(() => {
    if (selectedStep) toggleStep(selectedStep);
  }, [selectedStep, toggleStep]);

  const stepSubTasks = (plan?.subTasks as SubTask[] | undefined)?.filter(
    (s) => s.parentStep === selectedStep?.title
  ) ?? [];

  // If loading
  if (loading || !plan) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-6">
          <div className="relative">
             <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
             <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
          </div>
          <p className="text-muted-foreground animate-pulse text-lg font-medium">در حال ترسیم مسیر موفقیت...</p>
      </div>
    );
  }

  // Stats
  const completedCount = completedSteps.length;
  const remainingCount = totalSteps - completedCount;
  // Mock velocity for now
  const velocity = Math.round(completedCount * 1.5); 

  return (
    <div className="container mx-auto max-w-[1600px] p-6 space-y-8 pb-24 font-sans">
      
      {/* 1. Mission Control Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Map size={32} />
              </div>
              <h1 className="text-4xl font-black tracking-tight text-foreground">
                نقشه راه
              </h1>
           </div>
           
           <p className="text-muted-foreground max-w-xl text-lg leading-relaxed">
             نقشه راه اختصاصی برای <span className="text-foreground font-bold border-b-2 border-primary/20">{plan.projectName || "پروژه شما"}</span>. 
             هر قدم یک فصل از داستان موفقیت شماست.
           </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full lg:w-auto">
           <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card transition-colors">
              <div className="text-xs text-muted-foreground mb-1">پیشرفت کل</div>
              <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                {progressPercent}%
              </div>
           </Card>
           <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card transition-colors">
              <div className="text-xs text-muted-foreground mb-1">تسک‌های باقیمانده</div>
              <div className="text-2xl font-bold text-foreground">{remainingCount}</div>
           </Card>
           <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card transition-colors">
              <div className="text-xs text-muted-foreground mb-1">تسک‌های تکمیل شده</div>
              <div className="text-2xl font-bold text-emerald-500">{completedCount}</div>
           </Card>
           <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 hover:bg-card transition-colors">
              <div className="text-xs text-muted-foreground mb-1">امتیاز سرعت</div>
              <div className="text-2xl font-bold text-amber-500 flex items-center gap-1">
                {velocity} <Activity size={16} />
              </div>
           </Card>
        </div>
      </div>



      {/* 3. Journey View */}
      <RoadmapJourney 
        roadmap={roadmap} 
        completedSteps={completedSteps}
        onToggleStep={toggleStep}
        onOpenStepDetail={handleOpenStepDetail}
        getStepTitle={getStepTitle}
      />

      {/* Step Detail Modal */}
      {selectedStep && (
        <StepDetailModal
          step={selectedStep}
          phaseName={selectedPhase?.phase ?? ""}
          weekNumber={selectedPhase?.weekNumber}
          isOpen={modalOpen}
          onClose={handleCloseModal}
          isCompleted={completedSteps.includes(selectedStep.title)}
          onToggleComplete={handleToggleComplete}
          subTasks={stepSubTasks}
          onSubTaskToggle={handleSubTaskToggle}
          onBreakTask={handleBreakTask}
          isBreakingTask={isBreakingTask}
          projectName={plan?.projectName}
        />
      )}
      
      <LimitReachedModal 
        isOpen={showLimitModal} 
        onClose={() => setShowLimitModal(false)} 
      />
    </div>
  );
}
