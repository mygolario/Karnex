"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  AIOutputShell,
  AIReportLayout,
  AIScoreBadge,
  AIActionBar,
  AIVersionHistory,
  type AIVersionEntry,
} from "@/components/ai-output";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  VERDICT_DESCRIPTIONS,
  VERDICT_LABELS,
  validationReportToMarkdown,
  type IdeaValidationReport,
  type ValidationAssumption,
  type ValidationExperiment,
  type ValidationVerdict,
} from "@/lib/validation/types";
import {
  FlaskConical,
  Target,
  Building2,
  CheckCircle2,
  AlertTriangle,
  CircleDashed,
  LayoutTemplate,
  Map,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCopilotStore } from "@/lib/copilot/store";

const TABS = [
  { id: "summary", label: "خلاصه" },
  { id: "dimensions", label: "ابعاد" },
  { id: "assumptions", label: "فرض‌ها" },
  { id: "experiments", label: "آزمایش‌ها" },
  { id: "comparables", label: "نمونه‌های مشابه" },
  { id: "history", label: "تاریخچه" },
] as const;

const VERDICT_STYLES: Record<ValidationVerdict, string> = {
  go: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  conditional_go:
    "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30",
  pivot: "bg-orange-500/15 text-orange-800 dark:text-orange-200 border-orange-500/30",
  kill: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
};

const RISK_STYLES: Record<string, string> = {
  critical: "border-rose-500/50 bg-rose-500/5",
  major: "border-amber-500/40 bg-amber-500/5",
  minor: "border-border bg-muted/30",
};

function ConfidenceBadge({
  confidence,
}: {
  confidence: IdeaValidationReport["confidence"];
}) {
  const label =
    confidence === "high" ? "اطمینان بالا" : confidence === "low" ? "اطمینان پایین" : "اطمینان متوسط";
  return (
    <Badge variant="outline" className="text-xs font-normal">
      {label}
    </Badge>
  );
}

function ExperimentCard({
  experiment,
  highlighted,
  onAskCopilot,
}: {
  experiment: ValidationExperiment;
  highlighted?: boolean;
  onAskCopilot: (exp: ValidationExperiment) => void;
}) {
  const [open, setOpen] = useState(highlighted || experiment.isPrimary);

  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-3 transition-colors",
        highlighted || experiment.isPrimary
          ? "border-indigo-500/40 bg-indigo-500/5"
          : "border-border"
      )}
    >
      <button
        type="button"
        className="flex w-full items-start justify-between gap-2 text-right"
        onClick={() => setOpen((v) => !v)}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{experiment.title}</h4>
            {(highlighted || experiment.isPrimary) && (
              <Badge className="text-[10px]">این هفته</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">معیار: {experiment.metric || "—"}</p>
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {experiment.steps || "گام‌ها مشخص نشده."}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span>هزینه: {experiment.estimatedCost || "—"}</span>
            <span>زمان: {experiment.estimatedTime || "—"}</span>
          </div>
          <Button
            size="sm"
            className="gap-2"
            onClick={() => onAskCopilot(experiment)}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            شروع با کوپایلت
          </Button>
        </div>
      )}
    </div>
  );
}

function AssumptionRow({
  assumption,
  onFocusExperiment,
}: {
  assumption: ValidationAssumption;
  onFocusExperiment: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        assumption.experimentId && onFocusExperiment(assumption.experimentId)
      }
      className={cn(
        "w-full text-right rounded-xl border p-3 transition-colors",
        RISK_STYLES[assumption.risk] || RISK_STYLES.major,
        assumption.experimentId && "hover:bg-muted/40 cursor-pointer"
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="outline" className="text-[10px] capitalize">
          {assumption.risk === "critical"
            ? "بحرانی"
            : assumption.risk === "minor"
              ? "جزئی"
              : "مهم"}
        </Badge>
        {assumption.experimentId && (
          <span className="text-[10px] text-muted-foreground">
            → آزمایش مرتبط
          </span>
        )}
      </div>
      <p className="text-sm leading-relaxed">{assumption.text}</p>
    </button>
  );
}

export function ValidationReportView({
  report,
  projectName,
  versions,
  activeVersionId,
  onSelectVersion,
  onRegenerate,
  onEditBrief,
}: {
  report: IdeaValidationReport;
  projectName?: string;
  versions: AIVersionEntry[];
  activeVersionId?: string;
  onSelectVersion?: (id: string) => void;
  onRegenerate: () => void;
  onEditBrief: () => void;
}) {
  const [tab, setTab] = useState<string>("summary");
  const [focusExperimentId, setFocusExperimentId] = useState<string | null>(
    report.thisWeekExperimentId || null
  );
  const router = useRouter();
  const { setPendingPrefill, clearMessages } = useCopilotStore();

  const primaryExperiment = useMemo(() => {
    const id = focusExperimentId || report.thisWeekExperimentId;
    return (
      report.experiments.find((e) => e.id === id) ||
      report.experiments.find((e) => e.isPrimary) ||
      report.experiments[0]
    );
  }, [report, focusExperimentId]);

  const summaryBullets = [
    report.critique.summary,
    ...report.critique.strengths.slice(0, 1),
    ...report.critique.weaknesses.slice(0, 1),
  ].filter(Boolean);

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

  const focusExperiment = (id: string) => {
    setFocusExperimentId(id);
    setTab("experiments");
  };

  const hero = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border bg-gradient-to-bl from-indigo-500/10 via-background to-background p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center rounded-xl border px-3 py-1.5 text-base sm:text-lg font-black",
                VERDICT_STYLES[report.verdict]
              )}
            >
              {VERDICT_LABELS[report.verdict]}
            </span>
            <ConfidenceBadge confidence={report.confidence} />
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {report.verdictRationale || VERDICT_DESCRIPTIONS[report.verdict]}
          </p>
          {primaryExperiment && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                size="sm"
                className="gap-2"
                onClick={() => askAboutExperiment(primaryExperiment)}
              >
                <FlaskConical className="h-3.5 w-3.5" />
                آزمایش این هفته: {primaryExperiment.title}
              </Button>
              <Button size="sm" variant="outline" onClick={onEditBrief}>
                ویرایش بریف
              </Button>
            </div>
          )}
        </div>
        <AIScoreBadge
          score={report.overallScore}
          label="امتیاز کلی"
          pillar="startup"
          size="md"
        />
      </div>
    </motion.div>
  );

  return (
    <AIOutputShell
      title="گزارش اعتبارسنجی"
      subtitle={report.critique.summary}
      pillar="startup"
      confidence={report.overallScore}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/dashboard/canvas">
              <LayoutTemplate className="h-3.5 w-3.5" />
              بوم
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href="/dashboard/roadmap">
              <Map className="h-3.5 w-3.5" />
              نقشه راه
            </Link>
          </Button>
        </div>
      }
    >
      <AIReportLayout
        hero={hero}
        summaryBullets={summaryBullets}
        tabs={[...TABS]}
        activeTab={tab}
        onTabChange={setTab}
        reasoning={report.reasoning}
      >
        {tab === "summary" && (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-4 space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                نقاط قوت
              </h3>
              <ul className="text-sm space-y-2">
                {report.critique.strengths.length === 0 && (
                  <li className="text-muted-foreground text-xs">موردی ثبت نشده</li>
                )}
                {report.critique.strengths.map((s, i) => (
                  <li key={i} className="leading-relaxed">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border p-4 space-y-2">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                نقاط ضعف
              </h3>
              <ul className="text-sm space-y-2">
                {report.critique.weaknesses.length === 0 && (
                  <li className="text-muted-foreground text-xs">موردی ثبت نشده</li>
                )}
                {report.critique.weaknesses.map((s, i) => (
                  <li key={i} className="leading-relaxed">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            {report.evidenceChecklist.length > 0 && (
              <div className="rounded-xl border p-4 space-y-3 md:col-span-2">
                <h3 className="font-semibold text-sm">چک‌لیست شواهد</h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {report.evidenceChecklist.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm rounded-lg bg-muted/30 px-3 py-2"
                    >
                      {item.status === "have" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                      ) : item.status === "weak" ? (
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                      ) : (
                        <CircleDashed className="h-4 w-4 text-muted-foreground shrink-0" />
                      )}
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {report.nextActions.length > 0 && (
              <div className="rounded-xl border p-4 space-y-2 md:col-span-2">
                <h3 className="font-semibold text-sm">اقدام بعدی در کارنکس</h3>
                <div className="flex flex-wrap gap-2">
                  {report.nextActions.map((action, i) => {
                    const href =
                      action.target === "canvas"
                        ? "/dashboard/canvas"
                        : action.target === "roadmap"
                          ? "/dashboard/roadmap"
                          : null;
                    if (href) {
                      return (
                        <Button key={i} asChild variant="outline" size="sm">
                          <Link href={href}>{action.label}</Link>
                        </Button>
                      );
                    }
                    return (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          openCopilot(
                            action.detail ||
                              `${action.label}\n\nبر اساس گزارش اعتبارسنجی ایده‌ام راهنمایی کن.`
                          )
                        }
                      >
                        {action.label}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === "dimensions" && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              امتیاز هر بُعد جداست؛ روی یک عدد کلی قفل نشو.
            </p>
            {report.dimensions.map((d) => (
              <div key={d.key} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{d.label}</span>
                  <span className="text-muted-foreground tabular-nums">
                    {d.score}/100
                  </span>
                </div>
                <Progress value={d.score} className="h-2" />
                {d.note && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {d.note}
                  </p>
                )}
              </div>
            ))}
            {report.dimensions.length === 0 && (
              <p className="text-sm text-muted-foreground">ابعادی برنگشته است.</p>
            )}
          </div>
        )}

        {tab === "assumptions" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <Target className="h-3.5 w-3.5" />
              روی فرض بحرانی بزن تا آزمایش مرتبط باز شود.
            </p>
            {report.assumptions.map((a) => (
              <AssumptionRow
                key={a.id}
                assumption={a}
                onFocusExperiment={focusExperiment}
              />
            ))}
            {report.assumptions.length === 0 && (
              <p className="text-sm text-muted-foreground">فرضی ثبت نشده.</p>
            )}
          </div>
        )}

        {tab === "experiments" && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <FlaskConical className="h-3.5 w-3.5" />
              ارزان، سریع، با معیار مشخص. یکی را همین هفته اجرا کن.
            </p>
            {report.experiments.map((e) => (
              <ExperimentCard
                key={e.id}
                experiment={e}
                highlighted={e.id === focusExperimentId}
                onAskCopilot={askAboutExperiment}
              />
            ))}
            {report.experiments.length === 0 && (
              <p className="text-sm text-muted-foreground">آزمایشی ثبت نشده.</p>
            )}
          </div>
        )}

        {tab === "comparables" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {report.comparableStartups.map((c, i) => (
              <div key={i} className="rounded-xl border p-4 space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-500" />
                  {c.name}
                </h4>
                <p className="text-xs text-muted-foreground">شباهت: {c.similarity}</p>
                <p className="text-sm leading-relaxed">{c.lesson}</p>
              </div>
            ))}
            {report.comparableStartups.length === 0 && (
              <p className="text-sm text-muted-foreground">نمونه‌ای برنگشته است.</p>
            )}
          </div>
        )}

        {tab === "history" && (
          <div className="space-y-3">
            <AIVersionHistory
              versions={versions}
              activeId={activeVersionId}
              onSelect={onSelectVersion}
            />
            {versions.length <= 1 && (
              <p className="text-sm text-muted-foreground">
                بعد از تولید مجدد، نسخه‌های قبلی اینجا می‌مانند.
              </p>
            )}
          </div>
        )}
      </AIReportLayout>

      <AIActionBar
        className="mt-4"
        onCopy={() => validationReportToMarkdown(report, projectName)}
        onRegenerate={onRegenerate}
        copilotPrefill={`گزارش اعتبارسنجی ایده‌ام:\nحکم: ${VERDICT_LABELS[report.verdict]}\n${report.verdictRationale}\n\nفرض خطرناک‌ترین را عمیق‌تر نقد کن و آزمایش بهتری پیشنهاد بده.`}
      />
    </AIOutputShell>
  );
}
