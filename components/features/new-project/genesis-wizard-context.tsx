"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { ProjectType } from "@/app/new-project/genesis-constants";
import {
  isPillarAvailableAtLaunch,
  isPillarComingSoon,
} from "@/lib/launch/config";

const DRAFT_KEY = "karnex_project_draft";

function sanitizePillar(pillar: ProjectType | null): ProjectType | null {
  if (!pillar) return null;
  if (isPillarComingSoon(pillar) || !isPillarAvailableAtLaunch(pillar)) {
    return "startup";
  }
  return pillar;
}

export const GENESIS_STEPS = ["pillar", "details", "vision", "review"] as const;
export type GenesisStep = (typeof GENESIS_STEPS)[number];

interface GenesisDraft {
  pillar: ProjectType | null;
  projectName: string;
  projectVision: string;
  answers: Record<string, string>;
  activeStep: number;
  activeSubStep: number;
}

interface GenesisWizardState extends GenesisDraft {
  isGenerating: boolean;
  isCreating: boolean;
  /** Human-readable phase while generating (Persian). */
  generatingPhase: string;
  error: string;
  /** True when a recoverable draft was found on mount (drives the resume modal). */
  hasResumableDraft: boolean;
  showLimitModal: boolean;
  limitModalKind: "ai" | "project";
  limitModalMessage: string;
}

interface GenesisWizardActions {
  selectPillar: (id: ProjectType) => void;
  setName: (v: string) => void;
  setVision: (v: string) => void;
  setAnswer: (qId: string, optId: string) => void;
  goToStep: (step: number) => void;
  nextSubStep: () => void;
  prevSubStep: () => void;
  /** Advance from the current step to the next phase. */
  advance: () => void;
  /** Step back within / out of the current phase. */
  retreat: () => void;
  dismissResume: (restore: boolean) => void;
  clearError: () => void;
  closeLimitModal: () => void;
  reset: () => void;
  generate: () => Promise<void>;
}

type GenesisWizardContextValue = GenesisWizardState & GenesisWizardActions;

const GenesisWizardContext = createContext<GenesisWizardContextValue | null>(
  null
);

export function useGenesisWizard() {
  const ctx = useContext(GenesisWizardContext);
  if (!ctx) {
    throw new Error("useGenesisWizard must be used within GenesisWizardProvider");
  }
  return ctx;
}

function readDraft(): GenesisDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<GenesisDraft>;
    if (
      !parsed ||
      (!parsed.pillar &&
        !parsed.projectName &&
        !parsed.projectVision &&
        Object.keys(parsed.answers || {}).length === 0)
    ) {
      return null;
    }
    return {
      pillar: parsed.pillar ?? null,
      projectName: parsed.projectName ?? "",
      projectVision: parsed.projectVision ?? "",
      answers: parsed.answers ?? {},
      activeStep: parsed.activeStep ?? 0,
      activeSubStep: parsed.activeSubStep ?? 0,
    };
  } catch {
    return null;
  }
}

function writeDraft(draft: GenesisDraft) {
  if (typeof window === "undefined") return;
  const hasContent =
    !!draft.pillar ||
    !!draft.projectName ||
    !!draft.projectVision ||
    Object.keys(draft.answers).length > 0 ||
    draft.activeStep > 0;
  if (hasContent) {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } else {
    localStorage.removeItem(DRAFT_KEY);
  }
}

function clearDraft() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_KEY);
}

export function GenesisWizardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { createNewProject } = useProject();

  const [pillar, setPillar] = useState<ProjectType | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectVision, setProjectVision] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [activeSubStep, setActiveSubStep] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generatingPhase, setGeneratingPhase] = useState("");
  const [error, setError] = useState("");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalKind, setLimitModalKind] = useState<"ai" | "project">("ai");
  const [limitModalMessage, setLimitModalMessage] = useState("");

  const [hasResumableDraft, setHasResumableDraft] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Keep latest values for the debounced persister without re-subscribing timers.
  const draftRef = useRef<GenesisDraft>({
    pillar: null,
    projectName: "",
    projectVision: "",
    answers: {},
    activeStep: 0,
    activeSubStep: 0,
  });

  // Hydrate once on mount: URL ?step wins, else localStorage draft, else step 0.
  useEffect(() => {
    const urlStep = Number(searchParams.get("step"));
    const draft = readDraft();

    if (Number.isFinite(urlStep) && urlStep >= 0 && urlStep <= 3) {
      if (draft) {
        setPillar(sanitizePillar(draft.pillar));
        setProjectName(draft.projectName);
        setProjectVision(draft.projectVision);
        setAnswers(draft.answers);
        setActiveSubStep(draft.activeSubStep);
      }
      setActiveStep(urlStep);
    } else if (draft) {
      setPillar(sanitizePillar(draft.pillar));
      setProjectName(draft.projectName);
      setProjectVision(draft.projectVision);
      setAnswers(draft.answers);
      setActiveStep(draft.activeStep);
      setActiveSubStep(draft.activeSubStep);
      if (draft.activeStep > 0 || draft.projectName || draft.projectVision) {
        setHasResumableDraft(true);
      }
    }

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced persistence of the full state (including sub-step).
  useEffect(() => {
    if (!hydrated) return;
    draftRef.current = {
      pillar,
      projectName,
      projectVision,
      answers,
      activeStep,
      activeSubStep,
    };
    const t = setTimeout(() => writeDraft(draftRef.current), 400);
    return () => clearTimeout(t);
  }, [pillar, projectName, projectVision, answers, activeStep, activeSubStep, hydrated]);

  // Sync activeStep to the URL (replace, no scroll, no history spam).
  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(activeStep));
    router.replace(`/new-project?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, hydrated]);

  const selectPillar = useCallback((id: ProjectType) => {
    if (!isPillarAvailableAtLaunch(id)) return;
    setPillar(id);
    setAnswers({});
    setActiveSubStep(0);
  }, []);

  const setAnswer = useCallback((qId: string, optId: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: optId }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setActiveStep(Math.max(0, Math.min(3, step)));
    setActiveSubStep(0);
  }, []);

  const nextSubStep = useCallback(() => {
    setActiveSubStep((s) => s + 1);
  }, []);

  const prevSubStep = useCallback(() => {
    setActiveSubStep((s) => Math.max(0, s - 1));
  }, []);

  const advance = useCallback(() => {
    setActiveStep((s) => Math.min(3, s + 1));
    setActiveSubStep(0);
  }, []);

  const retreat = useCallback(() => {
    setActiveStep((s) => {
      if (s > 0) {
        return s - 1;
      }
      router.push("/");
      return s;
    });
    setActiveSubStep(0);
  }, [router]);

  const dismissResume = useCallback((restore: boolean) => {
    setHasResumableDraft(false);
    if (!restore) {
      clearDraft();
      setPillar(null);
      setProjectName("");
      setProjectVision("");
      setAnswers({});
      setActiveStep(0);
      setActiveSubStep(0);
    }
  }, []);

  const clearError = useCallback(() => setError(""), []);
  const closeLimitModal = useCallback(() => {
    setShowLimitModal(false);
    setLimitModalMessage("");
    setLimitModalKind("ai");
  }, []);

  const reset = useCallback(() => {
    clearDraft();
    setPillar(null);
    setProjectName("");
    setProjectVision("");
    setAnswers({});
    setActiveStep(0);
    setActiveSubStep(0);
    setError("");
  }, []);

  const generate = useCallback(async () => {
    if (!user || !pillar) return;
    const safePillar = sanitizePillar(pillar) ?? "startup";
    if (safePillar !== pillar) {
      setPillar(safePillar);
    }
    setIsGenerating(true);
    setGeneratingPhase("در حال ساخت بوم و برند...");
    setError("");

    try {
      const {
        generateCorePlanAction,
        generateRoadmapChunkAction,
      } = await import("@/lib/project-actions");
      const {
        buildCanvasSummaryForRoadmap,
        getCanvasFromPlan,
        isMeaningfulCanvas,
        isMeaningfulRoadmap,
      } = await import("@/lib/roadmap/quality");

      const coreResult = await generateCorePlanAction({
        projectType: safePillar,
        idea: projectVision,
        projectName,
        genesisAnswers: answers,
        audience: "",
        budget: "",
      });

      if (coreResult.error) {
        throw new Error(
          coreResult.message ||
            coreResult.error ||
            "ساخت بوم و استراتژی ناموفق بود. لطفاً دوباره تلاش کنید."
        );
      }

      const rawCorePlan = coreResult.plan;
      if (!isMeaningfulCanvas(getCanvasFromPlan(rawCorePlan))) {
        throw new Error(
          "بوم کسب‌وکار ناقص تولید شد. لطفاً دوباره تلاش کنید."
        );
      }

      // Prefer the user's chosen name over any AI-invented brand so roadmap
      // titles/overview never diverge from the sidebar project name.
      const { alignPlanToUserProjectName } = await import(
        "@/lib/roadmap/align-project-name"
      );
      const corePlan = alignPlanToUserProjectName(
        rawCorePlan,
        projectName,
        rawCorePlan.projectName
      );

      setGeneratingPhase("در حال ساخت نقشه راه...");

      const slimCore = {
        projectName: projectName || corePlan.projectName || "",
        overview: corePlan.overview || "",
        canvasSummary: buildCanvasSummaryForRoadmap(corePlan),
      };

      const [chunk1, chunk2] = await Promise.all([
        generateRoadmapChunkAction({
          projectType: safePillar,
          idea: projectVision,
          genesisAnswers: answers,
          corePlan: slimCore,
          weekStart: 1,
          weekEnd: 8,
        }),
        generateRoadmapChunkAction({
          projectType: safePillar,
          idea: projectVision,
          genesisAnswers: answers,
          corePlan: slimCore,
          weekStart: 9,
          weekEnd: 16,
        }),
      ]);

      if (chunk1.error || !chunk1.roadmap) {
        throw new Error(
          chunk1.message ||
            chunk1.error ||
            "ساخت نقشه راه (هفته‌های ۱–۸) ناموفق بود. لطفاً دوباره تلاش کنید."
        );
      }
      if (chunk2.error || !chunk2.roadmap) {
        throw new Error(
          chunk2.message ||
            chunk2.error ||
            "ساخت نقشه راه (هفته‌های ۹–۱۶) ناموفق بود. لطفاً دوباره تلاش کنید."
        );
      }

      const roadmap = [...chunk1.roadmap, ...chunk2.roadmap];
      if (!isMeaningfulRoadmap(roadmap)) {
        throw new Error(
          "نقشه راه تولیدشده ناقص بود. لطفاً دوباره تلاش کنید."
        );
      }

      setGeneratingPhase("در حال ذخیره پروژه...");
      setIsGenerating(false);
      setIsCreating(true);

      const completePlan = alignPlanToUserProjectName(
        {
          ...corePlan,
          roadmap,
          roadmapStatus: "ready" as const,
          projectName,
          projectType: safePillar,
          ideaInput: projectVision,
          genesisAnswers: answers,
        },
        projectName,
        rawCorePlan.projectName
      );

      const createPromise = createNewProject(completePlan);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(
          () =>
            reject(
              new Error(
                "زمان ساخت پروژه تمام شد. لطفاً اتصال اینترنت را بررسی کنید و دوباره تلاش کنید."
              )
            ),
          30000
        )
      );

      await Promise.race([createPromise, timeoutPromise]);
      clearDraft();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "خطای ناشناخته";
      const limitKind =
        err && typeof err === "object" && "limitKind" in err
          ? (err as { limitKind?: string }).limitKind
          : undefined;

      const localizeClientError = (raw: string) => {
        if (
          raw.includes("Failed to generate") ||
          raw.includes("Check console") ||
          raw.includes("structured")
        ) {
          return "ساخت استراتژی ناموفق بود. لطفاً دوباره تلاش کنید.";
        }
        if (raw.includes("Failed to create") || raw.includes("Not authenticated")) {
          return "ساخت پروژه ناموفق بود. لطفاً دوباره وارد شوید و تلاش کنید.";
        }
        return raw || "خطا در تولید استراتژی. لطفاً دوباره تلاش کنید.";
      };

      if (
        limitKind === "project" ||
        message.includes("محدودیت تعداد پروژه") ||
        (message.includes("سقف") && message.includes("پروژه"))
      ) {
        setLimitModalKind("project");
        setLimitModalMessage(message);
        setShowLimitModal(true);
      } else if (
        message.includes("AI_LIMIT_REACHED") ||
        message.includes("Limit reached") ||
        message.includes("اعتبار AI")
      ) {
        setLimitModalKind("ai");
        setLimitModalMessage(
          message.includes("اعتبار")
            ? message
            : "سقف اعتبار هوش مصنوعی این ماه تمام شده است."
        );
        setShowLimitModal(true);
      } else {
        setError(localizeClientError(message));
      }
      setIsGenerating(false);
      setIsCreating(false);
      setGeneratingPhase("");
    }
  }, [user, pillar, projectVision, projectName, answers, createNewProject, router]);

  const value: GenesisWizardContextValue = {
    pillar,
    projectName,
    projectVision,
    answers,
    activeStep,
    activeSubStep,
    isGenerating,
    isCreating,
    generatingPhase,
    error,
    hasResumableDraft,
    showLimitModal,
    limitModalKind,
    limitModalMessage,
    selectPillar,
    setName: setProjectName,
    setVision: setProjectVision,
    setAnswer,
    goToStep,
    nextSubStep,
    prevSubStep,
    advance,
    retreat,
    dismissResume,
    clearError,
    closeLimitModal,
    reset,
    generate,
  };

  return (
    <GenesisWizardContext.Provider value={value}>
      {children}
    </GenesisWizardContext.Provider>
  );
}
