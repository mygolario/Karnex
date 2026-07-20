"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
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
  RoadmapAiStrip,
  RoadmapAiCopilot,
  RoadmapSprintPanel,
  RoadmapMilestoneCelebration,
} from "@/components/dashboard/roadmap";
import { Loader2, Map } from "lucide-react";
import { breakTaskAction } from "@/lib/ai-actions";
import type { RoadmapStep, RoadmapPhase, SubTask } from "@/lib/db";
import type { StepStatus } from "@/lib/roadmap/constants";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyProjectState } from "@/components/dashboard/empty-project-state";
import { useGamification } from "@/hooks/use-gamification";
import { exportRoadmapToICS, downloadFile } from "@/lib/export-utils";
import {
  downloadRoadmapMarkdown,
  downloadRoadmapCSV,
  exportRoadmapAsPDF,
} from "@/lib/roadmap/export";
import { getRankTitle } from "@/lib/roadmap/themes";
import { LAUNCH_CONFIG } from "@/lib/launch/config";
import {
  isEmptyRoadmapShell,
  isMeaningfulRoadmap,
} from "@/lib/roadmap/quality";

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

  // Keep slide-over in sync with persisted roadmap (dueDate, notes, etc.)
  const liveSelectedStep = useMemo(() => {
    if (!selectedStep) return null;
    for (const phase of roadmap) {
      for (const s of phase.steps) {
        const obj =
          typeof s === "string" ? ({ title: s } as RoadmapStep) : (s as RoadmapStep);
        if (obj.title === selectedStep.title) return obj;
      }
    }
    return selectedStep;
  }, [selectedStep, roadmap]);

  // Phase Completion Celebration States
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const [celebrationPhase, setCelebrationPhase] = useState<{
    name: string;
    number: number;
  } | null>(null);

  // Track phase completion to trigger full-screen celebration
  const prevCompletedPhasesRef = useRef(completedPhases);
  const prevPhaseDoneRef = useRef<Set<number>>(new Set());
  useEffect(() => {
    const doneIndexes = new Set<number>();
    roadmap.forEach((phase, idx) => {
      const isDone = phase.steps.every((s) => {
        const title = typeof s === "string" ? s : (s as RoadmapStep).title;
        return completedSteps.includes(title);
      });
      if (isDone) doneIndexes.add(idx);
    });

    if (completedPhases > prevCompletedPhasesRef.current && completedPhases > 0) {
      const newlyCompletedIdx = [...doneIndexes].find(
        (idx) => !prevPhaseDoneRef.current.has(idx)
      );
      if (newlyCompletedIdx !== undefined) {
        setCelebrationPhase({
          name: roadmap[newlyCompletedIdx].phase,
          number: newlyCompletedIdx + 1,
        });
        setCelebrationOpen(true);
      }
    }
    prevCompletedPhasesRef.current = completedPhases;
    prevPhaseDoneRef.current = doneIndexes;
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
    (s) => s.parentStep === liveSelectedStep?.title
  ) ?? [];

  // Loading / no project
  if (loading) {
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

  if (!plan) {
    return (
      <EmptyProjectState
        title="برای نقشه راه به پروژه نیاز داری"
        description="اول یک پروژه بساز تا نقشه راه ۱۶ هفته‌ای و مراحل اجرا اینجا نمایش داده شود."
      />
    );
  }

  // Empty / generating / failed / empty-shell roadmap
  if (
    !roadmap ||
    roadmap.length === 0 ||
    isEmptyRoadmapShell(roadmap) ||
    plan.roadmapStatus === "generating" ||
    plan.roadmapStatus === "failed"
  ) {
    const status = plan.roadmapStatus;
    const isShell = isEmptyRoadmapShell(roadmap);
    const showGenerating =
      status === "generating" || (isShell && status !== "failed");

    if (showGenerating) {
      return (
        <div className="container mx-auto max-w-4xl p-6">
          <EmptyState
            icon={Map}
            title="نقشه راه در حال ساخت است"
            description="نقشه راه ۱۶ هفته‌ای در حال تکمیل است و به‌زودی اینجا ظاهر می‌شود."
            size="lg"
          />
          <p className="mt-4 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            معمولاً کمتر از یک دقیقه دیگر...
          </p>
        </div>
      );
    }

    if (status === "failed" || (isShell && status === "failed")) {
      return (
        <div className="container mx-auto max-w-4xl p-6">
          <EmptyState
            icon={Map}
            title="ساخت نقشه راه ناموفق بود"
            description="می‌توانید دوباره تلاش کنید؛ بوم و برند پروژه شما ذخیره شده‌اند."
            size="lg"
            action={{
              label: "تلاش مجدد",
              onClick: () => {
                void updateActiveProject({
                  roadmap: [],
                  roadmapStatus: "generating",
                });
              },
            }}
          />
        </div>
      );
    }

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

  // Guard: length 16 but not meaningful should not render fake "فاز جدید" UI
  if (!isMeaningfulRoadmap(roadmap) && plan.roadmapStatus !== "ready") {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <EmptyState
          icon={Map}
          title="نقشه راه ناقص است"
          description="نقشه راه کامل نیست. می‌توانید دوباره تولید را شروع کنید."
          size="lg"
          action={{
            label: "تلاش مجدد",
            onClick: () => {
              void updateActiveProject({
                roadmap: [],
                roadmapStatus: "generating",
              });
            },
          }}
        />
      </div>
    );
  }

  const selectedStatus = liveSelectedStep
    ? getStepStatus(liveSelectedStep)
    : "todo";
  const selectedUnlocked = liveSelectedStep
    ? isStepUnlocked(liveSelectedStep)
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
      <RoadmapAiStrip
        insight={aiInsight}
        isLoading={isLoadingInsight}
        onRetry={() => generateBriefing(true)}
        askPrompt={`بیا نقشه راه پروژه‌ام رو بررسی کنیم. پیشرفت ${progressPercent}٪ است و الان روی «${currentStep?.step?.title ?? "گام فعلی"}» هستیم${blockedStepCount > 0 ? ` و ${blockedStepCount} گام مسدود داریم` : ""}. پیشنهاد بده چطوری جلو برم.`}
        askContexts={[
          {
            id: "roadmap_full",
            type: "roadmap",
            title: "نقشه راه پروژه",
            subtitle: `${totalSteps} گام · ${progressPercent}٪`,
            data: {
              overview: true,
              totalSteps,
              completedCount,
              progressPercent,
              blockedStepCount,
            },
            icon: "Map",
          },
        ]}
      />

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
        topPrioritySteps={topPrioritySteps}
        streak={streak}
        bestStreak={bestStreak}
        hideGamification={LAUNCH_CONFIG.roadmap.hideGamification}
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
          hideGamification={LAUNCH_CONFIG.roadmap.hideGamification}
        />
      )}

      {/* Gamification HUD — hidden for focused launch */}
      {!LAUNCH_CONFIG.roadmap.hideGamification && (
      <GamificationHud
        state={gamification}
        badges={gamification.badges}
        xpEvents={gamification.xpEvents}
        showLevelUp={gamification.showLevelUp}
        setShowLevelUp={gamification.setShowLevelUp}
        projectType={plan.projectType}
      />
      )}

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
        step={liveSelectedStep}
        phaseName={selectedPhase?.phase ?? ""}
        weekNumber={selectedPhase?.weekNumber}
        isOpen={slideOpen}
        onClose={handleCloseSlide}
        status={selectedStatus}
        isUnlocked={selectedUnlocked}
        onUpdateStatus={(status, meta) =>
          liveSelectedStep && handleUpdateStatus(liveSelectedStep, status, meta)
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
          newRank={
            LAUNCH_CONFIG.roadmap.hideGamification
              ? undefined
              : getRankTitle(gamification.level, plan.projectType)
          }
          projectType={plan.projectType}
        />
      )}
    </div>
  );
}
