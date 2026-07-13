"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn, toPersianDigits } from "@/lib/utils";
import { PILLARS } from "@/app/new-project/genesis-constants";
import type { Pillar } from "@/app/new-project/genesis-constants";
import { useGenesisWizard } from "./genesis-wizard-context";
import { suggestProjectNameAction } from "@/lib/ai-actions";
import { Sparkles, Loader2 } from "lucide-react";
import { useState, useCallback } from "react";
import { toast } from "sonner";

export function StepDetails() {
  const {
    pillar,
    projectName,
    projectVision,
    answers,
    activeSubStep,
    setName,
    setAnswer,
    nextSubStep,
    prevSubStep,
    advance,
    retreat,
  } = useGenesisWizard();
  const [suggestingNames, setSuggestingNames] = useState(false);
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);

  // Build a rich, human-readable context string for the AI name suggestion.
  const buildIdeaContext = useCallback(
    (pillarDef: Pillar): string => {
      const parts: string[] = [];

      parts.push(`دسته کسب‌وکار: ${pillarDef.title}`);
      parts.push(`شرح: ${pillarDef.description}`);

      if (projectName.trim()) {
        parts.push(`نام فعلی کاربر: ${projectName.trim()}`);
      }

      if (projectVision.trim()) {
        parts.push(`چشم‌انداز پروژه: ${projectVision.trim()}`);
      }

      const answeredLabels: string[] = [];
      for (const q of pillarDef.questions) {
        const optId = answers[q.id];
        if (!optId) continue;
        const opt = q.options.find((o) => o.id === optId);
        if (opt) {
          answeredLabels.push(`${q.question}: ${opt.label}`);
        }
      }
      if (answeredLabels.length > 0) {
        parts.push(`جزئیات: ${answeredLabels.join("، ")}`);
      }

      if (pillarDef.projectPlaceholder) {
        parts.push(`سبک نام‌های مرجع: ${pillarDef.projectPlaceholder}`);
      }

      return parts.join("\n");
    },
    [projectName, projectVision, answers]
  );

  const p = PILLARS.find((x) => x.id === pillar);
  if (!p) return null;

  const coreQuestions = p.questions || [];
  const totalSubSteps = coreQuestions.length + 1; // name + questions (vision is its own phase)
  const canSuggestNames = projectName.trim().length >= 2;

  // Determine validity of the current sub-step.
  let isCurrentValid = false;
  let isLastSubStep = false;
  if (activeSubStep === 0) {
    isCurrentValid = projectName.trim().length > 0;
  } else if (activeSubStep <= coreQuestions.length) {
    const q = coreQuestions[activeSubStep - 1];
    isCurrentValid = !!answers[q?.id];
  }
  isLastSubStep = activeSubStep === totalSubSteps - 1;

  const handleNext = () => {
    if (!isCurrentValid) return;
    if (isLastSubStep) {
      advance();
    } else {
      nextSubStep();
    }
  };

  const handlePrev = () => {
    if (activeSubStep === 0) {
      retreat();
    } else {
      prevSubStep();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 pb-20">
      <div className="mb-10 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={cn(
            "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-2xl bg-gradient-to-br text-white",
            p.accent
          )}
        >
          <p.icon className="w-8 h-8" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2"
        >
          تنظیمات {p.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground"
        >
          اطلاعات پایه را وارد کنید تا کارنکس استراتژی شما را بچیند.
        </motion.p>
      </div>

      <div className="min-h-[240px] relative overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Sub-step 0: Project Name */}
          {activeSubStep === 0 && (
            <motion.div
              key="step-name"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 py-2"
            >
              <Label htmlFor="projectName" className="text-xl font-bold block mb-2">
                نام پروژه / برند شما چیست؟
              </Label>
              <Input
                id="projectName"
                value={projectName}
                onChange={(e) => {
                  setName(e.target.value);
                  setNameSuggestions([]);
                }}
                placeholder={p.projectPlaceholder}
                className="h-14 text-lg bg-card/50 border-border/50 focus:border-brand-primary/50 transition-all font-medium"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && isCurrentValid) handleNext();
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                disabled={suggestingNames || !canSuggestNames}
                onClick={async () => {
                  const idea = buildIdeaContext(p);
                  if (!idea) return;
                  setSuggestingNames(true);
                  setNameSuggestions([]);
                  const res = await suggestProjectNameAction(idea);
                  setSuggestingNames(false);
                  if (res.success && res.data?.names?.length) {
                    setNameSuggestions(res.data.names);
                  } else if (res.isLimitError) {
                    toast.error("محدودیت AI");
                  } else {
                    toast.error("پیشنهاد نام ممکن نشد. دوباره تلاش کنید.");
                  }
                }}
              >
                {suggestingNames ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                پیشنهاد نام با AI
              </Button>
              {!canSuggestNames && !suggestingNames && (
                <p className="text-xs text-muted-foreground">
                  برای پیشنهاد نام، حداقل ۲ حرف از ایده یا نام اولیه برند خود را وارد کنید.
                </p>
              )}
              {canSuggestNames && !nameSuggestions.length && !suggestingNames && (
                <p className="text-xs text-muted-foreground">
                  AI بر اساس نام و نوع کسب‌وکار شما، نام‌های مرتبط پیشنهاد می‌دهد.
                </p>
              )}
              {nameSuggestions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {nameSuggestions.map((n) => (
                    <Button key={n} type="button" variant="secondary" size="sm" onClick={() => setName(n)}>
                      {n}
                    </Button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Sub-steps 1..N: pillar questions (explicit Next, no auto-advance) */}
          {coreQuestions.map((q, idx) => {
            const stepNum = idx + 1;
            if (activeSubStep !== stepNum) return null;
            return (
              <motion.div
                key={`step-q-${q.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 py-2"
              >
                <Label className="text-xl font-bold block mb-2">
                  {q.question}
                </Label>
                <div className="grid sm:grid-cols-3 gap-4">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswer(q.id, opt.id)}
                        className={cn(
                          "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300 min-h-[120px]",
                          isSelected
                            ? "bg-brand-primary/10 border-brand-primary text-brand-primary shadow-lg shadow-primary/10"
                            : "bg-card/30 border-border/50 hover:bg-card/60 hover:border-border"
                        )}
                      >
                        <opt.icon
                          className={cn("w-8 h-8", isSelected && "text-brand-primary")}
                        />
                        <span className="font-semibold text-base">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-12 flex items-center justify-between pt-6 border-t border-border/50"
      >
        <Button
          variant="ghost"
          onClick={handlePrev}
          className="text-muted-foreground hover:text-foreground h-12 px-6"
          type="button"
        >
          <ArrowRight className="ms-2 w-4 h-4" />
          {activeSubStep === 0 ? "انتخاب مسیر دیگر" : "مرحله قبل"}
        </Button>

        <Button
          onClick={handleNext}
          disabled={!isCurrentValid}
          size="lg"
          className={cn(
            "h-14 px-8 text-lg font-bold rounded-xl transition-all duration-300",
            isCurrentValid
              ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
              : "opacity-50 cursor-not-allowed"
          )}
          type="button"
        >
          {isLastSubStep ? "ادامه به چشم‌انداز" : "مرحله بعد"}
          <ChevronLeft className="me-2 w-5 h-5" />
        </Button>
      </motion.div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        گام {toPersianDigits(activeSubStep + 1)} از {toPersianDigits(totalSubSteps)} در
        جزئیات
      </p>
    </div>
  );
}
