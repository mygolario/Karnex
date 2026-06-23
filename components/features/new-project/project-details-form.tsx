"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PILLARS, ProjectType } from "@/app/new-project/genesis-constants";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn, toPersianDigits } from "@/lib/utils";
import { ArrowRight, Sparkles, Zap, ChevronLeft, ChevronRight } from "lucide-react";

interface ProjectDetailsFormProps {
  selectedType: ProjectType;
  projectName: string;
  projectVision: string;
  answers: Record<string, any>;
  onNameChange: (val: string) => void;
  onVisionChange: (val: string) => void;
  onAnswerChange: (qId: string, optId: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isGenerating: boolean;
}

export function ProjectDetailsForm({
  selectedType,
  projectName,
  projectVision,
  answers,
  onNameChange,
  onVisionChange,
  onAnswerChange,
  onSubmit,
  onBack,
  isGenerating
}: ProjectDetailsFormProps) {
  const pillar = PILLARS.find(p => p.id === selectedType);
  if (!pillar) return null;

  const coreQuestions = pillar.questions || [];
  const totalSubSteps = coreQuestions.length + 2; // Name step + questions + Vision step
  const [activeSubStep, setActiveSubStep] = useState(0);

  const handleNextStep = () => {
    if (activeSubStep < totalSubSteps - 1) {
      setActiveSubStep(prev => prev + 1);
    } else {
      onSubmit();
    }
  };

  const handlePrevStep = () => {
    if (activeSubStep > 0) {
      setActiveSubStep(prev => prev - 1);
    } else {
      onBack();
    }
  };

  // Determine if active step is valid
  let isCurrentStepValid = false;
  if (activeSubStep === 0) {
    isCurrentStepValid = projectName.trim().length > 0;
  } else if (activeSubStep <= coreQuestions.length) {
    const activeQuestion = coreQuestions[activeSubStep - 1];
    isCurrentStepValid = answers[activeQuestion.id] !== undefined;
  } else if (activeSubStep === totalSubSteps - 1) {
    isCurrentStepValid = projectVision.trim().length > 0;
  }

  const progressPercent = ((activeSubStep + 1) / totalSubSteps) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto px-6 pb-20">
      <div className="mb-10 text-center">
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
                "w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-6 shadow-2xl bg-gradient-to-br text-white",
                pillar.color
            )}
        >
            <pillar.icon className="w-8 h-8" />
        </motion.div>
        <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-2"
        >
            تنظیمات {pillar.title}
        </motion.h2>
        <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-muted-foreground mb-6"
        >
            اطلاعات پایه را وارد کنید تا کارنکس استراتژی شما را بچیند.
        </motion.p>

        {/* Progress Bar */}
        <div className="mt-8">
          <div className="flex justify-between items-center text-sm text-muted-foreground mb-2">
            <span>گام {toPersianDigits(activeSubStep + 1)} از {toPersianDigits(totalSubSteps)}</span>
            <span className="font-semibold text-primary">{toPersianDigits(Math.round(progressPercent))}%</span>
          </div>
          <div className="w-full bg-muted h-2.5 rounded-full overflow-hidden relative">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-purple-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            />
          </div>
        </div>
      </div>

      <div className="min-h-[220px] relative overflow-hidden">
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
              <Label htmlFor="projectName" className="text-xl font-bold block mb-2">نام پروژه / برند شما چیست؟</Label>
              <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => onNameChange(e.target.value)}
                  placeholder={(pillar as any).projectPlaceholder || "مثلاً: دیجی‌کالا، اسنپ، ..."}
                  className="h-14 text-lg bg-card/50 border-border/50 focus:border-primary/50 transition-all font-medium"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isCurrentStepValid) handleNextStep();
                  }}
              />
            </motion.div>
          )}

          {/* Sub-steps 1 to N: Dynamic Questions */}
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
                <Label className="text-xl font-bold block mb-2">{q.question}</Label>
                <div className="grid sm:grid-cols-3 gap-4">
                  {q.options.map((opt) => {
                    const isSelected = answers[q.id] === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          onAnswerChange(q.id, opt.id);
                          // Auto advance dynamic question step on select for smoother UX
                          setTimeout(() => {
                            setActiveSubStep(prev => prev + 1);
                          }, 250);
                        }}
                        className={cn(
                            "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border transition-all duration-300 min-h-[120px]",
                            isSelected 
                                ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/10" 
                                : "bg-card/30 border-border/50 hover:bg-card/60 hover:border-border"
                        )}
                      >
                        <opt.icon className={cn("w-8 h-8", isSelected && "text-primary")} />
                        <span className="font-semibold text-base">{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}

          {/* Sub-step N+1: Project Vision */}
          {activeSubStep === totalSubSteps - 1 && (
            <motion.div 
              key="step-vision"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-4 py-2"
            >
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="vision" className="text-xl font-bold">ایده، ارزش پیشنهادی و چشم‌انداز شما</Label>
              </div>
              <Textarea
                  id="vision"
                  value={projectVision}
                  onChange={(e) => onVisionChange(e.target.value)}
                  placeholder="توضیح دهید که کسب‌وکار شما چیست و چگونه قرار است ارزش خلق کند یا مشکل مشتریان را حل کند..."
                  className="min-h-[160px] text-lg leading-relaxed bg-card/50 border-border/50 focus:border-primary/50 resize-none p-4"
                  autoFocus
              />
            </motion.div>
          )}
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
            onClick={handlePrevStep}
            className="text-muted-foreground hover:text-foreground h-12 px-6"
            type="button"
        >
            <ArrowRight className="ms-2 w-4 h-4" />
            {activeSubStep === 0 ? "انتخاب مسیر دیگر" : "مرحله قبل"}
        </Button>

        {activeSubStep === totalSubSteps - 1 ? (
          <Button 
              onClick={onSubmit}
              disabled={!isCurrentStepValid || isGenerating}
              size="lg"
              className={cn(
                  "h-14 px-8 text-lg font-bold rounded-xl transition-all duration-500",
                  isCurrentStepValid 
                      ? "bg-gradient-to-r from-primary to-purple-600 shadow-[0_0_30px_hsl(var(--primary)/0.3)] hover:shadow-[0_0_50px_hsl(var(--primary)/0.5)] hover:scale-[1.02]"
                      : "opacity-50 cursor-not-allowed"
              )}
          >
              {isGenerating ? (
                  <>
                      <span className="loading loading-spinner loading-md ms-2 animate-spin border-2 rounded-full border-t-transparent w-5 h-5"></span>
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
        ) : (
          <Button 
              onClick={handleNextStep}
              disabled={!isCurrentStepValid}
              size="lg"
              className={cn(
                  "h-14 px-8 text-lg font-bold rounded-xl transition-all duration-300",
                  isCurrentStepValid 
                      ? "bg-primary hover:bg-primary/90 hover:scale-[1.02]"
                      : "opacity-50 cursor-not-allowed"
              )}
              type="button"
          >
              مرحله بعد
              <ChevronLeft className="me-2 w-5 h-5" />
          </Button>
        )}
      </motion.div>
    </div>
  );
}
