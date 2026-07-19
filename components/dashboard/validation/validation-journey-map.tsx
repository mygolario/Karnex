"use client";

import { cn } from "@/lib/utils";
import {
  JOURNEY_STAGE_LABELS,
  JOURNEY_STAGES,
  type JourneyStage,
} from "@/lib/validation/types";
import { Check } from "lucide-react";

const STAGE_ORDER = [...JOURNEY_STAGES];

export function ValidationJourneyMap({
  stage,
  onSelect,
  className,
}: {
  stage: JourneyStage;
  onSelect?: (stage: JourneyStage) => void;
  className?: string;
}) {
  const currentIdx = STAGE_ORDER.indexOf(stage);

  return (
    <nav
      aria-label="مسیر اعتبارسنجی"
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-xl border bg-muted/20 p-2",
        className
      )}
    >
      {STAGE_ORDER.map((s, i) => {
        const done = i < currentIdx;
        const active = s === stage;
        const locked = i > currentIdx + 1;
        return (
          <button
            key={s}
            type="button"
            disabled={locked && !onSelect}
            onClick={() => onSelect?.(s)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
              active && "bg-ai/15 text-ai border border-ai/30",
              done && !active && "text-foreground bg-muted/60",
              !done && !active && "text-muted-foreground",
              locked && "opacity-50 cursor-not-allowed"
            )}
          >
            {done ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <span
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-full text-[10px]",
                  active ? "bg-ai text-white" : "bg-muted"
                )}
              >
                {i + 1}
              </span>
            )}
            <span className="hidden sm:inline">{JOURNEY_STAGE_LABELS[s]}</span>
            <span className="sm:hidden">{JOURNEY_STAGE_LABELS[s].slice(0, 4)}</span>
          </button>
        );
      })}
    </nav>
  );
}
