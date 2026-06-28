"use client";

import { ONBOARDING_PHASE_LABELS, type UserOnboardingStep } from "@/lib/onboarding/types";
import { toPersianDigits } from "@/lib/utils";
import { cn } from "@/lib/utils";

const PHASES: UserOnboardingStep[] = ["profile", "genesis", "reveal", "missions"];

interface Props {
  current: UserOnboardingStep;
  className?: string;
}

export function OnboardingPhaseStepper({ current, className }: Props) {
  const currentIdx = PHASES.indexOf(current);

  return (
    <nav aria-label="مراحل راه‌اندازی" className={cn("w-full", className)}>
      <ol className="flex items-center justify-between gap-2">
        {PHASES.map((phase, idx) => {
          const done = idx < currentIdx;
          const active = idx === currentIdx;
          return (
            <li key={phase} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <div
                className={cn(
                  "h-2 w-full rounded-full transition-colors",
                  done && "bg-brand-primary",
                  active && "bg-gradient-to-l from-brand-primary to-brand-secondary",
                  !done && !active && "bg-muted"
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-bold truncate w-full text-center",
                  active ? "text-brand-primary" : done ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {ONBOARDING_PHASE_LABELS[phase]}
              </span>
            </li>
          );
        })}
      </ol>
      <p className="sr-only">
        مرحله {toPersianDigits(String(currentIdx + 1))} از {toPersianDigits(String(PHASES.length))}:{" "}
        {ONBOARDING_PHASE_LABELS[current]}
      </p>
    </nav>
  );
}
