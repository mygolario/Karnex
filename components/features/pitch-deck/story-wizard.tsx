"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useProject } from "@/contexts/project-context";

export interface StoryWizardAnswers {
  tagline: string;
  problem: string;
  solution: string;
  market: string;
  revenue: string;
  team: string;
}

interface StoryWizardProps {
  onComplete: (answers: StoryWizardAnswers) => void;
  onCancel: () => void;
  isGenerating?: boolean;
  allowSkip?: boolean;
  onSkip?: () => void;
}

const STEPS = [
  {
    id: "hook",
    title: "شروع قدرتمند",
    question: "استارتاپ شما در یک جمله چیست؟ (تگ‌لاین)",
    placeholder: "مثال: اسنپ برای خدمات منزل...",
    field: "tagline" as const,
    type: "input" as const,
  },
  {
    id: "problem",
    title: "درد مشتری",
    question: "بزرگترین مشکلی که حل می‌کنید چیست؟",
    placeholder: "مشتریان نمی‌توانند...",
    field: "problem" as const,
    type: "textarea" as const,
  },
  {
    id: "solution",
    title: "راهکار",
    question: "محصول شما چطور این مشکل را حل می‌کند؟",
    placeholder: "ما یک پلتفرم ایجاد کرده‌ایم که...",
    field: "solution" as const,
    type: "textarea" as const,
  },
  {
    id: "market",
    title: "بازار هدف",
    question: "مشتریان اصلی شما چه کسانی هستند؟",
    placeholder: "دانشجویان، مدیران کسب و کار...",
    field: "market" as const,
    type: "input" as const,
  },
  {
    id: "business_model",
    title: "کسب درآمد",
    question: "مدل درآمدی شما چیست؟",
    placeholder: "اشتراک ماهیانه، کارمزد...",
    field: "revenue" as const,
    type: "input" as const,
  },
  {
    id: "team",
    title: "تیم",
    question: "چه کسانی این رویا را می‌سازند؟",
    placeholder: "علی (فنی)، سارا (مارکتینگ)...",
    field: "team" as const,
    type: "textarea" as const,
  },
];

export function StoryWizard({
  onComplete,
  onCancel,
  isGenerating = false,
  allowSkip = false,
  onSkip,
}: StoryWizardProps) {
  const { activeProject } = useProject();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<StoryWizardAnswers>({
    tagline: activeProject?.tagline || "",
    problem:
      typeof activeProject?.leanCanvas?.problem === "string"
        ? activeProject.leanCanvas.problem
        : "",
    solution:
      typeof activeProject?.leanCanvas?.solution === "string"
        ? activeProject.leanCanvas.solution
        : "",
    market: activeProject?.audience || "",
    revenue:
      typeof activeProject?.leanCanvas?.revenueStream === "string"
        ? activeProject.leanCanvas.revenueStream
        : "",
    team: "تیم موسس",
  });

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onCancel();
    }
  };

  const stepData = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm" dir="rtl">
      <div className="relative w-full max-w-2xl p-6">
        <div className="absolute start-0 top-0 h-1 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full bg-gradient-to-l from-primary to-orange-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
          >
            <div className="bg-gradient-to-br from-primary to-orange-500 p-8 text-white md:p-12">
              <div className="mb-4 flex items-center gap-3 opacity-90">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 font-mono text-sm">
                  {currentStep + 1}
                </span>
                <span className="text-sm font-medium tracking-wide">{stepData.title}</span>
              </div>
              <h2 className="text-3xl font-black leading-tight md:text-4xl">
                {stepData.question}
              </h2>
              <p className="mt-3 text-sm text-white/80">
                فیلدها از پروژه شما پیش‌پر شده‌اند — فقط جاهای خالی را تکمیل کنید.
              </p>
            </div>

            <div className="space-y-6 bg-card p-8 md:p-12">
              {stepData.type === "textarea" ? (
                <Textarea
                  value={answers[stepData.field] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [stepData.field]: e.target.value })
                  }
                  placeholder={stepData.placeholder}
                  className="min-h-[150px] resize-none rounded-2xl border-2 border-transparent bg-muted/30 p-6 text-lg focus:border-primary/50 focus:bg-background"
                  autoFocus
                />
              ) : (
                <Input
                  value={answers[stepData.field] || ""}
                  onChange={(e) =>
                    setAnswers({ ...answers, [stepData.field]: e.target.value })
                  }
                  placeholder={stepData.placeholder}
                  className="h-16 rounded-xl border-2 border-transparent bg-muted/30 px-6 text-xl focus:border-primary/50 focus:bg-background"
                  autoFocus
                />
              )}

              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handlePrev}
                  className="text-muted-foreground"
                  disabled={isGenerating}
                >
                  <ArrowRight className="ms-2" size={20} />
                  {currentStep === 0 ? "انصراف" : "قبلی"}
                </Button>

                <div className="flex items-center gap-2">
                  {allowSkip && onSkip && currentStep === 0 && (
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={onSkip}
                      disabled={isGenerating}
                      className="rounded-xl"
                    >
                      رد کردن و تولید مستقیم
                    </Button>
                  )}
                  <Button
                    size="lg"
                    onClick={handleNext}
                    disabled={isGenerating}
                    className="h-14 rounded-xl bg-gradient-to-l from-primary to-orange-500 px-8 text-lg font-bold text-white shadow-lg shadow-primary/20 hover:brightness-110"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="animate-spin ms-2" size={20} />
                        در حال نوشتن...
                      </>
                    ) : currentStep === STEPS.length - 1 ? (
                      <>
                        <Sparkles className="animate-pulse ms-2" size={20} />
                        ساخت ارائه هوشمند
                      </>
                    ) : (
                      <>
                        بعدی
                        <ArrowLeft className="me-2" size={20} />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
