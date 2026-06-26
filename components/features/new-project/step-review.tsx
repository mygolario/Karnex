"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  Sparkles,
  Pencil,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PILLARS } from "@/app/new-project/genesis-constants";
import { useGenesisWizard } from "./genesis-wizard-context";

export function StepReview() {
  const {
    pillar,
    projectName,
    projectVision,
    answers,
    isGenerating,
    generate,
    goToStep,
    retreat,
  } = useGenesisWizard();

  const p = PILLARS.find((x) => x.id === pillar);
  if (!p) return null;

  const answeredQuestions = p.questions.filter((q) => answers[q.id]);

  const Row = ({
    label,
    value,
    onEdit,
    editLabel,
  }: {
    label: string;
    value: React.ReactNode;
    onEdit?: () => void;
    editLabel?: string;
  }) => (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border/40 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">{value}</p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center gap-1 text-xs text-brand-primary hover:underline shrink-0"
        >
          <Pencil className="w-3.5 h-3.5" />
          {editLabel || "ویرایش"}
        </button>
      )}
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto px-6 pb-20">
      <div className="mb-8 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-2"
        >
          بازبینی نهایی
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-muted-foreground"
        >
          قبل از ساخت استراتژی، اطلاعات خود را یک‌بار بررسی کنید.
        </motion.p>
      </div>

      <div className="frosted-glass rounded-2xl p-6 shadow-2xl">
        <Row
          label="مسیر انتخابی"
          value={
            <span className="inline-flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br text-white",
                  p.accent
                )}
              >
                <p.icon className="w-4 h-4" />
              </span>
              {p.title}
            </span>
          }
          onEdit={() => goToStep(0)}
          editLabel="تغییر مسیر"
        />
        <Row
          label="نام پروژه"
          value={projectName || "—"}
          onEdit={() => goToStep(1)}
        />
        {answeredQuestions.map((q) => {
          const opt = q.options.find((o) => o.id === answers[q.id]);
          return (
            <Row
              key={q.id}
              label={q.question}
              value={opt?.label || "—"}
              onEdit={() => goToStep(1)}
            />
          );
        })}
        <Row
          label="چشم‌انداز"
          value={
            <span className="whitespace-pre-wrap leading-relaxed">
              {projectVision || "—"}
            </span>
          }
          onEdit={() => goToStep(2)}
        />
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        این عملیات یک اعتبار هوش مصنوعی مصرف می‌کند.
      </p>

      <div className="mt-8 flex items-center justify-between pt-6 border-t border-border/50">
        <Button
          variant="ghost"
          onClick={retreat}
          className="text-muted-foreground hover:text-foreground h-12 px-6"
          type="button"
          disabled={isGenerating}
        >
          <ArrowRight className="ms-2 w-4 h-4" />
          مرحله قبل
        </Button>
        <Button
          onClick={generate}
          disabled={isGenerating}
          size="lg"
          className="h-14 px-8 text-lg font-bold rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300"
          type="button"
        >
          {isGenerating ? (
            <>
              <span className="ms-2 animate-spin border-2 border-white/40 border-t-white rounded-full w-5 h-5" />
              در حال ساخت...
            </>
          ) : (
            <>
              <Sparkles className="me-2 w-5 h-5 fill-white/20" />
              ساخت استراتژی با هوش مصنوعی
              <ChevronLeft className="me-2 w-5 h-5" />
            </>
          )}
        </Button>
      </div>

      {/* Small celebratory hint */}
      <p className="mt-6 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
        <Rocket className="w-4 h-4 text-brand-secondary" />
        آماده‌اید امپراطوری خود را بسازید!
      </p>
    </div>
  );
}
