"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn, toPersianDigits } from "@/lib/utils";
import { useGenesisWizard } from "./genesis-wizard-context";

const STEPS = [
  { id: 0, label: "انتخاب مسیر" },
  { id: 1, label: "جزئیات" },
  { id: 2, label: "چشم‌انداز" },
  { id: 3, label: "بازبینی" },
];

export function GenesisStepper() {
  const { activeStep, goToStep, pillar, projectName, projectVision, answers } =
    useGenesisWizard();

  // A step is "complete" when its prerequisite data exists, so the user can jump back.
  const isComplete = (step: number) => {
    if (step === 0) return !!pillar;
    if (step === 1) return !!pillar && !!projectName.trim();
    if (step === 2)
      return (
        !!pillar &&
        !!projectName.trim() &&
        Object.keys(answers).length > 0 &&
        !!projectVision.trim()
      );
    return false;
  };

  const progressPercent = ((activeStep + 1) / STEPS.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      {/* Desktop: labeled nodes */}
      <div className="hidden sm:flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const complete = isComplete(step.id);
          const current = activeStep === step.id;
          const canJump = complete && step.id < activeStep;
          return (
            <div key={step.id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                disabled={!canJump}
                onClick={() => canJump && goToStep(step.id)}
                className={cn(
                  "flex items-center gap-2 group",
                  canJump ? "cursor-pointer" : "cursor-default"
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                    current &&
                      "border-brand-primary bg-brand-primary text-primary-foreground shadow-lg shadow-primary/25",
                    !current && complete &&
                      "border-brand-primary bg-brand-primary/10 text-brand-primary",
                    !current && !complete &&
                      "border-border bg-card text-muted-foreground"
                  )}
                >
                  {complete && !current ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    toPersianDigits(step.id + 1)
                  )}
                </span>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    current
                      ? "text-foreground"
                      : complete
                        ? "text-muted-foreground"
                        : "text-muted-foreground/60"
                  )}
                >
                  {step.label}
                </span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 mx-3 rounded-full bg-border overflow-hidden">
                  <motion.div
                    className="h-full bg-brand-primary"
                    initial={false}
                    animate={{ width: complete ? "100%" : "0%" }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: slim bar */}
      <div className="sm:hidden">
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
          <span>
            گام {toPersianDigits(activeStep + 1)} از {toPersianDigits(STEPS.length)}
          </span>
          <span className="font-semibold text-brand-primary">
            {STEPS[activeStep]?.label}
          </span>
        </div>
        <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          />
        </div>
      </div>
    </div>
  );
}
