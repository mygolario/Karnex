"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  EVIDENCE_LABELS,
  VALIDATION_EVIDENCE_LEVELS,
  isBriefReady,
  type ValidationBrief,
  type ValidationEvidenceLevel,
} from "@/lib/validation/types";
import { Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const FIELDS: {
  key: keyof Omit<ValidationBrief, "evidenceLevel">;
  label: string;
  placeholder: string;
  rows: number;
}[] = [
  {
    key: "problem",
    label: "مسئله",
    placeholder: "درد اصلی مشتری چیست؟ چرا الان؟",
    rows: 2,
  },
  {
    key: "whoSuffers",
    label: "چه کسانی رنج می‌برند",
    placeholder: "مخاطب مشخص — شغل، سن، موقعیت",
    rows: 2,
  },
  {
    key: "currentSolution",
    label: "راه‌حل فعلی بازار",
    placeholder: "الان چطور حل می‌کنند؟ اکسل، واسطه، هیچی؟",
    rows: 2,
  },
  {
    key: "unfairAdvantage",
    label: "مزیت ناعادلانه / بینش",
    placeholder: "چرا تو؟ چه چیزی می‌دانی که دیگران نمی‌دانند؟",
    rows: 2,
  },
];

export function ValidationBriefForm({
  brief,
  onChange,
  onSubmit,
  loading,
  filledFromProject,
  className,
}: {
  brief: ValidationBrief;
  onChange: (next: ValidationBrief) => void;
  onSubmit: () => void;
  loading?: boolean;
  filledFromProject?: string[];
  className?: string;
}) {
  const ready = isBriefReady(brief);

  return (
    <div
      className={cn(
        "rounded-2xl border bg-card/80 p-4 sm:p-6 space-y-4",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black">بریف اعتبارسنجی</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            هرچه دقیق‌تر بنویسی، حکم و آزمایش‌ها واقعی‌تر می‌شوند.
          </p>
        </div>
        <Button
          onClick={onSubmit}
          disabled={loading || !ready}
          className="gap-2 shrink-0 sticky bottom-4 sm:static"
          size="lg"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {loading ? "در حال تحلیل..." : "تحلیل کن"}
        </Button>
      </div>

      {filledFromProject && filledFromProject.length > 0 && (
        <p className="text-xs text-muted-foreground rounded-lg bg-muted/40 px-3 py-2">
          از پروژه خوانده شد: {filledFromProject.join("، ")}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((field) => (
          <div key={field.key} className="space-y-1.5 sm:col-span-1">
            <Label htmlFor={`brief-${field.key}`} className="text-sm font-medium">
              {field.label}
              {field.key === "problem" || field.key === "whoSuffers" ? (
                <span className="text-destructive ms-1">*</span>
              ) : null}
            </Label>
            <Textarea
              id={`brief-${field.key}`}
              rows={field.rows}
              value={brief[field.key]}
              placeholder={field.placeholder}
              onChange={(e) =>
                onChange({ ...brief, [field.key]: e.target.value })
              }
              className="resize-none text-sm"
            />
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">سطح شواهد تا الان</Label>
        <div className="flex flex-wrap gap-2">
          {VALIDATION_EVIDENCE_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() =>
                onChange({
                  ...brief,
                  evidenceLevel: level as ValidationEvidenceLevel,
                })
              }
              className={cn(
                "rounded-xl border px-3 py-2 text-xs font-medium transition-colors",
                brief.evidenceLevel === level
                  ? "border-indigo-500/40 bg-indigo-500/10 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {EVIDENCE_LABELS[level]}
            </button>
          ))}
        </div>
      </div>

      {!ready && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          برای شروع، مسئله و مخاطب را حداقل کوتاه بنویس.
        </p>
      )}

      {ready &&
        brief.evidenceLevel === "none" &&
        !brief.currentSolution.trim() &&
        !brief.unfairAdvantage.trim() && (
          <p className="text-xs text-muted-foreground rounded-lg border border-dashed px-3 py-2">
            بریف نازک است — گزارش با اطمینان پایین‌تر می‌آید. راه‌حل فعلی یا مزیتت را هم
            اضافه کن تا حکم دقیق‌تر شود.
          </p>
        )}
    </div>
  );
}
