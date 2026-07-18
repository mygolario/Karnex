"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  AIOutputShell,
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
  type JourneyStage,
  type ValidationVerdict,
} from "@/lib/validation/types";
import {
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  LayoutTemplate,
  Map,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Swords,
  Lightbulb,
} from "lucide-react";
import { HoverExplainer } from "@/components/ui/explainer";

const VERDICT_STYLES: Record<ValidationVerdict, string> = {
  go: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  conditional_go:
    "bg-amber-500/15 text-amber-800 dark:text-amber-200 border-amber-500/30",
  pivot: "bg-orange-500/15 text-orange-800 dark:text-orange-200 border-orange-500/30",
  kill: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
};

function ConfidenceBadge({
  confidence,
}: {
  confidence: IdeaValidationReport["confidence"];
}) {
  const label =
    confidence === "high"
      ? "اطمینان بالا"
      : confidence === "low"
        ? "اطمینان پایین"
        : "اطمینان متوسط";
  return (
    <Badge variant="outline" className="text-xs font-normal">
      {label}
    </Badge>
  );
}

function GlossaryTip({ term, children }: { term: string; children: string }) {
  return (
    <HoverExplainer description={children}>
      <span className="underline decoration-dotted underline-offset-2 text-muted-foreground hover:text-foreground cursor-help">
        {term}
      </span>
    </HoverExplainer>
  );
}

export function DecisionHub({
  report,
  projectName,
  versions,
  activeVersionId,
  onSelectVersion,
  onRegenerate,
  onEditBrief,
  onGoStage,
  onStartExperiment,
  className,
}: {
  report: IdeaValidationReport;
  projectName?: string;
  versions?: AIVersionEntry[];
  activeVersionId?: string;
  onSelectVersion?: (id: string) => void;
  onRegenerate: () => void;
  onEditBrief: () => void;
  onGoStage: (stage: JourneyStage) => void;
  onStartExperiment: () => void;
  className?: string;
}) {
  const [showDims, setShowDims] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  const topRisks = useMemo(
    () =>
      [...report.assumptions]
        .sort((a, b) => {
          const order = { critical: 0, major: 1, minor: 2 };
          return order[a.risk] - order[b.risk];
        })
        .slice(0, 3),
    [report.assumptions]
  );

  const primary =
    report.experiments.find((e) => e.id === report.thisWeekExperimentId) ||
    report.experiments.find((e) => e.isPrimary) ||
    report.experiments[0];

  const isPivotOrKill =
    report.verdict === "pivot" || report.verdict === "kill";

  return (
    <AIOutputShell
      title="تصمیم‌گاه اعتبارسنجی"
      subtitle={report.critique.summary}
      pillar="startup"
      confidence={report.overallScore}
      className={className}
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
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-gradient-to-bl from-ai/10 via-background to-background p-5 sm:p-6 space-y-4"
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
            <p className="text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
              <span>
                <GlossaryTip term="فرض">
                  باوری که هنوز اثبات نشده — باید با آزمایش ارزان کشته یا تأیید شود.
                </GlossaryTip>
              </span>
              <span>
                <GlossaryTip term="پیوت">
                  تغییر مسئله، مخاطب یا راه‌حل بدون رها کردن کامل یادگیری‌ها.
                </GlossaryTip>
              </span>
              <span>
                <GlossaryTip term="WTP">
                  تمایل به پرداخت — آیا مشتری حاضر است برای حل این درد پول بدهد؟
                </GlossaryTip>
              </span>
            </p>
          </div>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
          >
            <AIScoreBadge
              score={report.overallScore}
              label="امتیاز کلی"
              pillar="startup"
              size="md"
            />
          </motion.div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          {primary && (
            <Button size="sm" className="gap-2" onClick={onStartExperiment}>
              <FlaskConical className="h-3.5 w-3.5" />
              آزمایش این هفته: {primary.title}
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onGoStage("evidence")}
          >
            ثبت شواهد
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onGoStage("grounding")}
          >
            بازار و رقبا
          </Button>
          <Button size="sm" variant="ghost" onClick={onEditBrief}>
            ویرایش بریف
          </Button>
        </div>
      </motion.div>

      <div className="mt-4 space-y-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          سه ریسک اصلی
        </h3>
        <div className="space-y-2">
          {topRisks.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => onGoStage("assumptions")}
              className={cn(
                "w-full text-right rounded-xl border p-3 text-sm transition-colors hover:bg-muted/40",
                a.risk === "critical" && "border-rose-500/40 bg-rose-500/5",
                a.risk === "major" && "border-amber-500/30 bg-amber-500/5",
                a.risk === "minor" && "border-border"
              )}
            >
              <Badge variant="outline" className="text-[10px] mb-1">
                {a.risk === "critical"
                  ? "بحرانی"
                  : a.risk === "minor"
                    ? "جزئی"
                    : "مهم"}
              </Badge>
              <p className="leading-relaxed">{a.text}</p>
            </button>
          ))}
          {topRisks.length === 0 && (
            <p className="text-xs text-muted-foreground">فرضی ثبت نشده.</p>
          )}
        </div>
        <Button
          variant="link"
          size="sm"
          className="px-0"
          onClick={() => onGoStage("assumptions")}
        >
          باز کردن تخته فرض‌ها
        </Button>
      </div>

      <div className="mt-4">
        <button
          type="button"
          className="flex w-full items-center justify-between text-sm font-medium py-2"
          onClick={() => setShowWhy((v) => !v)}
        >
          چرا این حکم؟
          {showWhy ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {showWhy && (
          <div className="grid gap-3 md:grid-cols-2 pb-2">
            <div className="rounded-xl border p-3 space-y-2">
              <h4 className="text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                قوت‌ها
              </h4>
              <ul className="text-sm space-y-1.5">
                {report.critique.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border p-3 space-y-2">
              <h4 className="text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                ضعف‌ها
              </h4>
              <ul className="text-sm space-y-1.5">
                {report.critique.weaknesses.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            {report.reasoning && (
              <p className="text-xs text-muted-foreground leading-relaxed md:col-span-2">
                {report.reasoning}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-2">
        <button
          type="button"
          className="flex w-full items-center justify-between text-sm font-medium py-2"
          onClick={() => setShowDims((v) => !v)}
        >
          ابعاد در یک نگاه
          {showDims ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {showDims && (
          <div className="space-y-3 pb-2">
            {report.dimensions.map((d) => (
              <div key={d.key} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{d.label}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {d.score}/100
                  </span>
                </div>
                <Progress value={d.score} className="h-1.5" />
                {d.note && (
                  <p className="text-xs text-muted-foreground">{d.note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isPivotOrKill && (
        <div className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/5 p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-orange-500" />
            {report.verdict === "kill" ? "آنچه یاد گرفتی" : "مسیرهای پیوت"}
          </h3>
          {report.lessonsLearned && (
            <p className="text-sm leading-relaxed">{report.lessonsLearned}</p>
          )}
          {(report.pivotOptions || []).map((p, i) => (
            <div key={i} className="rounded-lg border bg-background/60 p-3 space-y-1">
              <p className="text-sm font-medium">{p.title}</p>
              <p className="text-xs text-muted-foreground">{p.rationale}</p>
              {p.whatChanges && (
                <p className="text-xs">تغییر: {p.whatChanges}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {versions && versions.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-sm font-semibold">تاریخچه نسخه‌ها</h3>
          <AIVersionHistory
            versions={versions}
            activeId={activeVersionId}
            onSelect={onSelectVersion}
          />
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => onGoStage("grounding")}
        >
          <Swords className="h-3.5 w-3.5" />
          زمینه بازار
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => onGoStage("decision")}
        >
          <BookOpen className="h-3.5 w-3.5" />
          جمع‌بندی تصمیم
        </Button>
      </div>

      <AIActionBar
        className="mt-4"
        onCopy={() => validationReportToMarkdown(report, projectName)}
        onRegenerate={onRegenerate}
        copilotPrefill={`گزارش اعتبارسنجی ایده‌ام:\nحکم: ${VERDICT_LABELS[report.verdict]}\n${report.verdictRationale}\n\nفرض خطرناک‌ترین را عمیق‌تر نقد کن و آزمایش بهتری پیشنهاد بده.`}
      />
    </AIOutputShell>
  );
}
