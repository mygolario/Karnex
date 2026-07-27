"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { ProjectType } from "@/app/new-project/genesis-constants";
import {
  isPillarAvailableAtLaunch,
  isPillarComingSoon,
} from "@/lib/launch/config";
import {
  GENESIS_PHASES,
  type GenesisPathMode,
  type GenesisPhase,
  type GenesisDraftV2,
} from "@/lib/genesis/types";
import {
  DEEP_CONTEXT_IDS,
  DEEP_INTERVIEW_IDS,
  EXPRESS_CONTEXT_IDS,
  GENESIS_ASSIST_CAP,
} from "@/lib/genesis/intake-constants";
import {
  buildIdeaFromAnswers,
  estimateGenesisCredits,
  labeledGenesisAnswers,
  resolveAudience,
  resolveBudget,
  resolveGeoSummary,
  scoreGenesisConfidence,
} from "@/lib/genesis/format";

const DRAFT_KEY = "karnex_project_draft";
const FIRST_RUN_COACH_KEY = "karnex_genesis_first_run_coach";

/** Shown when the roadmap is essentially empty (no steps in any phase). */
const ROADMAP_EMPTY_FA =
  "نقشه راه تولیدشده ناقص بود. بوم و برند ساخته شد، پروژه ذخیره می‌شود تا بتوانی نقشه راه را بعداً کامل کنی.";

function sanitizePillar(pillar: ProjectType | null): ProjectType | null {
  if (!pillar) return null;
  if (isPillarComingSoon(pillar) || !isPillarAvailableAtLaunch(pillar)) {
    return "startup";
  }
  return pillar;
}

export { GENESIS_PHASES };
export type { GenesisPhase, GenesisPathMode };

interface GenesisWizardState {
  pathMode: GenesisPathMode;
  pillar: ProjectType | null;
  projectName: string;
  projectVision: string;
  answers: Record<string, string>;
  activeStep: number;
  activeSubStep: number;
  assistUses: number;
  isGenerating: boolean;
  isCreating: boolean;
  generatingPhase: string;
  /** Optional overview peek after core plan returns */
  overviewPeek: string;
  buildChecklist: { id: string; label: string; done: boolean }[];
  error: string;
  hasResumableDraft: boolean;
  showLimitModal: boolean;
  limitModalKind: "ai" | "project";
  limitModalMessage: string;
}

interface GenesisWizardActions {
  setPathMode: (mode: GenesisPathMode) => void;
  selectPillar: (id: ProjectType) => void;
  setName: (v: string) => void;
  setVision: (v: string) => void;
  setAnswer: (qId: string, optId: string) => void;
  goToStep: (step: number) => void;
  /** Jump to the interview/context screen that owns this answer key */
  goToAnswerField: (fieldId: string) => void;
  nextSubStep: () => void;
  prevSubStep: () => void;
  advance: () => void;
  retreat: () => void;
  dismissResume: (restore: boolean) => void;
  clearError: () => void;
  closeLimitModal: () => void;
  reset: () => void;
  /** Returns false if assist cap reached */
  consumeAssist: () => boolean;
  assistsRemaining: number;
  generate: () => Promise<void>;
  interviewFieldIds: string[];
  contextFieldIds: string[];
  currentPhase: GenesisPhase;
  creditEstimate: ReturnType<typeof estimateGenesisCredits>;
  confidence: ReturnType<typeof scoreGenesisConfidence>;
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

function migrateDraft(raw: unknown): GenesisDraftV2 | null {
  if (!raw || typeof raw !== "object") return null;
  const parsed = raw as Record<string, unknown>;

  // v2
  if (parsed.version === 2) {
    return {
      version: 2,
      pathMode: parsed.pathMode === "express" ? "express" : "deep",
      pillar: (parsed.pillar as ProjectType) ?? null,
      projectName: String(parsed.projectName ?? ""),
      projectVision: String(parsed.projectVision ?? ""),
      answers: (parsed.answers as Record<string, string>) ?? {},
      activeStep: Number(parsed.activeStep ?? 0),
      activeSubStep: Number(parsed.activeSubStep ?? 0),
      assistUses: Number(parsed.assistUses ?? 0),
    };
  }

  // Legacy v1 → map into new shape (vision becomes problem/solution polish)
  const legacyAnswers = (parsed.answers as Record<string, string>) ?? {};
  const vision = String(parsed.projectVision ?? "");
  const answers = { ...legacyAnswers };
  if (vision && !answers.problem) {
    answers.problem = vision.slice(0, 200);
  }
  if (legacyAnswers.stage && !answers.stage) {
    answers.stage = legacyAnswers.stage;
  }

  return {
    version: 2,
    pathMode: "deep",
    pillar: (parsed.pillar as ProjectType) ?? null,
    projectName: String(parsed.projectName ?? ""),
    projectVision: vision,
    answers,
    activeStep: Math.min(
      GENESIS_PHASES.length - 1,
      Number(parsed.activeStep ?? 0)
    ),
    activeSubStep: Number(parsed.activeSubStep ?? 0),
    assistUses: 0,
  };
}

function readDraft(): GenesisDraftV2 | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const migrated = migrateDraft(JSON.parse(raw));
    if (
      !migrated ||
      (!migrated.pillar &&
        !migrated.projectName &&
        !migrated.projectVision &&
        Object.keys(migrated.answers).length === 0 &&
        migrated.activeStep === 0)
    ) {
      return null;
    }
    return migrated;
  } catch {
    return null;
  }
}

function writeDraft(draft: GenesisDraftV2) {
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

  const [pathMode, setPathModeState] = useState<GenesisPathMode>("deep");
  const [pillar, setPillar] = useState<ProjectType | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectVision, setProjectVision] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeStep, setActiveStep] = useState(0);
  const [activeSubStep, setActiveSubStep] = useState(0);
  const [assistUses, setAssistUses] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [generatingPhase, setGeneratingPhase] = useState("");
  const [overviewPeek, setOverviewPeek] = useState("");
  const [buildChecklist, setBuildChecklist] = useState([
    { id: "core", label: "بوم و برند", done: false },
    { id: "roadmap", label: "نقشه راه ۱۶ هفته", done: false },
    { id: "save", label: "ذخیره پروژه", done: false },
  ]);
  const [error, setError] = useState("");
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [limitModalKind, setLimitModalKind] = useState<"ai" | "project">("ai");
  const [limitModalMessage, setLimitModalMessage] = useState("");

  const [hasResumableDraft, setHasResumableDraft] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const draftRef = useRef<GenesisDraftV2>({
    version: 2,
    pathMode: "deep",
    pillar: null,
    projectName: "",
    projectVision: "",
    answers: {},
    activeStep: 0,
    activeSubStep: 0,
    assistUses: 0,
  });

  const interviewFieldIds = useMemo(
    () =>
      pathMode === "express"
        ? (["industry", "problem", "solution"] as string[])
        : [...DEEP_INTERVIEW_IDS],
    [pathMode]
  );

  const contextFieldIds = useMemo(() => {
    // Always keep the full express/deep list stable while answering.
    // Filtering audience out when it becomes "filled" removed the field mid-typing
    // and collapsed the context step into the brief.
    if (pathMode === "express") {
      return [...EXPRESS_CONTEXT_IDS] as string[];
    }
    return [...DEEP_CONTEXT_IDS];
  }, [pathMode]);

  const maxStep = GENESIS_PHASES.length - 1;
  const currentPhase = GENESIS_PHASES[activeStep] ?? "welcome";

  useEffect(() => {
    const urlStep = Number(searchParams.get("step"));
    const draft = readDraft();

    if (Number.isFinite(urlStep) && urlStep >= 0 && urlStep <= maxStep) {
      if (draft) {
        setPathModeState(draft.pathMode);
        setPillar(sanitizePillar(draft.pillar));
        setProjectName(draft.projectName);
        setProjectVision(draft.projectVision);
        setAnswers(draft.answers);
        setActiveSubStep(draft.activeSubStep);
        setAssistUses(draft.assistUses);
      }
      setActiveStep(urlStep);
    } else if (draft) {
      setPathModeState(draft.pathMode);
      setPillar(sanitizePillar(draft.pillar));
      setProjectName(draft.projectName);
      setProjectVision(draft.projectVision);
      setAnswers(draft.answers);
      setActiveStep(Math.min(maxStep, draft.activeStep));
      setActiveSubStep(draft.activeSubStep);
      setAssistUses(draft.assistUses);
      if (
        draft.activeStep > 0 ||
        draft.projectName ||
        draft.projectVision ||
        Object.keys(draft.answers).length > 0
      ) {
        setHasResumableDraft(true);
      }
    }

    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    draftRef.current = {
      version: 2,
      pathMode,
      pillar,
      projectName,
      projectVision,
      answers,
      activeStep,
      activeSubStep,
      assistUses,
    };
    const t = setTimeout(() => writeDraft(draftRef.current), 400);
    return () => clearTimeout(t);
  }, [
    pathMode,
    pillar,
    projectName,
    projectVision,
    answers,
    activeStep,
    activeSubStep,
    assistUses,
    hydrated,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("step", String(activeStep));
    router.replace(`/new-project?${params.toString()}`, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, hydrated]);

  const setPathMode = useCallback((mode: GenesisPathMode) => {
    setPathModeState(mode);
    setActiveSubStep(0);
  }, []);

  const selectPillar = useCallback((id: ProjectType) => {
    if (!isPillarAvailableAtLaunch(id)) return;
    setPillar(id);
  }, []);

  const setAnswer = useCallback((qId: string, optId: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: optId }));
  }, []);

  const goToStep = useCallback(
    (step: number) => {
      setActiveStep(Math.max(0, Math.min(maxStep, step)));
      setActiveSubStep(0);
    },
    [maxStep]
  );

  const goToAnswerField = useCallback(
    (fieldId: string) => {
      const interviewIdx = interviewFieldIds.indexOf(fieldId);
      if (interviewIdx >= 0) {
        setActiveStep(2);
        setActiveSubStep(interviewIdx);
        return;
      }
      const contextIdx = contextFieldIds.indexOf(fieldId);
      if (contextIdx >= 0) {
        setActiveStep(3);
        setActiveSubStep(contextIdx);
        return;
      }
      // Fallback: text idea fields → interview, rest → context
      if (
        fieldId === "problem" ||
        fieldId === "solution" ||
        fieldId === "industry" ||
        fieldId === "audience_who"
      ) {
        setActiveStep(2);
        setActiveSubStep(0);
        return;
      }
      setActiveStep(3);
      setActiveSubStep(0);
    },
    [interviewFieldIds, contextFieldIds]
  );

  const nextSubStep = useCallback(() => {
    setActiveSubStep((s) => s + 1);
  }, []);

  const prevSubStep = useCallback(() => {
    setActiveSubStep((s) => Math.max(0, s - 1));
  }, []);

  const advance = useCallback(() => {
    setActiveStep((s) => Math.min(maxStep, s + 1));
    setActiveSubStep(0);
  }, [maxStep]);

  const retreat = useCallback(() => {
    setActiveStep((s) => {
      if (s > 0) return s - 1;
      router.push("/");
      return s;
    });
    setActiveSubStep(0);
  }, [router]);

  const dismissResume = useCallback((restore: boolean) => {
    setHasResumableDraft(false);
    if (!restore) {
      clearDraft();
      setPathModeState("deep");
      setPillar(null);
      setProjectName("");
      setProjectVision("");
      setAnswers({});
      setActiveStep(0);
      setActiveSubStep(0);
      setAssistUses(0);
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
    setPathModeState("deep");
    setPillar(null);
    setProjectName("");
    setProjectVision("");
    setAnswers({});
    setActiveStep(0);
    setActiveSubStep(0);
    setAssistUses(0);
    setError("");
    setOverviewPeek("");
  }, []);

  const consumeAssist = useCallback(() => {
    if (assistUses >= GENESIS_ASSIST_CAP) return false;
    setAssistUses((n) => n + 1);
    return true;
  }, [assistUses]);

  const confidence = useMemo(
    () => scoreGenesisConfidence(answers, projectVision, projectName),
    [answers, projectVision, projectName]
  );

  const creditEstimate = useMemo(
    () => estimateGenesisCredits(assistUses),
    [assistUses]
  );

  const generate = useCallback(async () => {
    if (!user) {
      setError("نشست شما منقضی شده است. لطفاً دوباره وارد شوید و ساخت را ادامه دهید.");
      return;
    }
    if (!pillar) {
      setError("نوع پروژه مشخص نیست. لطفاً یک مرحله به عقب برگردید.");
      return;
    }
    const safePillar = sanitizePillar(pillar) ?? "startup";
    if (safePillar !== pillar) setPillar(safePillar);

    // Quality gate: weak confidence — still allow but warn via tips on brief;
    // hard block only if idea is essentially empty.
    const idea = buildIdeaFromAnswers(answers, projectVision);
    if (idea.length < 12 && !answers.problem?.trim()) {
      setError("قبل از ساخت، حداقل مشکل یا ایده‌ات را بنویس.");
      return;
    }

    setIsGenerating(true);
    setOverviewPeek("");
    setBuildChecklist([
      { id: "core", label: "بوم و برند", done: false },
      { id: "roadmap", label: "نقشه راه ۱۶ هفته", done: false },
      { id: "save", label: "ذخیره پروژه", done: false },
    ]);
    setGeneratingPhase("در حال ساخت بوم و برند...");
    setError("");

    const audience = resolveAudience(answers);
    const budget = resolveBudget(answers);
    const geo = resolveGeoSummary(answers);
    const labeled = labeledGenesisAnswers(answers);
    if (geo) labeled["بازار جغرافیایی"] = geo;

    // Persist both labeled (for AI/humans) and raw ids under genesisAnswers
    const genesisPayload = {
      ...labeled,
      _raw: answers,
    };

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
        isEmptyRoadmapShell,
      } = await import("@/lib/roadmap/quality");

      const coreResult = await generateCorePlanAction({
        projectType: safePillar,
        idea,
        projectName,
        genesisAnswers: labeled,
        audience,
        budget,
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

      const { alignPlanToUserProjectName } = await import(
        "@/lib/roadmap/align-project-name"
      );
      const corePlan = alignPlanToUserProjectName(
        rawCorePlan,
        projectName,
        rawCorePlan.projectName
      );

      if (corePlan.overview) {
        setOverviewPeek(String(corePlan.overview).slice(0, 280));
      }
      setBuildChecklist((prev) =>
        prev.map((c) => (c.id === "core" ? { ...c, done: true } : c))
      );
      setGeneratingPhase("در حال ساخت نقشه راه...");

      const slimCore = {
        projectName: projectName || corePlan.projectName || "",
        overview: corePlan.overview || "",
        canvasSummary: buildCanvasSummaryForRoadmap(corePlan),
      };

      // Use allSettled so a single chunk failure doesn't kill the
      // other chunk's result. Both chunks run in parallel and each
      // is independent — partial success is useful (we can retry the
      // failed chunk and merge with the kept one).
      const [chunk1Result, chunk2Result] = await Promise.allSettled([
        generateRoadmapChunkAction({
          projectType: safePillar,
          idea,
          genesisAnswers: labeled,
          corePlan: slimCore,
          weekStart: 1,
          weekEnd: 8,
        }),
        generateRoadmapChunkAction({
          projectType: safePillar,
          idea,
          genesisAnswers: labeled,
          corePlan: slimCore,
          weekStart: 9,
          weekEnd: 16,
        }),
      ]);

      const chunk1 =
        chunk1Result.status === "fulfilled"
          ? chunk1Result.value
          : {
              error:
                chunk1Result.reason instanceof Error
                  ? chunk1Result.reason.message
                  : "ساخت نقشه راه (هفته‌های ۱–۸) ناموفق بود.",
            };
      const chunk2 =
        chunk2Result.status === "fulfilled"
          ? chunk2Result.value
          : {
              error:
                chunk2Result.reason instanceof Error
                  ? chunk2Result.reason.message
                  : "ساخت نقشه راه (هفته‌های ۹–۱۶) ناموفق بود.",
            };

      const chunk1Ok = !chunk1.error && Array.isArray(chunk1.roadmap);
      const chunk2Ok = !chunk2.error && Array.isArray(chunk2.roadmap);

      // Both chunks failed (or returned no roadmap) — abort cleanly with
      // a tagged error so the client error handler can distinguish
      // roadmap errors from canvas/save errors. Otherwise the user sees
      // a generic "save timeout" message even though the canvas was
      // successfully built.
      if (!chunk1Ok && !chunk2Ok) {
        throw new Error(
          `ROADMAP_BOTH_FAILED::${chunk1.error || "unknown"}||${chunk2.error || "unknown"}`
        );
      }

      // Pad missing weeks with empty shells so the saved plan still has
      // 16 weeks. The repair route (`needsRoadmapRepair`) will retry just
      // the empty weeks when the dashboard loads.
      const padWeeks = (start: number, end: number) => {
        const shells: Array<Record<string, unknown>> = [];
        for (let week = start; week <= end; week++) {
          shells.push({
            phase: `هفته ${week}: فاز جدید`,
            weekNumber: week,
            theme: "",
            icon: "",
            steps: [],
          });
        }
        return shells;
      };

      let roadmap: Array<Record<string, unknown>> = [];
      if (chunk1Ok && chunk2Ok) {
        roadmap = [...(chunk1.roadmap ?? []), ...(chunk2.roadmap ?? [])];
      } else if (chunk1Ok) {
        // Chunk 2 failed — keep chunk 1, pad weeks 9-16 with shells.
        // Tag so dashboard repair knows to retry just weeks 9-16.
        roadmap = [
          ...(chunk1.roadmap ?? []),
          ...padWeeks(9, 16),
        ];
        if (typeof window !== "undefined") {
          console.warn(
            "[genesis] roadmap chunk 2 (weeks 9-16) failed, padded with shells:",
            chunk2.error
          );
        }
      } else {
        // Chunk 1 failed — pad weeks 1-8, keep chunk 2.
        roadmap = [
          ...padWeeks(1, 8),
          ...(chunk2.roadmap ?? []),
        ];
        if (typeof window !== "undefined") {
          console.warn(
            "[genesis] roadmap chunk 1 (weeks 1-8) failed, padded with shells:",
            chunk1.error
          );
        }
      }

      // Only block if the merged output is completely empty.
      if (isEmptyRoadmapShell(roadmap)) {
        throw new Error(`ROADMAP_EMPTY::${ROADMAP_EMPTY_FA}`);
      }

      setBuildChecklist((prev) =>
        prev.map((c) =>
          c.id === "roadmap" || c.id === "core" ? { ...c, done: true } : c
        )
      );
      setGeneratingPhase("در حال ذخیره پروژه...");
      setIsGenerating(false);
      setIsCreating(true);

      // If either chunk failed, mark roadmapStatus as "generating" so the
      // dashboard's repair route knows to retry just the empty weeks.
      // Otherwise the user sees a half-empty roadmap forever.
      const roadmapStatus: "ready" | "generating" =
        chunk1Ok && chunk2Ok ? "ready" : "generating";

      const completePlan = alignPlanToUserProjectName(
        {
          ...corePlan,
          roadmap,
          roadmapStatus,
          projectName,
          projectType: safePillar,
          ideaInput: idea,
          audience,
          budget,
          genesisAnswers: genesisPayload,
        },
        projectName,
        rawCorePlan.projectName
      );

      // Persist without a client race timeout — a short race caused false
      // "زمان ساخت پروژه تمام شد" errors after canvas/roadmap already succeeded.
      await createNewProject(completePlan);
      setBuildChecklist((prev) => prev.map((c) => ({ ...c, done: true })));
      clearDraft();
      try {
        localStorage.setItem(FIRST_RUN_COACH_KEY, "1");
      } catch {
        /* ignore */
      }
      router.push("/dashboard/overview?genesisCoach=1");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "خطای ناشناخته";
      const limitKind =
        err && typeof err === "object" && "limitKind" in err
          ? (err as { limitKind?: string }).limitKind
          : undefined;

      const localizeClientError = (raw: string) => {
        // Tagged roadmap errors come FIRST — they were prefixed with
        // ROADMAP_BOTH_FAILED / ROADMAP_EMPTY by the generate block above.
        // Don't let them fall into the generic mapping below.
        if (raw.startsWith("ROADMAP_BOTH_FAILED::")) {
          return "ساخت نقشه راه ناموفق بود. لطفاً دوباره تلاش کنید — بوم و برند ساخته شده ولی نقشه راه ذخیره نشد.";
        }
        if (raw.startsWith("ROADMAP_EMPTY::")) {
          // Strip the tag and show the clean message.
          return raw.slice("ROADMAP_EMPTY::".length);
        }
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
        // NOTE: the "زمان ساخت پروژه تمام شد" branch is intentionally
        // removed — that string used to leak from `localizeServerAiError`
        // for any non-English server error, including roadmap failures,
        // which made users think project saving timed out when it was
        // actually the roadmap chunk that failed. The tagged roadmap
        // paths above now handle those cases correctly.
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
    pathMode,
    pillar,
    projectName,
    projectVision,
    answers,
    activeStep,
    activeSubStep,
    assistUses,
    isGenerating,
    isCreating,
    generatingPhase,
    overviewPeek,
    buildChecklist,
    error,
    hasResumableDraft,
    showLimitModal,
    limitModalKind,
    limitModalMessage,
    setPathMode,
    selectPillar,
    setName: setProjectName,
    setVision: setProjectVision,
    setAnswer,
    goToStep,
    goToAnswerField,
    nextSubStep,
    prevSubStep,
    advance,
    retreat,
    dismissResume,
    clearError,
    closeLimitModal,
    reset,
    consumeAssist,
    assistsRemaining: Math.max(0, GENESIS_ASSIST_CAP - assistUses),
    generate,
    interviewFieldIds,
    contextFieldIds,
    currentPhase,
    creditEstimate,
    confidence,
  };

  return (
    <GenesisWizardContext.Provider value={value}>
      {children}
    </GenesisWizardContext.Provider>
  );
}
