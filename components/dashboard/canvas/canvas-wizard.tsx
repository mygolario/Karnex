"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Send, Sparkles, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { BMC_STEPS } from "@/hooks/use-canvas-wizard";

interface CanvasWizardProps {
  isOpen: boolean;
  currentStep: typeof BMC_STEPS[0];
  currentStepIndex: number;
  totalSteps: number;
  currentInput: string;
  onInputChange: (val: string) => void;
  onNext: () => void;
  onSkip: () => void;
  onPrev: () => void;
  onClose: () => void;
}

export function CanvasWizard({
  isOpen,
  currentStep,
  currentStepIndex,
  totalSteps,
  currentInput,
  onInputChange,
  onNext,
  onSkip,
  onPrev,
  onClose
}: CanvasWizardProps) {
  
  if (!isOpen) return null;

  const progress = ((currentStepIndex + 1) / totalSteps) * 100;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="max-w-3xl mx-auto bg-card border border-border shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-primary/10 ring-1 ring-primary/20">
          
          {/* Left Side: Context & Progress */}
          <div className={`p-6 md:w-1/3 bg-${currentStep.color}-50 dark:bg-${currentStep.color}-950/30 border-b md:border-b-0 md:border-l flex flex-col justify-between`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  قدم {currentStepIndex + 1} از {totalSteps}
                </span>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X size={16} />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full mb-6 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <h2 className="text-xl font-black mb-2 flex items-center gap-2">
                 {currentStep.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            <div className="hidden md:flex items-center gap-2 mt-6 text-xs text-muted-foreground bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                <Lightbulb size={14} className="text-yellow-500 shrink-0" />
                <span>این بخش به بخش "{currentStep.title}" در بوم اضافه می‌شود.</span>
            </div>
          </div>

          {/* Right Side: Input & Actions */}
          <div className="p-6 md:w-2/3 flex flex-col bg-card">
            <h3 className="text-lg font-bold mb-4">
                {currentStep.question}
            </h3>
            
            <textarea
              value={currentInput}
              onChange={(e) => onInputChange(e.target.value)}
              placeholder={currentStep.placeholder}
              className="w-full flex-1 min-h-[120px] p-4 rounded-xl bg-muted/50 border-none focus:ring-2 focus:ring-primary/50 resize-none text-base mb-4 outline-none transition-all placeholder:text-muted-foreground/50"
              autoFocus
            />

            <div className="flex items-center justify-between mt-auto pt-2">
              <div className="flex items-center gap-2">
                 <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onPrev} 
                    disabled={currentStepIndex === 0}
                    className="text-muted-foreground"
                 >
                    <ChevronRight className="ml-1" size={16} />
                    قبلی
                 </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={onSkip}
                    className="text-muted-foreground hover:bg-muted"
                >
                    رد کردن
                </Button>
                <Button onClick={onNext} className="gap-2 px-6">
                   {currentInput.trim() ? 'افزودن و ادامه' : 'بعدی'}
                   {currentInput.trim() ? <Send size={14} /> : <ChevronLeft size={16} />}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}
