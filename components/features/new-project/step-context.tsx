"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { UNKNOWN_ANSWER } from "@/lib/genesis/types";
import { getFieldDef } from "@/lib/genesis/intake-constants";
import { useGenesisWizard } from "./genesis-wizard-context";
import { JargonTip, OptionTile, StickyNav } from "./genesis-ui";
import { toPersianDigits } from "@/lib/utils";

export function StepContext() {
  const {
    answers,
    setAnswer,
    activeSubStep,
    nextSubStep,
    prevSubStep,
    advance,
    retreat,
    contextFieldIds,
    pathMode,
  } = useGenesisWizard();

  const fieldId = contextFieldIds[activeSubStep] || contextFieldIds[0];
  const field = getFieldDef(fieldId);
  const total = Math.max(1, contextFieldIds.length);
  const isLast = activeSubStep >= contextFieldIds.length - 1;
  const value = answers[fieldId] || "";

  const canNext = useMemo(() => {
    if (!field) {
      // empty context list (express with audience already set) — allow advance
      return contextFieldIds.length === 0;
    }
    if (value === UNKNOWN_ANSWER) return true;
    if (field.kind === "text") {
      return value.trim().length >= (field.minChars || 3);
    }
    if (fieldId === "geo" && value === "city") {
      return !!(answers.geo_detail?.trim());
    }
    return !!value.trim();
  }, [field, value, fieldId, answers.geo_detail, contextFieldIds.length]);

  // If express skipped all context fields
  if (contextFieldIds.length === 0) {
    return (
      <div className="w-full max-w-xl mx-auto px-6 pb-28 text-center">
        <p className="text-muted-foreground mb-6">
          اطلاعات پایه کافی است — برو به خلاصه ایده.
        </p>
        <StickyNav
          onBack={retreat}
          onNext={advance}
          nextLabel="برو به تأیید"
        />
      </div>
    );
  }

  if (!field) return null;

  const handleBack = () => {
    if (activeSubStep > 0) prevSubStep();
    else retreat();
  };

  const handleNext = () => {
    if (!canNext) return;
    if (isLast) advance();
    else nextSubStep();
  };

  return (
    <div className="w-full max-w-xl mx-auto px-6 pb-28 md:pb-8">
      <div className="mb-2 text-xs text-muted-foreground">
        شرایط · {toPersianDigits(activeSubStep + 1)} از {toPersianDigits(total)}
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
        <Input
          value={value === UNKNOWN_ANSWER ? "" : value}
          onChange={(e) => setAnswer(fieldId, e.target.value)}
          placeholder={field.placeholder}
          className="h-12 rounded-xl text-base"
        />
      )}

      {fieldId === "geo" && value === "city" && (
        <div className="mt-3">
          <Input
            value={answers.geo_detail || ""}
            onChange={(e) => setAnswer("geo_detail", e.target.value)}
            placeholder="مثلاً تهران، اصفهان، مشهد…"
            className="h-12 rounded-xl text-base"
          />
        </div>
      )}

      {field.allowUnknown && (
        <button
          type="button"
          onClick={() => {
            setAnswer(fieldId, UNKNOWN_ANSWER);
            if (isLast) advance();
            else nextSubStep();
          }}
          className="mt-3 text-xs text-muted-foreground hover:text-foreground"
        >
          نمی‌دانم / بعداً
        </button>
      )}

      <StickyNav
        onBack={handleBack}
        onNext={handleNext}
        nextDisabled={!canNext}
        nextLabel={isLast ? "برو به تأیید" : "ادامه"}
      />
    </div>
  );
}
