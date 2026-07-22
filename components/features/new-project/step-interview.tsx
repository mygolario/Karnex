"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { UNKNOWN_ANSWER } from "@/lib/genesis/types";
import {
  getFieldDef,
  PAIN_CHIPS,
  resolveOptionLabel,
  GENESIS_ASSIST_CAP,
} from "@/lib/genesis/intake-constants";
import { genesisDraftFromChipsAction, genesisCoachTipAction } from "@/lib/ai-actions";
import { useGenesisWizard } from "./genesis-wizard-context";
import {
  ChipButton,
  JargonTip,
  OptionTile,
  StickyNav,
} from "./genesis-ui";
import { toPersianDigits } from "@/lib/utils";

export function StepInterview() {
  const {
    answers,
    setAnswer,
    activeSubStep,
    nextSubStep,
    prevSubStep,
    advance,
    retreat,
    interviewFieldIds,
    consumeAssist,
    assistsRemaining,
    pathMode,
  } = useGenesisWizard();

  const [painPicks, setPainPicks] = useState<string[]>([]);
  const [drafting, setDrafting] = useState(false);
  const [coaching, setCoaching] = useState(false);
  const [coachTip, setCoachTip] = useState("");
  const [assistError, setAssistError] = useState("");

  const total = Math.max(1, interviewFieldIds.length);
  const safeSubStep = Math.min(
    Math.max(0, activeSubStep),
    interviewFieldIds.length - 1
  );
  const fieldId = interviewFieldIds[safeSubStep] || interviewFieldIds[0];
  const field = getFieldDef(fieldId);
  const isLast = safeSubStep >= total - 1;
  const value = answers[fieldId] || "";

  const canNext = useMemo(() => {
    if (!field) return false;
    if (value === UNKNOWN_ANSWER) return true;
    if (field.kind === "text") {
      return value.trim().length >= (field.minChars || 3);
    }
    return !!value.trim();
  }, [field, value]);

  if (!field) return null;

  const handleBack = () => {
    if (safeSubStep > 0) prevSubStep();
    else retreat();
  };

  const handleNext = () => {
    if (!canNext) return;
    if (isLast) advance();
    else nextSubStep();
  };

  const togglePain = (pain: string) => {
    setPainPicks((prev) =>
      prev.includes(pain)
        ? prev.filter((p) => p !== pain)
        : [...prev, pain].slice(0, 3)
    );
  };

  const runDraftAssist = async () => {
    setAssistError("");
    if (!consumeAssist()) {
      setAssistError(
        `حداکثر ${toPersianDigits(GENESIS_ASSIST_CAP)} کمک هوش مصنوعی در این پیش‌نویس.`
      );
      return;
    }
    setDrafting(true);
    try {
      const industryLabel = answers.industry
        ? resolveOptionLabel("industry", answers.industry)
        : "سایر";
      const res = await genesisDraftFromChipsAction({
        industryLabel,
        painHints: painPicks,
        userNote: answers.problem || "",
      });
      if (!res.success || !res.data) {
        if (res.isLimitError) setAssistError("سقف اعتبار AI تمام شده است.");
        else setAssistError("پیش‌نویس ساخته نشد. دوباره تلاش کن.");
        return;
      }
      setAnswer("problem", res.data.problem);
      setAnswer("solution", res.data.solution);
      setAnswer("audience_who", res.data.audience);
      setCoachTip("پیش‌نویس آماده است — هر بخش را ویرایش کن تا مال خودت شود.");
    } finally {
      setDrafting(false);
    }
  };

  const runCoach = async () => {
    setAssistError("");
    if (!consumeAssist()) {
      setAssistError(
        `حداکثر ${toPersianDigits(GENESIS_ASSIST_CAP)} کمک هوش مصنوعی در این پیش‌نویس.`
      );
      return;
    }
    setCoaching(true);
    try {
      const res = await genesisCoachTipAction({
        fieldLabel: field.question,
        currentText: value,
        ideaContext: [answers.problem, answers.solution]
          .filter(Boolean)
          .join(" | "),
      });
      if (!res.success || !res.data) {
        if (res.isLimitError) setAssistError("سقف اعتبار AI تمام شده است.");
        else setAssistError("راهنما در دسترس نیست.");
        return;
      }
      setCoachTip(res.data.tip);
      if (res.data.improvedDraft) {
        setAnswer(fieldId, res.data.improvedDraft);
      }
    } finally {
      setCoaching(false);
    }
  };

  const industryPains =
    answers.industry && PAIN_CHIPS[answers.industry]
      ? PAIN_CHIPS[answers.industry]
      : PAIN_CHIPS.other;

  return (
    <div className="w-full max-w-xl mx-auto px-6 pb-28 md:pb-8">
      <div className="mb-2 text-xs text-muted-foreground">
        ایده · {toPersianDigits(safeSubStep + 1)} از {toPersianDigits(total)}
        {pathMode === "express" && " · مسیر سریع"}
      </div>

      <motion.h2
        key={`heading-${fieldId}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl md:text-3xl font-bold mb-2"
      >
        {field.question}
      </motion.h2>
      <p className="text-muted-foreground mb-2">{field.helper}</p>
      {field.jargonTip && (
        <div className="mb-4">
          <JargonTip text={field.jargonTip} />
        </div>
      )}

      {field.kind === "chips" && field.options && (
        <div className="flex flex-wrap gap-2 mb-4">
          {field.options.map((opt) => (
            <ChipButton
              key={opt.id}
              label={opt.label}
              selected={value === opt.id}
              onClick={() => setAnswer(fieldId, opt.id)}
            />
          ))}
        </div>
      )}

      {field.kind === "choice" && field.options && (
        <div className="space-y-2 mb-4">
          {field.options.map((opt) => (
            <OptionTile
              key={opt.id}
              label={opt.label}
              hint={opt.hint}
              icon={opt.icon}
              selected={value === opt.id}
              onClick={() => setAnswer(fieldId, opt.id)}
            />
          ))}
        </div>
      )}

      {field.kind === "text" && (
        <Textarea
          key={`input-${fieldId}`}
          value={value === UNKNOWN_ANSWER ? "" : value}
          onChange={(e) => setAnswer(fieldId, e.target.value)}
          placeholder={field.placeholder}
          className="min-h-[140px] text-base rounded-2xl bg-card/50 border-border/60"
        />
      )}

      {fieldId === "industry" && value && value !== UNKNOWN_ANSWER && (
        <div className="mt-6 rounded-2xl border border-border/50 bg-card/30 p-4 space-y-3">
          <p className="text-sm font-medium flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-primary" />
            کدام دردها برایت آشناست؟ (اختیاری)
          </p>
          <div className="flex flex-wrap gap-2">
            {industryPains.map((pain) => (
              <ChipButton
                key={pain}
                label={pain}
                selected={painPicks.includes(pain)}
                onClick={() => togglePain(pain)}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={drafting || assistsRemaining <= 0}
            onClick={runDraftAssist}
            className="text-sm font-semibold text-brand-primary hover:underline disabled:opacity-50 inline-flex items-center gap-2"
          >
            {drafting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            پیش‌نویس ایده با AI بساز
            <span className="text-muted-foreground font-normal">
              (۱ اعتبار · باقی‌مانده {toPersianDigits(assistsRemaining)})
            </span>
          </button>
        </div>
      )}

      {field.kind === "text" && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={coaching || assistsRemaining <= 0}
            onClick={runCoach}
            className="text-xs font-medium text-brand-primary hover:underline disabled:opacity-50 inline-flex items-center gap-1"
          >
            {coaching ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            یک راهنمایی کوتاه بده
          </button>
          {field.allowUnknown && (
            <button
              type="button"
              onClick={() => {
                setAnswer(fieldId, UNKNOWN_ANSWER);
                if (isLast) advance();
                else nextSubStep();
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              نمی‌دانم / بعداً
            </button>
          )}
        </div>
      )}

      {(field.kind === "chips" || field.kind === "choice") &&
        field.allowUnknown && (
          <button
            type="button"
            onClick={() => setAnswer(fieldId, UNKNOWN_ANSWER)}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground"
          >
            نمی‌دانم / بعداً
          </button>
        )}

      {coachTip && (
        <p className="mt-4 text-sm text-brand-primary/90 bg-brand-primary/5 border border-brand-primary/20 rounded-xl px-3 py-2">
          {coachTip}
        </p>
      )}
      {assistError && (
        <p className="mt-2 text-sm text-destructive">{assistError}</p>
      )}

      <StickyNav
        onBack={handleBack}
        onNext={handleNext}
        nextDisabled={!canNext}
        nextLabel={isLast ? "برو به شرایط" : "ادامه"}
      />
    </div>
  );
}
