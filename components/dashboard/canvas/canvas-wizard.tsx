"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Send, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BMC_STEPS } from "@/hooks/use-canvas-wizard";
import { useCanvasStore } from "@/lib/canvas/store";
import { useCanvasActions } from "./canvas-provider";
import { getIcon } from "@/lib/canvas/icon-map";
import { SECTION_COLOR_VARIANTS } from "@/lib/canvas/color-variants";

export function CanvasWizard() {
  const isOpen = useCanvasStore((s) => s.wizardOpen);
  const setWizardOpen = useCanvasStore((s) => s.setWizardOpen);
  const setHighlightedSectionId = useCanvasStore((s) => s.setHighlightedSectionId);
  const setFocusMode = useCanvasStore((s) => s.setFocusMode);
  const { handleSmartWizardComplete } = useCanvasActions();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const currentStep = BMC_STEPS[currentStepIndex];
  const totalSteps = BMC_STEPS.length;
  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  const closeWizard = () => {
    setWizardOpen(false);
    setFocusMode(false);
    setHighlightedSectionId(null);
  };

  const nextStep = () => {
    const newAnswers = { ...answers };
    if (currentInput.trim()) {
      newAnswers[currentStep.id] = currentInput.trim();
    }
    setAnswers(newAnswers);

    if (currentStepIndex < totalSteps - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setCurrentInput("");
      setHighlightedSectionId(BMC_STEPS[nextIndex].id);
    } else {
      handleSmartWizardComplete(newAnswers);
      closeWizard();
    }
  };

  const skipStep = () => {
    if (currentStepIndex < totalSteps - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setCurrentInput("");
      setHighlightedSectionId(BMC_STEPS[nextIndex].id);
    } else {
      handleSmartWizardComplete(answers);
      closeWizard();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      setCurrentInput(answers[BMC_STEPS[prevIndex].id] || "");
      setHighlightedSectionId(BMC_STEPS[prevIndex].id);
    }
  };

  if (!isOpen) return null;

  const StepIcon = getIcon("Sparkles");
  const variant = SECTION_COLOR_VARIANTS[currentStep.color] || SECTION_COLOR_VARIANTS.blue;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed bottom-0 start-0 end-0 z-50 p-4 md:p-6"
      >
        <div className="max-w-3xl mx-auto bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row ring-1 ring-primary/20">
          <div className={cn("p-6 md:w-1/3 bg-gradient-to-br border-b md:border-b-0 md:border-l flex flex-col justify-between", variant.gradient, variant.darkGradient)}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-white/50 dark:bg-black/20 px-2 py-1 rounded-md">
                  قدم {currentStepIndex + 1} از {totalSteps}
                </span>
                <button onClick={closeWizard} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10">
                  <X size={16} />
                </button>
              </div>

              <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full mb-6 overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ type: "spring", stiffness: 200, damping: 20 }}
                />
              </div>

              <div className="flex items-center gap-2 mb-2">
                <div className={cn("p-1.5 rounded-lg", variant.iconBg, variant.iconText)}>
                  <StepIcon size={16} />
                </div>
                <h2 className="text-lg font-black">{currentStep.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 mt-6 text-xs text-muted-foreground bg-white/50 dark:bg-black/20 p-2.5 rounded-lg">
              <Lightbulb size={14} className="text-yellow-500 shrink-0" />
              <span>پاسخ شما به بخش «{currentStep.title}» در بوم اضافه می‌شود.</span>
            </div>
          </div>

          <div className="p-6 md:w-2/3 flex flex-col bg-card">
            <h3 className="text-base font-bold mb-4 leading-relaxed">
              {currentStep.question}
            </h3>

            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={currentStep.placeholder}
              className="w-full flex-1 min-h-[120px] p-4 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none text-base mb-4 outline-none transition-all placeholder:text-muted-foreground/50"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  nextStep();
                }
              }}
            />

            <div className="flex items-center justify-between mt-auto pt-2">
              <Button variant="ghost" size="sm" onClick={prevStep} disabled={currentStepIndex === 0} className="text-muted-foreground">
                <ChevronRight className="ms-1" size={16} />
                قبلی
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={skipStep} className="text-muted-foreground hover:bg-muted">
                  رد کردن
                </Button>
                <Button onClick={nextStep} className="gap-2 px-6">
                  {currentInput.trim() ? "افزودن و ادامه" : "بعدی"}
                  {currentInput.trim() ? <Send size={14} /> : <ChevronLeft size={16} />}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 mt-3 justify-center">
              {BMC_STEPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === currentStepIndex ? "w-6 bg-primary" : i < currentStepIndex ? "w-1.5 bg-primary/50" : "w-1.5 bg-muted"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
