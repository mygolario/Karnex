"use client";

import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIGenerationProgress({
  steps,
  activeIndex,
  className,
}: {
  steps: string[];
  activeIndex: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {steps.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <div
            key={step}
            className={cn(
              "flex items-center gap-2 text-sm transition-opacity",
              !done && !active && "opacity-40"
            )}
          >
            {done ? (
              <Check className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : active ? (
              <Loader2 className="h-4 w-4 animate-spin text-ai shrink-0" />
            ) : (
              <span className="h-4 w-4 rounded-full border shrink-0" />
            )}
            <span className={active ? "font-medium" : ""}>{step}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Auto-advancing staged progress for indeterminate flows */
export function AIGenerationProgressAuto({
  steps,
  intervalMs = 2500,
  className,
}: {
  steps: string[];
  intervalMs?: number;
  className?: string;
}) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => Math.min(i + 1, steps.length - 1));
    }, intervalMs);
    return () => clearInterval(t);
  }, [steps.length, intervalMs]);
  return (
    <AIGenerationProgress steps={steps} activeIndex={idx} className={className} />
  );
}
