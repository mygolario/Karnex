"use client";

import { useEffect, useMemo, useState } from "react";
import { useProject } from "@/contexts/project-context";
import {
  AIGenerationProgressAuto,
  AIStudioLayout,
  type AIVersionEntry,
} from "@/components/ai-output";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FlaskConical, Sparkles } from "lucide-react";
import { useCopilotStore } from "@/lib/copilot/store";
import {
  briefFromProject,
  emptyValidationBrief,
  emptyValidationWorkspace,
  hydrateValidationWorkspace,
  isBriefReady,
  summarizeCompetitorsForValidation,
  workspaceFromReport,
  type AssumptionStatus,
  type EvidenceEntry,
  type ExperimentRunState,
  type IdeaValidationRecord,
  type IdeaValidationReport,
  type IdeaValidationWorkspace,
  type JourneyStage,
  type ValidationAssumption,
  type ValidationBrief,
  type ValidationExperiment,
} from "@/lib/validation/types";
import { SmartBriefWizard } from "./smart-brief-wizard";
import {
  ValidationEmptyActions,
  ValidationEmptyHero,
  ValidationGate,
} from "./validation-empty";
import { ValidationJourneyMap } from "./validation-journey-map";
import { DecisionHub } from "./decision-hub";
import { AssumptionBoard } from "./assumption-board";
import { ExperimentRunner } from "./experiment-runner";
import { EvidenceVault } from "./evidence-vault";
import { GroundingPanel } from "./grounding-panel";
import { ValidationReportView } from "./validation-report";

function detectFilledFields(
  brief: ValidationBrief,
  plan: {
    overview?: string;
    tagline?: string;
    ideaInput?: string;
    audience?: string;
    leanCanvas?: unknown;
  }
): string[] {
  const labels: string[] = [];
  const auto = briefFromProject(plan);
  if (brief.problem && auto.problem && brief.problem === auto.problem) {
    labels.push("مسئله");
  }
  if (brief.whoSuffers && auto.whoSuffers && brief.whoSuffers === auto.whoSuffers) {
    labels.push("مخاطب");
  }
  if (
    brief.currentSolution &&
    auto.currentSolution &&
    brief.currentSolution === auto.currentSolution
  ) {
    labels.push("راه‌حل");
  }
  if (
    brief.unfairAdvantage &&
    auto.unfairAdvantage &&
    brief.unfairAdvantage === auto.unfairAdvantage
  ) {
    labels.push("مزیت");
  }
  return labels;
}

function competitorCount(plan: {
  competitors?: unknown;
  competitorIntel?: { competitors?: unknown[] };
}): number {
  const intel = plan.competitorIntel?.competitors;
  if (Array.isArray(intel) && intel.length) return intel.length;
  if (Array.isArray(plan.competitors)) return plan.competitors.length;
  return 0;
}

export function ValidationStudio() {
  const { activeProject: plan, updateActiveProject } = useProject();
  const router = useRouter();
  const { setPendingPrefill, clearMessages } = useCopilotStore();

  const [brief, setBrief] = useState<ValidationBrief>(emptyValidationBrief());
  const [report, setReport] = useState<IdeaValidationReport | null>(null);
  const [workspace, setWorkspace] = useState<IdeaValidationWorkspace>(
    emptyValidationWorkspace()
  );
  const [activeId, setActiveId] = useState<string | undefined>();
  const [history, setHistory] = useState<IdeaValidationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [rescoreLoading, setRescoreLoading] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);
  const [marketLoading, setMarketLoading] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [showDeepReport, setShowDeepReport] = useState(false);

  useEffect(() => {
    if (!plan || plan.projectType !== "startup") return;

    const savedBrief = plan.ideaValidationBrief || briefFromProject(plan);
    setBrief({ ...emptyValidationBrief(), ...savedBrief });

    const current = plan.ideaValidation;
    const hist = plan.ideaValidationHistory || [];
    const merged = current
      ? [current, ...hist.filter((h) => h.id !== current.id)]
      : hist;

    setHistory(merged);

    if (current?.report) {
      setReport(current.report);
      setActiveId(current.id);
      setWorkspace(
        hydrateValidationWorkspace(
          plan.ideaValidationWorkspace,
          current.report
        )
      );
    } else {
      setReport(null);
      setActiveId(undefined);
      setWorkspace(
        hydrateValidationWorkspace(plan.ideaValidationWorkspace, null)
      );
    }
    setHydrated(true);
  }, [plan?.id]);

  const filledFromProject = useMemo(
    () => (plan ? detectFilledFields(brief, plan) : []),
    [brief, plan]
  );

  const versions: AIVersionEntry[] = useMemo(
    () =>
      history.map((h, i) => ({
        id: h.id,
        label: `نسخه ${history.length - i}`,
        createdAt: h.createdAt,
        summary: h.report.critique.summary,
      })),
    [history]
  );

  const competitorsSummary = useMemo(
    () => (plan ? summarizeCompetitorsForValidation(plan) : ""),
    [plan]
  );

  if (!plan || plan.projectType !== "startup") {
    return <ValidationGate />;
  }

  const persistWorkspace = (next: IdeaValidationWorkspace) => {
    setWorkspace(next);
    updateActiveProject({ ideaValidationWorkspace: next });
  };

  const persistSnapshot = (
    nextReport: IdeaValidationReport,
    nextBrief: ValidationBrief,
    nextWorkspace: IdeaValidationWorkspace
  ) => {
    const record: IdeaValidationRecord = {
      id: `val-${Date.now()}`,
      createdAt: new Date().toISOString(),
      brief: nextBrief,
      report: nextReport,
      projectName: plan.projectName,
    };
    const prevCurrent = plan.ideaValidation;
    const prevHistory = plan.ideaValidationHistory || [];
    const nextHistory = prevCurrent
      ? [prevCurrent, ...prevHistory].slice(0, 12)
      : prevHistory.slice(0, 12);

    updateActiveProject({
      ideaValidation: record,
      ideaValidationHistory: nextHistory,
      ideaValidationBrief: nextBrief,
      ideaValidationWorkspace: nextWorkspace,
    });

    setHistory([record, ...nextHistory]);
    setActiveId(record.id);
    setReport(nextReport);
    setWorkspace(nextWorkspace);
  };

  const setStage = (stage: JourneyStage) => {
    persistWorkspace({ ...workspace, journeyStage: stage });
  };

  const runValidation = async () => {
    if (!isBriefReady(brief)) {
      toast.error("مسئله و مخاطب را کامل‌تر بنویس");
      setStage("brief");
      return;
    }

    setLoading(true);
    setStage("snapshot");
    try {
      const businessIdea =
        brief.problem ||
        plan.overview ||
        plan.tagline ||
        plan.ideaInput ||
        "";

      const stageFromEvidence =
        brief.evidenceLevel === "revenue"
          ? "mvp"
          : brief.evidenceLevel === "waitlist" || brief.evidenceLevel === "talks"
            ? "validation"
            : "idea";

      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate-idea",
          businessIdea,
          projectName: plan.projectName,
          activeProject: plan,
          validationBrief: brief,
          businessStage: stageFromEvidence,
        }),
      });

      if (res.status === 429) {
        setShowLimit(true);
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.validation) {
        throw new Error(data.error || "خطا در اعتبارسنجی");
      }

      const nextReport = data.validation as IdeaValidationReport;
      const nextWs = {
        ...workspaceFromReport(nextReport),
        evidenceEntries: workspace.evidenceEntries,
        groundingMarket: workspace.groundingMarket,
        linkedCompetitorsAt: workspace.linkedCompetitorsAt,
        linkedMarketResearchAt: workspace.linkedMarketResearchAt,
        journeyStage: "snapshot" as JourneyStage,
      };
      persistSnapshot(nextReport, brief, nextWs);
      toast.success("تصویر سریع آماده است");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در اعتبارسنجی");
      setStage("brief");
    } finally {
      setLoading(false);
    }
  };

  const runRescore = async () => {
    if (!report) return;
    setRescoreLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate-idea-rescore",
          projectName: plan.projectName,
          activeProject: plan,
          validationBrief: brief,
          priorReport: report,
          evidenceEntries: workspace.evidenceEntries,
          assumptionStatuses: workspace.assumptionStatuses,
          competitorsSummary,
          marketSummary: workspace.groundingMarket?.summary || "",
        }),
      });

      if (res.status === 429) {
        setShowLimit(true);
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.validation) {
        throw new Error(data.error || "خطا در بازامتیاز");
      }

      const nextReport = data.validation as IdeaValidationReport;
      const nextWs: IdeaValidationWorkspace = {
        ...hydrateValidationWorkspace(workspace, nextReport),
        confidenceOverride: nextReport.confidence,
        journeyStage: "decision",
      };
      persistSnapshot(nextReport, brief, nextWs);
      toast.success("حکم با شواهد جدید به‌روز شد");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در بازامتیاز");
    } finally {
      setRescoreLoading(false);
    }
  };

  const requestScript = async (assumption: ValidationAssumption) => {
    setScriptLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validate-idea-script",
          projectName: plan.projectName,
          activeProject: plan,
          problem: brief.problem,
          whoSuffers: brief.whoSuffers,
          assumptionText: assumption.text,
        }),
      });

      if (res.status === 429) {
        setShowLimit(true);
        return;
      }

      const data = await res.json();
      if (!res.ok || !data.script) {
        throw new Error(data.error || "خطا در ساخت اسکریپت");
      }

      const script = data.script as {
        title?: string;
        questions?: string[];
        tips?: string[];
        opening?: string;
        closing?: string;
      };

      persistWorkspace({
        ...workspace,
        interviewScript: {
          assumptionId: assumption.id,
          title: script.title || "اسکریپت مصاحبه",
          questions: script.questions || [],
          tips: script.tips || [],
          generatedAt: new Date().toISOString(),
        },
      });

      const prefill = [
        script.title || "اسکریپت مصاحبه",
        script.opening || "",
        ...(script.questions || []).map((q, i) => `${i + 1}. ${q}`),
        script.closing || "",
      ]
        .filter(Boolean)
        .join("\n");

      toast.success("اسکریپت آماده شد");
      clearMessages();
      setPendingPrefill(
        `این اسکریپت مصاحبه اعتبارسنجی را برایم آماده اجرا کن و نکات بهبود بده:\n\n${prefill}`
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در اسکریپت");
    } finally {
      setScriptLoading(false);
    }
  };

  const pullMarket = async () => {
    setMarketLoading(true);
    try {
      const res = await fetch("/api/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate-market-research",
          researchType: "trends",
          geography: "ایران",
          businessIdea: brief.problem || plan.ideaInput || plan.overview || "",
          projectName: plan.projectName,
          activeProject: plan,
        }),
      });

      if (res.status === 429) {
        setShowLimit(true);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "خطا در دریافت بازار");
      }

      const research = data.research || data.data || data;
      let summary = "";
      if (Array.isArray(research?.trends)) {
        summary = research.trends
          .map(
            (t: { title?: string; direction?: string; evidence?: string }) =>
              `• ${t.title || "روند"} (${t.direction || "—"}) — ${t.evidence || ""}`
          )
          .join("\n");
      } else {
        summary = JSON.stringify(research).slice(0, 1200);
      }

      persistWorkspace({
        ...workspace,
        journeyStage: "grounding",
        linkedMarketResearchAt: new Date().toISOString(),
        groundingMarket: {
          researchType: "trends",
          summary,
          raw: research,
          pulledAt: new Date().toISOString(),
        },
      });
      toast.success("روند بازار ذخیره شد");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در بازار");
    } finally {
      setMarketLoading(false);
    }
  };

  const selectVersion = (id: string) => {
    const found = history.find((h) => h.id === id);
    if (!found) return;
    setActiveId(id);
    setReport(found.report);
    setBrief({ ...emptyValidationBrief(), ...found.brief });
    const nextWs = hydrateValidationWorkspace(
      {
        ...workspace,
        journeyStage: "snapshot",
      },
      found.report
    );
    updateActiveProject({
      ideaValidation: found,
      ideaValidationBrief: found.brief,
      ideaValidationWorkspace: nextWs,
    });
    setWorkspace(nextWs);
  };

  const fillFromProject = () => {
    const next = briefFromProject(plan);
    setBrief(next);
    updateActiveProject({ ideaValidationBrief: next });
    setStage("brief");
    toast.success("بریف از پروژه پر شد");
  };

  const openCopilot = (prefill: string) => {
    clearMessages();
    setPendingPrefill(prefill);
    router.push("/dashboard/copilot");
  };

  const askAboutExperiment = (exp: ValidationExperiment) => {
    openCopilot(
      `می‌خواهم این آزمایش اعتبارسنجی را اجرا کنم:\nعنوان: ${exp.title}\nگام‌ها: ${exp.steps}\nمعیار موفقیت: ${exp.metric}\nکمک کن برنامه اجرایی ۷ روزه و اسکریپت مصاحبه/لندینگ بسازی.`
    );
  };

  const updateAssumptionStatus = (id: string, status: AssumptionStatus) => {
    persistWorkspace({
      ...workspace,
      assumptionStatuses: { ...workspace.assumptionStatuses, [id]: status },
      journeyStage: "assumptions",
    });
  };

  const updateExperimentRun = (
    experimentId: string,
    patch: Partial<ExperimentRunState>
  ) => {
    const existing = workspace.experiments.find(
      (e) => e.experimentId === experimentId
    );
    const nextRuns = existing
      ? workspace.experiments.map((e) =>
          e.experimentId === experimentId ? { ...e, ...patch } : e
        )
      : [
          ...workspace.experiments,
          {
            experimentId,
            status: "todo" as const,
            notes: "",
            result: "",
            updatedAt: "",
            ...patch,
          },
        ];
    persistWorkspace({
      ...workspace,
      experiments: nextRuns,
      journeyStage: "experiment",
    });
  };

  const addEvidence = (entry: Omit<EvidenceEntry, "id" | "createdAt">) => {
    const next: EvidenceEntry = {
      ...entry,
      id: `ev-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    persistWorkspace({
      ...workspace,
      evidenceEntries: [next, ...workspace.evidenceEntries],
      journeyStage: "evidence",
    });
    toast.success("شاهد ثبت شد");
  };

  const removeEvidence = (id: string) => {
    persistWorkspace({
      ...workspace,
      evidenceEntries: workspace.evidenceEntries.filter((e) => e.id !== id),
    });
  };

  const stage = workspace.journeyStage;
  const hasReport = Boolean(report) && !loading;

  const stickyNext = (() => {
    if (loading) return null;
    if (!report) {
      return {
        label: isBriefReady(brief) ? "گرفتن تصویر سریع" : "ادامه بریف",
        onClick: () => {
          if (isBriefReady(brief)) runValidation();
          else setStage("brief");
        },
      };
    }
    if (stage === "snapshot") {
      return {
        label: "شروع آزمایش این هفته",
        onClick: () => setStage("experiment"),
      };
    }
    if (stage === "assumptions") {
      return {
        label: "رفتن به آزمایش",
        onClick: () => setStage("experiment"),
      };
    }
    if (stage === "experiment") {
      return {
        label: "ثبت شواهد",
        onClick: () => setStage("evidence"),
      };
    }
    if (stage === "evidence") {
      return {
        label:
          workspace.evidenceEntries.length > 0
            ? "بازامتیاز با شواهد"
            : "بازار و رقبا",
        onClick: () => {
          if (workspace.evidenceEntries.length > 0) runRescore();
          else setStage("grounding");
        },
      };
    }
    if (stage === "grounding") {
      return {
        label: "جمع‌بندی تصمیم",
        onClick: () => setStage("decision"),
      };
    }
    return {
      label: "بازگشت به تصمیم‌گاه",
      onClick: () => setStage("snapshot"),
    };
  })();

  if (!hydrated) {
    return (
      <div className="max-w-6xl mx-auto p-4 pb-28 space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted/50 animate-pulse rounded-2xl" />
      </div>
    );
  }

  const inputPanel = (
    <div className="space-y-4">
      {(stage === "brief" || !report) && (
        <SmartBriefWizard
          brief={brief}
          onChange={(b) => {
            setBrief(b);
            updateActiveProject({ ideaValidationBrief: b });
          }}
          onSubmit={runValidation}
          loading={loading}
          filledFromProject={filledFromProject}
        />
      )}

      {hasReport && stage === "assumptions" && report && (
        <AssumptionBoard
          assumptions={report.assumptions}
          statuses={workspace.assumptionStatuses}
          onStatusChange={updateAssumptionStatus}
          onRequestScript={requestScript}
          scriptLoading={scriptLoading}
          onFocusExperiment={() => setStage("experiment")}
        />
      )}

      {hasReport && stage === "experiment" && report && (
        <ExperimentRunner
          experiments={report.experiments}
          runStates={workspace.experiments}
          primaryId={report.thisWeekExperimentId}
          onUpdateRun={updateExperimentRun}
          onAskCopilot={askAboutExperiment}
        />
      )}

      {hasReport && stage === "evidence" && report && (
        <EvidenceVault
          entries={workspace.evidenceEntries}
          assumptions={report.assumptions}
          onAdd={addEvidence}
          onRemove={removeEvidence}
          onRescore={runRescore}
          rescoreLoading={rescoreLoading}
          canRescore={
            workspace.evidenceEntries.length > 0 ||
            Object.values(workspace.assumptionStatuses).some(
              (s) => s !== "open"
            )
          }
        />
      )}

      {hasReport && stage === "grounding" && (
        <GroundingPanel
          competitorsSummary={competitorsSummary}
          competitorCount={competitorCount(plan)}
          marketSnippet={workspace.groundingMarket}
          onPullMarket={pullMarket}
          marketLoading={marketLoading}
          onMarkCompetitorsVisited={() =>
            persistWorkspace({
              ...workspace,
              linkedCompetitorsAt: new Date().toISOString(),
              journeyStage: "grounding",
            })
          }
        />
      )}

      {hasReport &&
        (stage === "snapshot" || stage === "decision") &&
        report && (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground leading-relaxed">
              از مسیر سمت چپ ماژول‌ها را باز کن، یا با «گام بعدی» جلو برو.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStage("assumptions")}
              >
                فرض‌ها
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStage("experiment")}
              >
                آزمایش
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStage("evidence")}
              >
                شواهد
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setStage("grounding")}
              >
                بازار
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setStage("brief")}
              >
                ویرایش بریف
              </Button>
            </div>
            {workspace.interviewScript && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
                <p className="text-xs font-semibold">
                  {workspace.interviewScript.title}
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  {workspace.interviewScript.questions.slice(0, 4).map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
    </div>
  );

  const outputPanel = (
    <div className="space-y-4">
      {loading && (
        <AIGenerationProgressAuto
          steps={[
            "خواندن بریف و زمینه پروژه",
            "امتیازدهی ابعاد",
            "شناسایی فرض‌های خطرناک",
            "طراحی آزمایش این هفته",
            "صدور حکم مربی",
          ]}
        />
      )}

      {!report && !loading && (
        <>
          <ValidationEmptyHero
            projectName={plan.projectName}
            onStart={() => setStage("brief")}
            onFillFromProject={fillFromProject}
          />
          <ValidationEmptyActions
            onStart={() => setStage("brief")}
            onFillFromProject={fillFromProject}
          />
        </>
      )}

      {hasReport && report && (
        <AnimatePresence mode="wait">
          <motion.div
            key={showDeepReport ? "deep" : "hub"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {showDeepReport ? (
              <div className="space-y-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDeepReport(false)}
                >
                  بازگشت به تصمیم‌گاه
                </Button>
                <ValidationReportView
                  report={report}
                  projectName={plan.projectName}
                  versions={versions}
                  activeVersionId={activeId}
                  onSelectVersion={selectVersion}
                  onRegenerate={runValidation}
                  onEditBrief={() => setStage("brief")}
                />
              </div>
            ) : (
              <DecisionHub
                report={report}
                projectName={plan.projectName}
                versions={versions}
                activeVersionId={activeId}
                onSelectVersion={selectVersion}
                onRegenerate={runValidation}
                onEditBrief={() => setStage("brief")}
                onGoStage={setStage}
                onStartExperiment={() => setStage("experiment")}
              />
            )}
          </motion.div>
        </AnimatePresence>
      )}

      {hasReport && !showDeepReport && (
        <Button
          variant="link"
          size="sm"
          className="px-0"
          onClick={() => setShowDeepReport(true)}
        >
          مشاهده گزارش کامل (تب‌ها)
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4 p-4 pb-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              استودیو{" "}
              <span className="text-gradient">اعتبارسنجی</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              تصویر سریع → فرض‌ها → آزمایش → شواهد واقعی
            </p>
          </div>
        </div>
        {report && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={runValidation}
            disabled={loading}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            تولید مجدد (۵ اعتبار)
          </Button>
        )}
      </div>

      <ValidationJourneyMap
        stage={report ? stage : "brief"}
        onSelect={(s) => {
          if (!report && s !== "brief") {
            toast.message("اول تصویر سریع بگیر");
            return;
          }
          setStage(s);
        }}
      />

      <AIStudioLayout inputPanel={inputPanel} outputPanel={outputPanel} />

      {stickyNext && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
          <Button className="w-full gap-2" onClick={stickyNext.onClick}>
            {stickyNext.label}
          </Button>
        </div>
      )}

      <LimitReachedModal
        isOpen={showLimit}
        onClose={() => setShowLimit(false)}
      />
    </div>
  );
}

/** Backward-compatible export */
export { ValidationStudio as ValidationWorkspace };
