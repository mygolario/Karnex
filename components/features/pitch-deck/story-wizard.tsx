"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ArrowRight, Sparkles, Wand2, Check } from "lucide-react";
import { PitchDeckSlide } from "@/lib/db";
import { useProject } from "@/contexts/project-context";

interface StoryWizardProps {
  onComplete: (answers: any) => void;
  onCancel: () => void;
  isGenerating?: boolean;
}

// ... STEPS constant remains same ...
const STEPS = [
  {
    id: "hook",
    title: "شروع قدرتمند",
    question: "استارتاپ شما در یک جمله چیست؟ (تگ‌لاین)",
    placeholder: "مثال: اسنپ برای خدمات منزل...",
    field: "tagline",
    type: "input",
    bgGradient: "from-blue-600 to-indigo-600"
  },
  {
    id: "problem",
    title: "درد مشتری",
    question: "بزرگترین مشکلی که حل می‌کنید چیست؟",
    placeholder: "مشتریان نمی‌توانند...",
    field: "problem",
    type: "textarea",
    bgGradient: "from-rose-500 to-orange-500"
  },
  {
    id: "solution",
    title: "راهکار طلایی",
    question: "محصول شما چطور این مشکل را حل می‌کند؟",
    placeholder: "ما یک پلتفرم ایجاد کرده‌ایم که...",
    field: "solution",
    type: "textarea",
    bgGradient: "from-emerald-500 to-teal-500"
  },
  {
    id: "market",
    title: "بازار هدف",
    question: "مشتریان اصلی شما چه کسانی هستند؟",
    placeholder: "دانشجویان، مدیران کسب و کار...",
    field: "market",
    type: "input",
    bgGradient: "from-violet-600 to-purple-600"
  },
  {
    id: "business_model",
    title: "کسب درآمد",
    question: "مدل درآمدی شما چیست؟",
    placeholder: "اشتراک ماهیانه، کارمزد...",
    field: "revenue",
    type: "input",
    bgGradient: "from-amber-500 to-yellow-500"
  },
  {
    id: "team",
    title: "تیم قهرمان",
    question: "چه کسانی این رویا را می‌سازند؟",
    placeholder: "علی (فنی)، سارا (مارکتینگ)...",
    field: "team",
    type: "textarea",
    bgGradient: "from-cyan-500 to-blue-500"
  }
];

export function StoryWizard({ onComplete, onCancel, isGenerating = false }: StoryWizardProps) {
  const { activeProject } = useProject();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({
    tagline: activeProject?.tagline || "",
    problem: typeof activeProject?.leanCanvas?.problem === 'string' ? activeProject.leanCanvas.problem : "",
    solution: typeof activeProject?.leanCanvas?.solution === 'string' ? activeProject.leanCanvas.solution : "",
    market: activeProject?.audience || "",
    revenue: typeof activeProject?.leanCanvas?.revenueStream === 'string' ? activeProject.leanCanvas.revenueStream : "",
    team: userDisplayName(activeProject)
  });

  function userDisplayName(project: any) {
      // Basic heuristic to get a team name or user name
      return "تیم موسس";
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onCancel();
    }
  };

  // Removed generateDeck - moved to AI action in parent

  const stepData = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="w-full max-w-2xl p-6 relative">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-muted">
          <motion.div 
            className={`h-full bg-gradient-to-r ${stepData.bgGradient}`}
            initial={{ width: "0%" }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className={`p-8 md:p-12 bg-gradient-to-br ${stepData.bgGradient} text-white`}>
              <div className="flex items-center gap-3 mb-4 opacity-80">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 font-mono text-sm">
                  {currentStep + 1}
                </span>
                <span className="text-sm font-medium tracking-wide uppercase">
                  {stepData.title}
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black leading-tight">
                {stepData.question}
              </h2>
            </div>

            <div className="p-8 md:p-12 space-y-6 bg-card">
              {stepData.type === 'textarea' ? (
                <Textarea
                  value={answers[stepData.field] || ""}
                  onChange={(e) => setAnswers({ ...answers, [stepData.field]: e.target.value })}
                  placeholder={stepData.placeholder}
                  className="min-h-[150px] text-lg p-6 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background transition-all resize-none"
                  autoFocus
                />
              ) : (
                <Input
                  value={answers[stepData.field] || ""}
                  onChange={(e) => setAnswers({ ...answers, [stepData.field]: e.target.value })}
                  placeholder={stepData.placeholder}
                  className="h-16 text-xl px-6 rounded-xl bg-muted/30 border-2 border-transparent focus:border-primary/50 focus:bg-background transition-all"
                  autoFocus
                />
              )}

              <div className="flex items-center justify-between pt-4">
                <Button variant="ghost" size="lg" onClick={handlePrev} className="text-muted-foreground" disabled={isGenerating}>
                  <ArrowRight className="mr-2" size={20} />
                  {currentStep === 0 ? "انصراف" : "قبلی"}
                </Button>
                
                <Button 
                    size="lg" 
                    onClick={handleNext}
                    disabled={isGenerating}
                    className={`h-14 px-8 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 bg-gradient-to-r ${stepData.bgGradient} hover:brightness-110 transition-all`}
                >
                  {isGenerating ? (
                      <>
                        <Sparkles className="ml-2 animate-spin" size={20} />
                        در حال نوشتن...
                      </>
                  ) : currentStep === STEPS.length - 1 ? (
                    <>
                      <Sparkles className="ml-2 animate-pulse" size={20} />
                      ساخت ارائه هوشمند
                    </>
                  ) : (
                    <>
                      بعدی
                      <ArrowLeft className="mr-2" size={20} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
