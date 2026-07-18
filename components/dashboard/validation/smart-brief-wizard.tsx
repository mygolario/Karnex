"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  EVIDENCE_LABELS,
  VALIDATION_EVIDENCE_LEVELS,
  isBriefReady,
  type ValidationBrief,
  type ValidationEvidenceLevel,
} from "@/lib/validation/types";
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = [
  {
    key: "problem" as const,
    label: "مسئله چیست؟",
    hint: "درد اصلی مشتری را واضح بنویس — چرا الان؟",
    placeholder: "مثلاً: فروشگاه‌های کوچک موجودی را با اکسل اشتباه می‌گیرند و سفارش‌ها دیر می‌رسد…",
    required: true,
  },
  {
    key: "whoSuffers" as const,
    label: "چه کسانی رنج می‌برند؟",
    hint: "مخاطب مشخص — شغل، اندازه کسب‌وکار، شهر",
    placeholder: "مثلاً: مالکان فروشگاه مواد غذایی در شهرهای کوچک…",
    required: true,
  },
  {
    key: "currentSolution" as const,
    label: "الان چطور حل می‌کنند؟",
    hint: "اکسل، واسطه، هیچی؟ (اختیاری ولی مفید)",
    placeholder: "راه‌حل فعلی بازار…",
    required: false,
  },
  {
    key: "unfairAdvantage" as const,
    label: "چرا تو؟",
    hint: "مزیت ناعادلانه یا بینش (اختیاری)",
    placeholder: "چه چیزی می‌دانی که دیگران نمی‌دانند؟",
    required: false,
  },
  {
    key: "evidence" as const,
    label: "سطح شواهد تا الان",
    hint: "صادق باش — شواهد واقعی اطمینان را بالا می‌برد",
    placeholder: "",
    required: false,
  },
  {
    key: "topWorry" as const,
    label: "الان بیشتر نگران چی هستی؟",
    hint: "اختیاری — نقد و آزمایش را شخصی‌تر می‌کند",
    placeholder: "مثلاً: اینکه کسی حاضر نباشد پول بدهد…",
    required: false,
  },
] as const;

function contextStrength(brief: ValidationBrief): number {
  let score = 0;
  if (brief.problem.trim().length >= 8) score += 25;
  if (brief.whoSuffers.trim().length >= 3) score += 25;
  if (brief.currentSolution.trim()) score += 15;
  if (brief.unfairAdvantage.trim()) score += 15;
  if (brief.evidenceLevel !== "none") score += 10;
  if (brief.topWorry?.trim()) score += 10;
  return Math.min(100, score);
}

export function SmartBriefWizard({
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
  const [step, setStep] = useState(0);
  const ready = isBriefReady(brief);
  const strength = contextStrength(brief);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const canNext = () => {
    if (current.key === "problem") return brief.problem.trim().length >= 8;
    if (current.key === "whoSuffers") return brief.whoSuffers.trim().length >= 3;
    return true;
  };

  return (
    <div
      className={cn(
        "rounded-xl border bg-card/80 p-4 sm:p-5 space-y-4",
        className
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>
            گام {step + 1} از {STEPS.length}
          </span>
          <span>غنای زمینه: {strength}٪</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
        <Progress value={strength} className="h-1 opacity-60" />
      </div>

      {filledFromProject && filledFromProject.length > 0 && (
        <p className="text-xs text-muted-foreground rounded-lg bg-muted/40 px-3 py-2">
          از پروژه خوانده شد: {filledFromProject.join("، ")}
        </p>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={current.key}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="space-y-3 min-h-[160px]"
        >
          <div>
            <Label className="text-base font-bold">
              {current.label}
              {current.required && (
                <span className="text-destructive ms-1">*</span>
              )}
            </Label>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {current.hint}
            </p>
          </div>

          {current.key === "evidence" ? (
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
                      ? "border-ai/40 bg-ai/10 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground"
                  )}
                >
                  {EVIDENCE_LABELS[level]}
                </button>
              ))}
            </div>
          ) : (
            <Textarea
              rows={4}
              value={
                current.key === "topWorry"
                  ? brief.topWorry || ""
                  : brief[current.key]
              }
              placeholder={current.placeholder}
              onChange={(e) => {
                if (current.key === "topWorry") {
                  onChange({ ...brief, topWorry: e.target.value });
                } else {
                  onChange({ ...brief, [current.key]: e.target.value });
                }
              }}
              className="resize-none text-sm"
            />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="gap-1"
        >
          <ChevronRight className="h-4 w-4" />
          قبلی
        </Button>

        <div className="flex gap-2">
          {!isLast && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!canNext()}
              onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
              className="gap-1"
            >
              بعدی
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          {(isLast || ready) && (
            <Button
              type="button"
              size="sm"
              disabled={loading || !ready}
              onClick={onSubmit}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {loading ? "در حال تحلیل..." : "گرفتن تصویر سریع"}
            </Button>
          )}
        </div>
      </div>

      {!ready && step >= 1 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          برای شروع، مسئله و مخاطب را کامل کن.
        </p>
      )}
    </div>
  );
}

/** @deprecated Use SmartBriefWizard — kept for import compatibility */
export { SmartBriefWizard as ValidationBriefForm };
