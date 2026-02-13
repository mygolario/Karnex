"use client";

import { useState, useCallback } from "react";
import { useRoadmap } from "@/hooks/use-roadmap";
import { useProject } from "@/contexts/project-context";
import { RoadmapKanban } from "@/components/dashboard/roadmap/roadmap-kanban";
import { RoadmapTimeline } from "@/components/dashboard/roadmap/roadmap-timeline";
import { StepDetailModal } from "@/components/dashboard/step-detail-modal";
import { breakTaskAction } from "@/lib/ai-actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layers, KanbanSquare, CalendarDays, Loader2, Sparkles, Trophy, GanttChartSquare, ListTree, Activity, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { RoadmapPhase, RoadmapStepObject } from "@/hooks/use-roadmap";
import type { SubTask } from "@/lib/db";

import { PageTourHelp } from "@/components/features/onboarding/page-tour-help";

export default function RoadmapPage() {
  const { 
    loading, 
    plan, 
    roadmap, 
    completedSteps, 
    activeWeek, 
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
      }
    } catch (err) {
      console.error("Break task failed:", err);
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

  const [viewMode, setViewMode] = useState<"kanban" | "timeline" | "gantt">("kanban");
  const [filterPriority, setFilterPriority] = useState<string>("all");

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
        <div className="space-y-2">

           <h1 className="text-4xl font-black tracking-tight text-foreground flex items-center gap-3">
             مسیر رشد و عملیات
           </h1>
           <p className="text-muted-foreground max-w-xl text-lg">
             نقشه راه اختصاصی برای <span className="text-foreground font-bold">{plan.projectName || "پروژه شما"}</span>
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

      {/* 2. Controls Toolbar */}
      <div className="sticky top-4 z-40 bg-background/80 backdrop-blur-md p-2 rounded-2xl border shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center transition-all duration-200">
        
        {/* View Switcher */}
        <div className="flex bg-muted/50 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setViewMode("kanban")}
            className={cn(
              "flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
              viewMode === "kanban" 
                ? "bg-background shadow-sm ring-1 ring-border text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <KanbanSquare size={16} />
            برد عملیات
          </button>
          <button
            onClick={() => setViewMode("timeline")}
            className={cn(
              "flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
              viewMode === "timeline" 
                ? "bg-background shadow-sm ring-1 ring-border text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ListTree size={16} />
            مسیر خطی
          </button>
          <button
            onClick={() => setViewMode("gantt")}
            className={cn(
              "flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2",
              viewMode === "gantt" 
                ? "bg-background shadow-sm ring-1 ring-border text-primary" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <GanttChartSquare size={16} />
            نمای گانت
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64 group">
             <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <input 
               type="text" 
               placeholder="جستجو در تسک‌ها..."
               className="w-full bg-muted/30 border-transparent focus:border-primary/30 focus:bg-background rounded-xl py-2.5 pr-10 pl-4 text-sm transition-all outline-none" 
             />
           </div>
           
           <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[160px] h-10 rounded-xl bg-muted/30 border-transparent hover:bg-background hover:border-border transition-all">
                 <div className="flex items-center gap-2">
                    <Filter size={14} className="text-muted-foreground" />
                    <SelectValue placeholder="فیلتر اولویت" />
                 </div>
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="all">همه اولویت‌ها</SelectItem>
                 <SelectItem value="high">فوری و مهم</SelectItem>
                 <SelectItem value="medium">متوسط</SelectItem>
                 <SelectItem value="low">کم اولویت</SelectItem>
              </SelectContent>
           </Select>
        </div>
      </div>

      {/* 3. Main Views */}
      <AnimatePresence mode="wait">
        <motion.div
           key={viewMode}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.2 }}
           className="min-h-[600px]"
        >
           {viewMode === "kanban" && (
             <RoadmapKanban 
               roadmap={roadmap} 
               completedSteps={completedSteps}
               onToggleStep={toggleStep}
               onOpenStepDetail={handleOpenStepDetail}
               getStepTitle={getStepTitle}
               filterPriority={filterPriority}
             />
           )}
           {viewMode === "timeline" && (
             <RoadmapTimeline 
               roadmap={roadmap} 
               completedSteps={completedSteps}
               activeWeek={activeWeek}
               onToggleStep={toggleStep}
               onOpenStepDetail={handleOpenStepDetail}
               getStepTitle={getStepTitle}
             />
           )}
           {viewMode === "gantt" && (
             <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-muted">
                <GanttChartSquare size={48} className="text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">نمای گانت در حال توسعه است</h3>
                <p className="text-sm text-muted-foreground/60 mt-1">به زودی در دسترس خواهد بود</p>
             </div>
           )}
        </motion.div>
      </AnimatePresence>

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
    </div>
  );
}
