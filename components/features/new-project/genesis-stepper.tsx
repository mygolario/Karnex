"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn, toPersianDigits } from "@/lib/utils";
import {
  GENESIS_PHASES,
  GENESIS_PHASE_LABELS,
  type GenesisPhase,
} from "@/lib/genesis/types";
import { useGenesisWizard } from "./genesis-wizard-context";

/** Chapters shown in the stepper (skip welcome & build for cleaner progress). */
const STEPPER_PHASES: GenesisPhase[] = [
  "pillar",
  "interview",
  "context",
  "brief",
];

export function GenesisStepper() {
  const { activeStep, goToStep, pillar, projectName, answers, currentPhase } =
    useGenesisWizard();

  const phaseIndex = (p: GenesisPhase) => GENESIS_PHASES.indexOf(p);
  const currentIdx = Math.max(0, STEPPER_PHASES.indexOf(currentPhase as GenesisPhase));

  const isComplete = (phase: GenesisPhase) => {
    const idx = phaseIndex(phase);
    if (activeStep > idx) return true;
    if (phase === "pillar") return !!pillar;
    if (phase === "interview")
      return !!(answers.problem || answers.solution || answers.industry);
    if (phase === "context") return !!(answers.stage || answers.budget || answers.team);
    if (phase === "brief") return projectName.trim().length >= 2;
    return false;
  };

  // Hide on welcome and during build
  if (currentPhase === "welcome" || currentPhase === "build") return null;

  const progressPercent =
    ((Math.min(currentIdx, STEPPER_PHASES.length - 1) + 1) /
      STEPPER_PHASES.length) *
    100;

  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="hidden sm:flex items-center justify-between">
        {STEPPER_PHASES.map((phase, idx) => {
          const stepNum = phaseIndex(phase);
          const complete = isComplete(phase);
          const current = currentPhase === phase;
          const canJump = complete && stepNum < activeStep;
          return (
            <div key={phase} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                disabled={!canJump}
                onClick={() => canJump && goToStep(stepNum)}
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
                    !current &&
                      complete &&
                      "border-brand-primary bg-brand-primary/10 text-brand-primary",
                    !current &&
                      !complete &&
                      "border-border bg-card text-muted-foreground"
                  )}
                >
                  {complete && !current ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    toPersianDigits(idx + 1)
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
                  {GENESIS_PHASE_LABELS[phase]}
                </span>
              </button>
              {idx < STEPPER_PHASES.length - 1 && (
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

      <div className="sm:hidden">
        <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
          <span>
            قدم {toPersianDigits(Math.min(currentIdx + 1, STEPPER_PHASES.length))} از{" "}
            {toPersianDigits(STEPPER_PHASES.length)}
          </span>
          <span className="font-semibold text-brand-primary">
            {GENESIS_PHASE_LABELS[currentPhase] || ""}
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
