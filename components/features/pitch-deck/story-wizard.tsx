"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Sparkles, Check } from "lucide-react";
import { useProject } from "@/contexts/project-context";
import type { WizardAnswers, PitchDeckArchetype, PitchDeckStage } from "@/lib/pitch-deck/types";
import { cn } from "@/lib/utils";

interface StoryWizardProps {
  onComplete: (answers: WizardAnswers) => void;
  onCancel: () => void;
  isGenerating?: boolean;
}

const ARCHETYPES: { id: PitchDeckArchetype; label: string }[] = [
  { id: "classic_seed", label: "سید کلاسیک" },
  { id: "traction_led", label: "تراکشن‌محور" },
  { id: "marketplace", label: "مارکت‌پلیس" },
  { id: "b2b_saas", label: "B2B SaaS" },
  { id: "deep_tech", label: "دیپ‌تک" },
  { id: "social_impact", label: "اثر اجتماعی" },
];

const STAGES: { id: PitchDeckStage; label: string }[] = [
  { id: "idea", label: "ایده" },
  { id: "mvp", label: "MVP" },
  { id: "growth", label: "رشد" },
  { id: "scale", label: "مقیاس" },
];

type Step =
  | { id: string; title: string; question: string; field: keyof WizardAnswers; type: "input" | "textarea" | "archetype" | "stage"; placeholder?: string };

const STEPS: Step[] = [
  {
    id: "archetype",
    title: "نوع داستان",
    question: "کدام روایت سرمایه‌گذاری به استارتاپ شما نزدیک‌تر است؟",
    field: "archetype",
    type: "archetype",
  },
  {
    id: "stage",
    title: "مرحله رشد",
    question: "الان در کدام مرحله هستید؟",
    field: "stage",
    type: "stage",
  },
  {
    id: "hook",
    title: "شروع قدرتمند",
    question: "استارتاپ شما در یک جمله چیست؟ (تگ‌لاین)",
    placeholder: "مثال: اسنپ برای خدمات منزل...",
    field: "tagline",
    type: "input",
  },
  {
    id: "problem",
    title: "درد مشتری",
    question: "بزرگترین مشکلی که حل می‌کنید چیست؟",
    placeholder: "مشتریان نمی‌توانند...",
    field: "problem",
    type: "textarea",
  },
  {
    id: "solution",
    title: "راهکار",
    question: "محصول شما چطور این مشکل را حل می‌کند؟",
    placeholder: "ما یک پلتفرم ایجاد کرده‌ایم که...",
    field: "solution",
    type: "textarea",
  },
  {
    id: "market",
    title: "بازار هدف",
    question: "مشتریان اصلی شما چه کسانی هستند؟",
    placeholder: "دانشجویان، مدیران کسب و کار...",
    field: "market",
    type: "input",
  },
  {
    id: "ask",
    title: "جذب سرمایه",
    question: "چقدر سرمایه می‌خواهید و برای چه؟",
    placeholder: "مثلاً ۵ میلیارد تومان برای رشد فروش...",
    field: "raiseSize",
    type: "input",
  },
  {
    id: "team",
    title: "تیم",
    question: "چه کسانی این رویا را می‌سازند؟",
    placeholder: "علی (فنی)، سارا (مارکتینگ)...",
    field: "team",
    type: "textarea",
  },
];

function canvasField(val: unknown): string {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) return val.join("، ");
  return "";
}

export function StoryWizard({ onComplete, onCancel, isGenerating = false }: StoryWizardProps) {
  const { activeProject } = useProject();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<WizardAnswers>({
    tagline: activeProject?.tagline || "",
    problem: canvasField(activeProject?.leanCanvas?.problem),
    solution: canvasField(activeProject?.leanCanvas?.solution),
    market: activeProject?.audience || "",
    revenue: canvasField(activeProject?.leanCanvas?.revenueStream),
    team: "تیم موسس",
    archetype: "classic_seed",
    stage: "idea",
    raiseSize: activeProject?.budget || "",
    sector: "",
    voice: "حرفه‌ای و شفاف",
    audience: "investor",
  });

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((p) => p + 1);
    } else {
      onComplete({
        ...answers,
        ask: answers.raiseSize,
        revenue: answers.revenue || canvasField(activeProject?.leanCanvas?.revenueStream),
      });
    }
  };

  const setField = (field: keyof WizardAnswers, value: string) => {
    setAnswers((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="h-full min-h-[60vh] flex flex-col relative overflow-hidden rounded-3xl border border-primary/15 bg-gradient-to-br from-pink-50 via-white to-orange-50 dark:from-pink-950/30 dark:via-background dark:to-orange-950/20">
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-secondary/10" />

      <div className="relative z-10 p-6 md:p-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-bold text-primary mb-1">ویزارد داستان سرمایه‌گذاری</p>
            <h2 className="text-xl md:text-2xl font-black">داستان استارتاپ شما</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isGenerating}>
            انصراف
          </Button>
        </div>

        <div className="h-1.5 rounded-full bg-muted mb-8 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-l from-primary to-secondary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.35 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="flex-1 space-y-6"
          >
            <div>
              <p className="text-sm text-muted-foreground mb-1">{step.title}</p>
              <h3 className="text-lg md:text-xl font-bold leading-relaxed">{step.question}</h3>
            </div>

            {step.type === "archetype" && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {ARCHETYPES.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => setField("archetype", a.id)}
                    className={cn(
                      "rounded-2xl border p-3 text-sm font-bold transition-all text-start",
                      answers.archetype === a.id
                        ? "border-primary bg-primary/10 text-primary shadow-sm"
                        : "border-border/60 hover:border-primary/40"
                    )}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}

            {step.type === "stage" && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {STAGES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setField("stage", s.id)}
                    className={cn(
                      "rounded-2xl border p-4 text-sm font-bold transition-all",
                      answers.stage === s.id
                        ? "border-secondary bg-secondary/10 text-secondary"
                        : "border-border/60 hover:border-secondary/40"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}

            {step.type === "input" && (
              <Input
                value={String(answers[step.field] || "")}
                onChange={(e) => setField(step.field, e.target.value)}
                placeholder={step.placeholder}
                className="h-12 rounded-2xl text-base"
                dir="rtl"
              />
            )}

            {step.type === "textarea" && (
              <Textarea
                value={String(answers[step.field] || "")}
                onChange={(e) => setField(step.field, e.target.value)}
                placeholder={step.placeholder}
                className="min-h-[120px] rounded-2xl text-base"
                dir="rtl"
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8 gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            disabled={currentStep === 0 || isGenerating}
            className="rounded-xl"
          >
            <ArrowRight size={16} />
            قبلی
          </Button>
          <Button
            onClick={handleNext}
            disabled={isGenerating}
            className="rounded-xl bg-gradient-to-l from-primary to-secondary text-white border-0 min-w-[140px]"
          >
            {isGenerating ? (
              <>
                <Sparkles size={16} className="animate-pulse" />
                در حال تولید...
              </>
            ) : currentStep === STEPS.length - 1 ? (
              <>
                <Check size={16} />
                ساخت پیچ‌دک
              </>
            ) : (
              <>
                بعدی
                <ArrowLeft size={16} />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
