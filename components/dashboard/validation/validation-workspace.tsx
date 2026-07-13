"use client";

import { useEffect, useMemo, useState } from "react";
import { useProject } from "@/contexts/project-context";
import { Card } from "@/components/ui/card";
import {
  AIGenerationProgressAuto,
  type AIVersionEntry,
} from "@/components/ai-output";
import { LimitReachedModal } from "@/components/shared/limit-reached-modal";
import { toast } from "sonner";
import {
  briefFromProject,
  emptyValidationBrief,
  isBriefReady,
  type IdeaValidationRecord,
  type IdeaValidationReport,
  type ValidationBrief,
} from "@/lib/validation/types";
import { ValidationBriefForm } from "./validation-brief-form";
import { ValidationEmptyHero, ValidationGate } from "./validation-empty";
import { ValidationReportView } from "./validation-report";
import { AnimatePresence, motion } from "framer-motion";

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

export function ValidationWorkspace() {
  const { activeProject: plan, updateActiveProject } = useProject();
  const [brief, setBrief] = useState<ValidationBrief>(emptyValidationBrief());
  const [report, setReport] = useState<IdeaValidationReport | null>(null);
  const [activeId, setActiveId] = useState<string | undefined>();
  const [history, setHistory] = useState<IdeaValidationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showLimit, setShowLimit] = useState(false);
  const [showBrief, setShowBrief] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!plan || plan.projectType !== "startup") return;

    const savedBrief =
      plan.ideaValidationBrief ||
      briefFromProject(plan);
    setBrief(savedBrief);

    const current = plan.ideaValidation;
    const hist = plan.ideaValidationHistory || [];
    const merged = current
      ? [current, ...hist.filter((h) => h.id !== current.id)]
      : hist;

    setHistory(merged);
    if (current?.report) {
      setReport(current.report);
      setActiveId(current.id);
      setShowBrief(false);
    } else {
      setReport(null);
      setActiveId(undefined);
      setShowBrief(true);
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

  if (!plan || plan.projectType !== "startup") {
    return <ValidationGate />;
  }

  const persist = (
    nextReport: IdeaValidationReport,
    nextBrief: ValidationBrief
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
    });

    setHistory([record, ...nextHistory]);
    setActiveId(record.id);
    setReport(nextReport);
  };

  const runValidation = async () => {
    if (!isBriefReady(brief)) {
      toast.error("مسئله و مخاطب را کامل‌تر بنویس");
      setShowBrief(true);
      return;
    }

    setLoading(true);
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
          : brief.evidenceLevel === "waitlist"
            ? "validation"
            : brief.evidenceLevel === "talks"
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
      persist(nextReport, brief);
      setShowBrief(false);
      toast.success("گزارش اعتبارسنجی آماده است");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "خطا در اعتبارسنجی");
    } finally {
      setLoading(false);
    }
  };

  const selectVersion = (id: string) => {
    const found = history.find((h) => h.id === id);
    if (!found) return;
    setActiveId(id);
    setReport(found.report);
    setBrief(found.brief);
    setShowBrief(false);
    updateActiveProject({
      ideaValidation: found,
      ideaValidationBrief: found.brief,
    });
  };

  const scrollToBrief = () => {
    setShowBrief(true);
    requestAnimationFrame(() => {
      document
        .getElementById("validation-brief")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto p-4 pb-24 space-y-4">
        <div className="h-10 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted/50 animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black">اعتبارسنجی ایده</h1>
          <p className="text-muted-foreground text-sm">
            حکم صریح + ابعاد + فرض‌ها + آزمایش ارزان این هفته
          </p>
        </div>
      </div>

      {!report && !loading && (
        <ValidationEmptyHero
          projectName={plan.projectName}
          onStart={scrollToBrief}
        />
      )}

      <AnimatePresence>
        {(showBrief || !report) && (
          <motion.div
            id="validation-brief"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            <ValidationBriefForm
              brief={brief}
              onChange={setBrief}
              onSubmit={runValidation}
              loading={loading}
              filledFromProject={filledFromProject}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <Card className="p-6">
          <AIGenerationProgressAuto
            steps={[
              "خواندن بریف",
              "امتیازدهی ابعاد",
              "شناسایی فرض‌ها",
              "طراحی آزمایش‌ها",
              "صدور حکم",
            ]}
          />
        </Card>
      )}

      {report && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <ValidationReportView
            report={report}
            projectName={plan.projectName}
            versions={versions}
            activeVersionId={activeId}
            onSelectVersion={selectVersion}
            onRegenerate={runValidation}
            onEditBrief={scrollToBrief}
          />
        </motion.div>
      )}

      <LimitReachedModal isOpen={showLimit} onClose={() => setShowLimit(false)} />
    </div>
  );
}
