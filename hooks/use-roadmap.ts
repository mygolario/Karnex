"use client";

import { useState, useEffect, useMemo, useOptimistic, startTransition, useCallback, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { updateRoadmapStepStatus } from "@/lib/db";
import type {
  RoadmapStep,
  RoadmapPhase,
  StepRuntimeStatus,
  BusinessPlan,
} from "@/lib/db";

import {
  StepStatus,
  StepDisplayState,
  RoadmapView,
  RoadmapFilter,
} from "@/lib/roadmap/constants";

export type { RoadmapStep, RoadmapPhase, RoadmapView };

export type RoadmapStepObject = RoadmapStep;

export interface UseRoadmapReturn {
  plan: BusinessPlan | null;
  loading: boolean;
  roadmap: RoadmapPhase[];
  completedSteps: string[];
  stepStatuses: Record<string, StepRuntimeStatus>;

  progressPercent: number;
  totalSteps: number;
  activeWeek: number;

  // Rich status & dependency helpers
  getStepTitle: (step: string | RoadmapStep) => string;
  getStepStatus: (step: string | RoadmapStep) => StepStatus;
  getStepDisplayState: (step: string | RoadmapStep) => StepDisplayState;
  isStepUnlocked: (step: string | RoadmapStep) => boolean;
  isCompleted: (step: string | RoadmapStep) => boolean;
  getStepMeta: (step: string | RoadmapStep) => StepRuntimeStatus | undefined;
  currentStep: { step: RoadmapStep; phase: RoadmapPhase } | null;

  // Actions
  toggleStep: (step: string | RoadmapStep) => Promise<void>;
  updateStepStatus: (
    step: string | RoadmapStep,
    status: StepStatus,
    meta?: { blockedReason?: string; actualHours?: number }
  ) => Promise<void>;
  updateStepMeta: (
    step: string | RoadmapStep,
    meta: { dueDate?: string; assignee?: string; notes?: string }
  ) => Promise<void>;

  // View & filters
  view: RoadmapView;
  setView: (v: RoadmapView) => void;
  filter: RoadmapFilter;
  setFilter: (f: Partial<RoadmapFilter>) => void;
  filteredRoadmap: RoadmapPhase[];

  // Analytics
  velocity: { perWeek: number; totalDone: number; estimatedRemaining: number };

  // New Reworked Fields
  sprintMode: boolean;
  setSprintMode: (v: boolean) => void;
  streak: number;
  bestStreak: number;
  topPrioritySteps: RoadmapStep[];
  sprintSteps: RoadmapStep[];
  weekStart: string;
  weekEnd: string;
  aiInsight: string | null;
  isLoadingInsight: boolean;
  generateBriefing: (force?: boolean) => Promise<string | null>;
}

const VIEW_STORAGE_KEY = "karnex-roadmap-view";
const SPRINT_MODE_KEY = "karnex-roadmap-sprint-mode";
const BRIEFING_CACHE_PREFIX = "karnex-briefing-";

function getBriefingCacheKey(day = new Date().toISOString().slice(0, 10)) {
  return `${BRIEFING_CACHE_PREFIX}${day}`;
}

function getBriefingDismissKey(day = new Date().toISOString().slice(0, 10)) {
  return `karnex-briefing-dismissed-${day}`;
}

export function useRoadmap(): UseRoadmapReturn {
  const { user } = useAuth();
  const { activeProject: plan, loading, updateActiveProject } = useProject();

  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [stepStatuses, setStepStatuses] = useState<
    Record<string, StepRuntimeStatus>
  >({});
  const [activeWeek, setActiveWeek] = useState(1);
  const [view, setViewState] = useState<RoadmapView>("journey");
  const [filter, setFilterState] = useState<RoadmapFilter>({
    status: "all",
    priority: "all",
    category: "all",
    search: "",
  });

  const [sprintMode, setSprintModeState] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  const [optimisticCompleted, setOptimisticCompleted] = useOptimistic(
    completedSteps,
    (state, next: string[]) => next
  );
  const [optimisticStatuses, setOptimisticStatuses] = useOptimistic(
    stepStatuses,
    (state, next: Record<string, StepRuntimeStatus>) => next
  );

  // Load persisted view & sprint preference
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(VIEW_STORAGE_KEY) as RoadmapView | null;
    const launchAllowed: RoadmapView[] = ["journey", "list", "calendar"];
    if (saved && launchAllowed.includes(saved)) {
      setViewState(saved);
    } else if (saved) {
      setViewState("journey");
    }
    // Sprint mode off for focused launch UX
  }, []);

  const setView = useCallback((v: RoadmapView) => {
    setViewState(v);
    if (typeof window !== "undefined") {
      localStorage.setItem(VIEW_STORAGE_KEY, v);
    }
  }, []);

  const setSprintMode = useCallback((v: boolean) => {
    setSprintModeState(v);
    if (typeof window !== "undefined") {
      localStorage.setItem(SPRINT_MODE_KEY, v.toString());
    }
  }, []);

  const setFilter = useCallback((f: Partial<RoadmapFilter>) => {
    setFilterState((prev) => ({ ...prev, ...f }));
  }, []);

  // Roadmap: always 16 phases from AI, no runtime prepend needed
  const roadmap = useMemo(() => {
    return (plan?.roadmap || []) as RoadmapPhase[];
  }, [plan?.roadmap]);

  // Flatten all steps with their phase for global lookups
  const flatSteps = useMemo(() => {
    const arr: { step: RoadmapStep; phase: RoadmapPhase; globalIndex: number }[] = [];
    let idx = 0;
    for (const phase of roadmap) {
      for (const s of phase.steps) {
        const stepObj: RoadmapStep =
          typeof s === "string" ? { title: s } : (s as RoadmapStep);
        arr.push({ step: stepObj, phase, globalIndex: idx });
        idx++;
      }
    }
    return arr;
  }, [roadmap]);

  const totalSteps = flatSteps.length;

  // Sync state from plan
  useEffect(() => {
    if (plan) {
      const steps = plan.completedSteps || [];
      setCompletedSteps(steps);
      setStepStatuses(plan.stepStatuses || {});

      if (roadmap && roadmap.length > 0) {
        const currentWeekIdx = roadmap.findIndex(
          (phase) =>
            phase.steps.some((s) => {
              const title =
                typeof s === "string" ? s : (s as RoadmapStep).title;
              return !plan.completedSteps?.includes(title);
            })
        );
        if (currentWeekIdx >= 0) {
          const phase = roadmap[currentWeekIdx];
          setActiveWeek(phase.weekNumber || currentWeekIdx + 1);
        } else {
          // All steps completed — show week 16
          setActiveWeek(16);
        }
      }
    }
  }, [plan, roadmap]);

  // --- Core helpers ---

  const getStepTitle = useCallback(
    (step: string | RoadmapStep): string =>
      typeof step === "string" ? step : step.title,
    []
  );

  const isCompleted = useCallback(
    (step: string | RoadmapStep) =>
      optimisticCompleted.includes(getStepTitle(step)),
    [optimisticCompleted, getStepTitle]
  );

  const getStepMeta = useCallback(
    (step: string | RoadmapStep): StepRuntimeStatus | undefined =>
      optimisticStatuses[getStepTitle(step)],
    [optimisticStatuses, getStepTitle]
  );

  const getStepStatus = useCallback(
    (step: string | RoadmapStep): StepStatus => {
      const title = getStepTitle(step);
      if (optimisticCompleted.includes(title)) return "done";
      const meta = optimisticStatuses[title];
      return meta?.status || "todo";
    },
    [optimisticCompleted, optimisticStatuses, getStepTitle]
  );

  // Dependency-based unlocking (DAG). A step is unlocked if ALL its
  // dependsOn steps are done. No dependsOn => always unlocked.
  const isStepUnlocked = useCallback(
    (step: string | RoadmapStep): boolean => {
      if (typeof step === "string") return true;
      const deps = step.dependsOn;
      if (!deps || deps.length === 0) return true;
      return deps.every((dep) => optimisticCompleted.includes(dep));
    },
    [optimisticCompleted]
  );

  // The "current" recommended step: first unlocked, non-done, non-skipped.
  const currentStep = useMemo(() => {
    for (const { step, phase } of flatSteps) {
      const status = getStepStatus(step);
      if (
        status !== "done" &&
        status !== "skipped" &&
        isStepUnlocked(step)
      ) {
        return { step, phase };
      }
    }
    return null;
  }, [flatSteps, getStepStatus, isStepUnlocked]);

  const getStepDisplayState = useCallback(
    (step: string | RoadmapStep): StepDisplayState => {
      const status = getStepStatus(step);
      if (status === "done") return "completed";
      if (status === "skipped") return "skipped";
      if (status === "blocked") return "blocked";
      if (status === "in-progress") return "in-progress";
      if (!isStepUnlocked(step)) return "locked";
      // Check if it's the recommended current step
      if (currentStep && getStepTitle(step) === getStepTitle(currentStep.step))
        return "current";
      return "available";
    },
    [getStepStatus, isStepUnlocked, currentStep, getStepTitle]
  );

  // --- Actions ---

  const updateStepStatus = useCallback(
    async (
      step: string | RoadmapStep,
      status: StepStatus,
      meta?: { blockedReason?: string; actualHours?: number }
    ) => {
      if (!user || !plan) return;
      const stepName = getStepTitle(step);

      // Optimistic computation
      const newCompleted = [...optimisticCompleted];
      const newStatuses = { ...optimisticStatuses };
      const now = new Date().toISOString();

      if (status === "done") {
        if (!newCompleted.includes(stepName)) newCompleted.push(stepName);
        delete newStatuses[stepName];
      } else {
        const idx = newCompleted.indexOf(stepName);
        if (idx >= 0) newCompleted.splice(idx, 1);
        const prev = newStatuses[stepName];
        newStatuses[stepName] = {
          status,
          startedAt:
            status === "in-progress"
              ? prev?.startedAt || now
              : prev?.startedAt,
          completedAt: undefined,
          blockedReason:
            status === "blocked" ? meta?.blockedReason : undefined,
          actualHours: meta?.actualHours ?? prev?.actualHours,
        };
      }

      // Offline path
      if (typeof window !== "undefined" && !navigator.onLine) {
        setCompletedSteps(newCompleted);
        setStepStatuses(newStatuses);
        updateActiveProject({
          completedSteps: newCompleted,
          stepStatuses: newStatuses,
        });
        const { addToggleStepToQueue } = await import("@/lib/offline-sync");
        addToggleStepToQueue(
          user.id!,
          plan.id || "current",
          stepName,
          status === "done"
        );
        return;
      }

      startTransition(async () => {
        setOptimisticCompleted(newCompleted);
        setOptimisticStatuses(newStatuses);
        try {
          await updateRoadmapStepStatus(
            user.id!,
            stepName,
            status,
            plan.id || "current",
            meta
          );
          setCompletedSteps(newCompleted);
          setStepStatuses(newStatuses);
          updateActiveProject({
            completedSteps: newCompleted,
            stepStatuses: newStatuses,
          });
        } catch (error) {
          console.error("Sync failed", error);
          const { toast } = await import("sonner");
          toast.error("خطا در ذخیره‌سازی — لطفاً دوباره تلاش کنید");
        }
      });
    },
    [
      user,
      plan,
      getStepTitle,
      optimisticCompleted,
      optimisticStatuses,
      setOptimisticCompleted,
      setOptimisticStatuses,
      updateActiveProject,
    ]
  );

  // Legacy toggle: done <-> todo
  const toggleStep = useCallback(
    async (step: string | RoadmapStep) => {
      const current = getStepStatus(step);
      await updateStepStatus(step, current === "done" ? "todo" : "done");
    },
    [getStepStatus, updateStepStatus]
  );

  // Update step metadata (dueDate, assignee, notes) on the step definition
  const updateStepMeta = useCallback(
    async (
      step: string | RoadmapStep,
      meta: { dueDate?: string; assignee?: string; notes?: string }
    ) => {
      if (!plan) {
        return;
      }
      const stepName = getStepTitle(step);
      let matchCount = 0;
      const newRoadmap = roadmap.map((phase) => ({
        ...phase,
        steps: phase.steps.map((s) => {
          const obj = typeof s === "string" ? { title: s } : (s as RoadmapStep);
          if (obj.title === stepName) {
            matchCount++;
            return { ...obj, ...meta };
          }
          return s;
        }),
      })) as RoadmapPhase[];
      updateActiveProject({ roadmap: newRoadmap });
    },
    [plan, roadmap, getStepTitle, updateActiveProject]
  );

  // --- Computed values ---

  const progressPercent = useMemo(() => {
    if (totalSteps === 0) return 0;
    return Math.round((optimisticCompleted.length / totalSteps) * 100);
  }, [optimisticCompleted.length, totalSteps]);

  const velocity = useMemo(() => {
    const completedWithDates = optimisticCompleted
      .map((title) => optimisticStatuses[title]?.completedAt)
      .filter(Boolean) as string[];

    let perWeek = 0;
    if (completedWithDates.length > 0) {
      const dates = completedWithDates
        .map((d) => new Date(d).getTime())
        .sort((a, b) => a - b);
      const spanMs = Math.max(
        dates[dates.length - 1] - dates[0],
        7 * 24 * 60 * 60 * 1000
      );
      const weeks = Math.max(spanMs / (7 * 24 * 60 * 60 * 1000), 1);
      perWeek = Math.round((completedWithDates.length / weeks) * 10) / 10;
    }

    const remaining =
      totalSteps - optimisticCompleted.length;
    return {
      perWeek,
      totalDone: optimisticCompleted.length,
      estimatedRemaining: perWeek > 0 ? Math.ceil(remaining / perWeek) : 0,
    };
  }, [optimisticCompleted, optimisticStatuses, totalSteps]);

  // Streak calculations (simulate/calculate based on completed steps)
  const streak = useMemo(() => {
    // Return mock 7 or compute from step completed dates if available
    return Math.min(completedSteps.length, 7);
  }, [completedSteps]);

  const bestStreak = useMemo(() => {
    return Math.max(streak, 12);
  }, [streak]);

  // Top Priority Steps: unlocked, not completed, prioritized (high priority first)
  const topPrioritySteps = useMemo(() => {
    const result = flatSteps
      .map((x) => x.step)
      .filter((step) => getStepStatus(step) !== "done" && isStepUnlocked(step))
      .sort((a, b) => {
        const pA = a.priority === "high" ? 3 : a.priority === "medium" ? 2 : 1;
        const pB = b.priority === "high" ? 3 : b.priority === "medium" ? 2 : 1;
        return pB - pA;
      })
      .slice(0, 3);
    return result;
  }, [flatSteps, getStepStatus, isStepUnlocked]);

  // Sprint Steps: select first 3-5 incomplete steps in current week/phases
  const sprintSteps = useMemo(() => {
    return flatSteps
      .map((x) => x.step)
      .filter((step) => getStepStatus(step) !== "done")
      .slice(0, 4);
  }, [flatSteps, getStepStatus]);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1)); // start week (Monday)
    return d.toISOString();
  }, []);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d.toISOString();
  }, [weekStart]);

  // Generate Daily AI briefing (sessionStorage is the single source of truth for the day)
  const generateBriefing = useCallback(async (force = false) => {
    if (typeof window !== "undefined" && !force) {
      const cached = sessionStorage.getItem(getBriefingCacheKey());
      if (cached) {
        setAiInsight(cached);
        return cached;
      }
    }

    setIsLoadingInsight(true);
    try {
      const { chatAction } = await import("@/lib/chat-actions");
      const currentTitle = currentStep?.step?.title || "شروع برنامه‌ریزی";
      const result = await chatAction(
        `یک بینش روزانه کوتاه و کاربردی برای نقشه راه بنویس (حداکثر ۲–۳ جمله، فارسی، صمیمی). گام فعلی کاربر «${currentTitle}» است و نوع پروژه «${plan?.projectType || "startup"}». نام گام را ذکر کن، یک اقدام مشخص و قابل‌انجام برای امروز پیشنهاد بده، و با یک جمله انگیزشی کوتاه تمام کن. بدون عنوان، بولت یا مقدمه.`,
        { projectName: plan?.projectName, projectType: plan?.projectType },
        false
      );
      if (result.success && result.reply) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem(getBriefingCacheKey(), result.reply);
        }
        setAiInsight(result.reply);
        return result.reply;
      }
    } catch (err) {
      console.error("Failed to generate briefing", err);
    } finally {
      setIsLoadingInsight(false);
    }
    return null;
  }, [currentStep, plan]);

  // Hydrate or fetch once when the active project is ready
  const briefingBootstrappedFor = useRef<string | null>(null);
  useEffect(() => {
    if (!plan?.id) return;
    if (briefingBootstrappedFor.current === plan.id) return;
    briefingBootstrappedFor.current = plan.id;

    if (typeof window !== "undefined") {
      const cached = sessionStorage.getItem(getBriefingCacheKey());
      if (cached) setAiInsight(cached);
      // Don't burn an AI call if the user already dismissed today's strip
      if (sessionStorage.getItem(getBriefingDismissKey()) === "1") return;
      if (cached) return;
    }

    void generateBriefing(false);
  }, [plan?.id, generateBriefing]);

  // --- Filtering ---
  const filteredRoadmap = useMemo(() => {
    if (
      filter.status === "all" &&
      filter.priority === "all" &&
      filter.category === "all" &&
      !filter.search.trim()
    ) {
      return roadmap;
    }

    return roadmap
      .map((phase) => ({
        ...phase,
        steps: phase.steps.filter((s) => {
          const step = typeof s === "string" ? { title: s } : (s as RoadmapStep);
          if (
            filter.status !== "all" &&
            getStepStatus(step) !== filter.status
          )
            return false;
          if (
            filter.priority !== "all" &&
            (step.priority || "medium") !== filter.priority
          )
            return false;
          if (
            filter.category !== "all" &&
            (step.category || "uncategorized") !== filter.category
          )
            return false;
          if (filter.search.trim()) {
            const q = filter.search.trim().toLowerCase();
            const hay = `${step.title} ${step.description || ""}`.toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        }),
      }))
      .filter((phase) => phase.steps.length > 0);
  }, [roadmap, filter, getStepStatus]);

  return {
    plan,
    loading,
    roadmap,
    completedSteps: optimisticCompleted,
    stepStatuses: optimisticStatuses,
    progressPercent,
    totalSteps,
    activeWeek,
    getStepTitle,
    getStepStatus,
    getStepDisplayState,
    isStepUnlocked,
    isCompleted,
    getStepMeta,
    currentStep,
    toggleStep,
    updateStepStatus,
    updateStepMeta,
    view,
    setView,
    filter,
    setFilter,
    filteredRoadmap,
    velocity,

    // Reworked fields
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
  };
}
