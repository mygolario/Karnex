"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useRoadmap } from "@/hooks/use-roadmap";
import { useProject } from "@/contexts/project-context";
import {
  RoadmapJourney,
  RoadmapList,
  RoadmapToolbar,
  StepSlideOver,
  TodayFocusBar,
  GamificationHud,
  RoadmapMissionControl,
  RoadmapDailyBriefing,
  RoadmapAiCopilot,
  RoadmapSprintPanel,
  RoadmapMilestoneCelebration,
} from "@/components/dashboard/roadmap";
import { Loader2, Map } from "lucide-react";
import { breakTaskAction } from "@/lib/ai-actions";
import { AskCopilotButton } from "@/components/copilot/ask-copilot-button";
import { PageTourHelp } from "@/components/tour/page-tour-help";
import type { RoadmapStep, RoadmapPhase, SubTask } from "@/lib/db";
import type { StepStatus } from "@/lib/roadmap/constants";
import { EmptyState } from "@/components/ui/empty-state";
import { useGamification } from "@/hooks/use-gamification";
import { exportRoadmapToICS, downloadFile } from "@/lib/export-utils";
import {
  downloadRoadmapMarkdown,
  downloadRoadmapCSV,
  exportRoadmapAsPDF,
} from "@/lib/roadmap/export";
import { getRankTitle } from "@/lib/roadmap/themes";

const RoadmapKanban = dynamic(
  () => import("@/components/dashboard/roadmap/roadmap-kanban").then((m) => m.RoadmapKanban),
  { loading: () => <div className="min-h-[400px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> }
);
const RoadmapAnalytics = dynamic(
  () => import("@/components/dashboard/roadmap/roadmap-analytics").then((m) => m.RoadmapAnalytics),
  { loading: () => <div className="min-h-[400px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> }
);
const RoadmapGantt = dynamic(
  () => import("@/components/dashboard/roadmap/roadmap-gantt").then((m) => m.RoadmapGantt),
  { loading: () => <div className="min-h-[400px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> }
);
const RoadmapCalendar = dynamic(
  () => import("@/components/dashboard/roadmap/roadmap-calendar").then((m) => m.RoadmapCalendar),
  { loading: () => <div className="min-h-[400px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> }
);

export default function RoadmapPage() {
  const {
    loading,
    plan,
    roadmap,
    completedSteps,
    stepStatuses,
    progressPercent,
    totalSteps,
    toggleStep,
    updateStepStatus,
    updateStepMeta,
    getStepTitle,
    getStepStatus,
    getStepDisplayState,
    isStepUnlocked,
    currentStep,
    view,
    setView,
    filter,
    setFilter,
    filteredRoadmap,
    velocity,

    // Reworked fields
    activeWeek,
    sprintMode,
    setSprintMode,
    streak,
    bestStreak,
    topPrioritySteps,
    sprintSteps,
    weekStart,
    weekEnd,
    aiInsight,
    isLoadingInsight,
    generateBriefing,
  } = useRoadmap();
  const { activeProject, updateActiveProject } = useProject();

  const completedCount = completedSteps.length;
  const remainingCount = totalSteps - completedCount;
  const totalPhases = roadmap.length;
  const completedPhases = roadmap.filter((phase) =>
    phase.steps.every((s) => {
      const title = typeof s === "string" ? s : (s as RoadmapStep).title;
      return completedSteps.includes(title);
    })
  ).length;

  const gamification = useGamification(
    completedCount,
    totalSteps,
    completedPhases,
    totalPhases
  );

  const [slideOpen, setSlideOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<RoadmapPhase | null>(null);
  const [isBreakingTask, setIsBreakingTask] = useState(false);
  const confettiRef = useRef(false);

  // Phase Completion Celebration States
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebrationPhase, setCelebrationPhase] = useState<{
    name: string;
    number: number;
  } | null>(null);

  // Track phase completion to trigger full-screen celebration
  const prevCompletedPhasesRef = useRef(completedPhases);
  useEffect(() => {
    if (completedPhases > prevCompletedPhasesRef.current && completedPhases > 0) {
      // Find the recently completed phase
      const completedList = roadmap.map((phase, idx) => ({
        phase,
        idx,
        isDone: phase.steps.every((s) => {
          const title = typeof s === "string" ? s : (s as RoadmapStep).title;
          return completedSteps.includes(title);
        }),
      }));

      const newlyCompleted = completedList.find((x) => x.isDone);
      if (newlyCompleted) {
        setCelebrationPhase({
          name: newlyCompleted.phase.phase,
          number: newlyCompleted.idx + 1,
        });
        setCelebrationOpen(true);
      }
    }
    prevCompletedPhasesRef.current = completedPhases;
  }, [completedPhases, completedSteps, roadmap]);

  const handleExport = useCallback(
    async (format: "pdf" | "markdown" | "csv" | "ics") => {
      if (!plan) return;
      try {
        if (format === "pdf") {
          await exportRoadmapAsPDF(plan);
        } else if (format === "markdown") {
          downloadRoadmapMarkdown(plan);
        } else if (format === "csv") {
          downloadRoadmapCSV(plan);
        } else if (format === "ics") {
          const ics = exportRoadmapToICS(plan);
          downloadFile(ics, `roadmap-${plan.projectName || "project"}.ics`, "text/calendar");
        }
      } catch (err) {
        console.error("Export failed:", err);
      }
    },
    [plan]
  );

  const handleOpenStepDetail = useCallback(
    (step: string | RoadmapStep, phase?: RoadmapPhase) => {
      const stepObj: RoadmapStep =
        typeof step === "string" ? { title: step } : step;
      const phaseData =
        phase ??
        roadmap.find((p) =>
          p.steps.some((s) => getStepTitle(s) === stepObj.title)
        ) ??
        null;
      setSelectedStep(stepObj);
      setSelectedPhase(phaseData ?? null);
      setSlideOpen(true);
    },
    [roadmap, getStepTitle]
  );

  const handleCloseSlide = useCallback(() => {
    setSlideOpen(false);
  }, []);

  const handleBreakTask = useCallback(async () => {
    if (!selectedStep || !activeProject?.id) return;
    setIsBreakingTask(true);
    try {
      const result = await breakTaskAction(selectedStep.title);
      if (result.success && result.data?.subTasks?.length) {
        const existingSubTasks = (activeProject.subTasks || []) as SubTask[];
        const newSubTasks: SubTask[] = result.data.subTasks.map(
          (text, order) => ({
            parentStep: selectedStep.title,
            text,
            isCompleted: false,
            order,
          })
        );
        const merged = [
          ...existingSubTasks.filter(
            (s) => s.parentStep !== selectedStep.title
          ),
          ...newSubTasks,
        ];
        await updateActiveProject({ subTasks: merged });
      }
    } catch (error) {
      console.error("Failed to break task:", error);
    } finally {
      setIsBreakingTask(false);
    }
  }, [selectedStep, activeProject, updateActiveProject]);

  const handleSubTaskToggle = useCallback(
    (subTask: SubTask) => {
      if (!activeProject?.subTasks) return;
      const list = activeProject.subTasks as SubTask[];
      const updated = list.map((s) =>
        s.parentStep === subTask.parentStep && s.text === subTask.text
          ? { ...s, isCompleted: !s.isCompleted }
          : s
      );
      updateActiveProject({ subTasks: updated });
    },
    [activeProject, updateActiveProject]
  );

  const triggerCelebration = useCallback(async () => {
    if (confettiRef.current) return;
    confettiRef.current = true;
    try {
      const { triggerConfetti } = await import(
        "@/components/dashboard/assistant/celebration"
      );
      triggerConfetti();
    } catch {
      // confetti is optional
    }
    setTimeout(() => {
      confettiRef.current = false;
    }, 2000);
  }, []);

  const handleUpdateStatus = useCallback(
    (
      step: string | RoadmapStep,
      status: StepStatus,
      meta?: { blockedReason?: string; actualHours?: number }
    ) => {
      updateStepStatus(step, status, meta);
      if (status === "done") triggerCelebration();
    },
    [updateStepStatus, triggerCelebration]
  );

  const handleQuickComplete = useCallback(
    (step: RoadmapStep) => {
      updateStepStatus(step, "done");
      triggerCelebration();
    },
    [updateStepStatus, triggerCelebration]
  );

  const handleSetDueDate = useCallback(
    (date: string) => {
      if (selectedStep) updateStepMeta(selectedStep, { dueDate: date });
    },
    [selectedStep, updateStepMeta]
  );

  const handleSaveNotes = useCallback(
    (notes: string) => {
      if (selectedStep) updateStepMeta(selectedStep, { notes });
    },
    [selectedStep, updateStepMeta]
  );

  const stepSubTasks = (plan?.subTasks as SubTask[] | undefined)?.filter(
    (s) => s.parentStep === selectedStep?.title
  ) ?? [];

  // Loading state
  if (loading || !plan) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <Loader2 className="h-16 w-16 animate-spin text-primary relative z-10" />
        </div>
        <p className="text-muted-foreground animate-pulse text-lg font-medium">
          در حال ترسیم مسیر موفقیت...
        </p>
      </div>
    );
  }

  // Empty roadmap
  if (!roadmap || roadmap.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <EmptyState
          icon={Map}
          title="نقشه راه خالی است"
          description="برای این پروژه هنوز نقشه راهی تولید نشده است. با ساخت پروژه جدید، هوش مصنوعی یک نقشه راه اختصاصی برای شما می‌سازد."
          size="lg"
        />
      </div>
    );
  }

  const selectedStatus = selectedStep
    ? getStepStatus(selectedStep)
    : "todo";
  const selectedUnlocked = selectedStep
    ? isStepUnlocked(selectedStep)
    : true;

  const displayRoadmap =
    filter.status !== "all" ||
    filter.priority !== "all" ||
    filter.category !== "all" ||
    filter.search.trim()
      ? filteredRoadmap
      : roadmap;

  const blockedStepCount = roadmap.reduce(
    (acc, phase) =>
      acc +
      phase.steps.filter((s) => getStepStatus(s) === "blocked").length,
    0
  );

  return (
    <div className="container mx-auto max-w-[1600px] p-0 md:p-6 space-y-4 md:space-y-6 pb-28 md:pb-32">
      {/* Daily AI Briefing Banner */}
      <RoadmapDailyBriefing
        projectName={plan.projectName}
        projectType={plan.projectType}
        completedCount={completedCount}
        remainingCount={remainingCount}
        currentStepTitle={currentStep?.step?.title}
        onGenerateBriefing={generateBriefing}
      />

      {/* Inline page-level Copilot access */}
      <div className="flex items-center justify-between">
        <PageTourHelp tourId="roadmap" />
        <AskCopilotButton
          prompt={`بیا نقشه راه پروژه‌ام رو بررسی کنیم. پیشرفت ${progressPercent}٪ است و الان روی «${currentStep?.step?.title ?? "گام فعلی"}» هستیم${blockedStepCount > 0 ? ` و ${blockedStepCount} گام مسدود داریم` : ""}. پیشنهاد بده چطوری جلو برم.`}
          contexts={[
            {
              id: "roadmap_full",
              type: "roadmap",
              title: "نقشه راه پروژه",
              subtitle: `${totalSteps} گام · ${progressPercent}٪`,
              data: { overview: true, totalSteps, completedCount, progressPercent, blockedStepCount },
              icon: "Map",
            },
          ]}
          label="بپرس از دستیار درباره نقشه راه"
        />
      </div>

      {/* Reworked Mission Control Header */}
      <div data-tour-id="roadmap-header">
      <RoadmapMissionControl
        projectName={plan.projectName}
        projectType={plan.projectType}
        progressPercent={progressPercent}
        completedCount={completedCount}
        remainingCount={remainingCount}
        totalSteps={totalSteps}
        roadmap={roadmap}
        velocity={velocity}
        completedSteps={completedSteps}
        gamification={gamification}
        aiInsight={aiInsight}
        isLoadingInsight={isLoadingInsight}
        topPrioritySteps={topPrioritySteps}
        streak={streak}
        bestStreak={bestStreak}
      />
      </div>

      {/* Weekly Sprint Mode Panel */}
      {sprintMode && (
        <RoadmapSprintPanel
          sprintSteps={sprintSteps}
          completedSteps={completedSteps}
          weekNumber={activeWeek}
          weekStart={weekStart}
          weekEnd={weekEnd}
          onToggleStep={(step) => handleUpdateStatus(step, completedSteps.includes(step.title) ? "todo" : "done")}
          onOpenStep={(step) => handleOpenStepDetail(step)}
          projectType={plan.projectType}
        />
      )}

      {/* Gamification HUD */}
      <GamificationHud
        state={gamification}
        badges={gamification.badges}
        xpEvents={gamification.xpEvents}
        showLevelUp={gamification.showLevelUp}
        setShowLevelUp={gamification.setShowLevelUp}
        projectType={plan.projectType}
      />

      {/* Toolbar */}
      <div data-tour-id="roadmap-toolbar">
      <RoadmapToolbar
        view={view}
        onViewChange={setView}
        filter={filter}
        onFilterChange={setFilter}
        totalSteps={totalSteps}
        filteredCount={displayRoadmap.reduce(
          (acc, p) => acc + p.steps.length,
          0
        )}
        onExport={handleExport}
        sprintMode={sprintMode}
        onToggleSprintMode={() => setSprintMode(!sprintMode)}
      />
      </div>

      {/* Active view */}
      <div className="min-h-[400px]">
        {view === "analytics" ? (
          <RoadmapAnalytics
            roadmap={roadmap}
            completedSteps={completedSteps}
            stepStatuses={stepStatuses}
            totalSteps={totalSteps}
            velocity={velocity}
            subTasks={plan?.subTasks as SubTask[] | undefined}
          />
        ) : view === "calendar" ? (
          <RoadmapCalendar
            roadmap={roadmap}
            completedSteps={completedSteps}
            stepStatuses={stepStatuses}
            getStepStatus={getStepStatus}
            onOpenStepDetail={handleOpenStepDetail}
          />
        ) : view === "gantt" ? (
          <RoadmapGantt
            roadmap={roadmap}
            completedSteps={completedSteps}
            getStepDisplayState={getStepDisplayState}
            onOpenStepDetail={(step) => handleOpenStepDetail(step)}
            velocity={velocity}
          />
        ) : displayRoadmap.length === 0 ? (
          <EmptyState
            title="نتیجه‌ای یافت نشد"
            description="با فیلترهای فعلی هیچ گامی پیدا نشد. فیلترها را تغییر دهید."
            size="md"
          />
        ) : view === "kanban" ? (
          <RoadmapKanban
            roadmap={displayRoadmap}
            getStepStatus={getStepStatus}
            getStepDisplayState={getStepDisplayState}
            onToggleStep={toggleStep}
            onOpenStepDetail={handleOpenStepDetail}
            onUpdateStepStatus={handleUpdateStatus}
            subTasks={plan?.subTasks as SubTask[] | undefined}
          />
        ) : view === "list" ? (
          <RoadmapList
            roadmap={displayRoadmap}
            getStepStatus={getStepStatus}
            getStepDisplayState={getStepDisplayState}
            onToggleStep={toggleStep}
            onOpenStepDetail={handleOpenStepDetail}
            onUpdateStepStatus={handleUpdateStatus}
            subTasks={plan?.subTasks as SubTask[] | undefined}
          />
        ) : (
          <div data-tour-id="phases-container">
          <RoadmapJourney
            roadmap={displayRoadmap}
            completedSteps={completedSteps}
            getStepDisplayState={getStepDisplayState}
            onToggleStep={toggleStep}
            onOpenStepDetail={handleOpenStepDetail}
            subTasks={plan?.subTasks as SubTask[] | undefined}
            projectType={plan.projectType}
          />
          </div>
        )}
      </div>

      {/* Floating AI Co-Pilot Panel */}
      <RoadmapAiCopilot
        projectName={plan.projectName}
        projectType={plan.projectType}
        progressPercent={progressPercent}
        blockedStepCount={blockedStepCount}
        currentStepTitle={currentStep?.step?.title}
      />

      {/* Today's Focus Bar */}
      <TodayFocusBar
        currentStep={currentStep}
        progressPercent={progressPercent}
        velocity={velocity}
        remainingCount={remainingCount}
        onOpenStep={(step, phase) => handleOpenStepDetail(step, phase)}
        onQuickComplete={handleQuickComplete}
      />

      {/* Step Detail Slide-over */}
      <StepSlideOver
        step={selectedStep}
        phaseName={selectedPhase?.phase ?? ""}
        weekNumber={selectedPhase?.weekNumber}
        isOpen={slideOpen}
        onClose={handleCloseSlide}
        status={selectedStatus}
        isUnlocked={selectedUnlocked}
        onUpdateStatus={(status, meta) =>
          selectedStep && handleUpdateStatus(selectedStep, status, meta)
        }
        subTasks={stepSubTasks}
        onSubTaskToggle={handleSubTaskToggle}
        onBreakTask={handleBreakTask}
        isBreakingTask={isBreakingTask}
        projectName={plan?.projectName}
        projectType={plan?.projectType}
        onSetDueDate={handleSetDueDate}
        onComplete={triggerCelebration}
        onSaveNotes={handleSaveNotes}
      />

      {/* Phase Completion Full-screen Celebration Overlay */}
      {celebrationPhase && (
        <RoadmapMilestoneCelebration
          isOpen={celebrationOpen}
          onClose={() => setCelebrationOpen(false)}
          phaseName={celebrationPhase.name}
          phaseNumber={celebrationPhase.number}
          totalPhases={totalPhases}
          newRank={getRankTitle(gamification.level, plan.projectType)}
          projectType={plan.projectType}
        />
      )}
    </div>
  );
}
