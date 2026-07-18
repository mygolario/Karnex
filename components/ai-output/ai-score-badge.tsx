"use client";

import { cn } from "@/lib/utils";
import type { ProjectType } from "@/lib/account/types";

const PILLAR_RING: Record<ProjectType, string> = {
  startup: "stroke-indigo-500",
  traditional: "stroke-emerald-500",
  creator: "stroke-rose-500",
};

export function AIScoreBadge({
  score,
  max = 100,
  label,
  pillar = "startup",
  size = "md",
  showGrade,
}: {
  score: number;
  max?: number;
  label?: string;
  pillar?: ProjectType | string;
  size?: "sm" | "md" | "lg";
  showGrade?: boolean;
}) {
  const pct = Math.min(100, Math.max(0, (score / max) * 100));
  const p = (pillar || "startup") as ProjectType;
  const grade =
    pct >= 90 ? "S" : pct >= 80 ? "A" : pct >= 65 ? "B" : pct >= 50 ? "C" : "D";

  const dim = size === "lg" ? 80 : size === "sm" ? 48 : 64;
  const r = (dim - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg width={dim} height={dim} className="-rotate-90">
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            strokeWidth={4}
            className="stroke-muted"
          />
          <circle
            cx={dim / 2}
            cy={dim / 2}
            r={r}
            fill="none"
            strokeWidth={4}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn(PILLAR_RING[p], "transition-all duration-700")}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-bold", size === "lg" ? "text-xl" : "text-sm")}>
            {showGrade ? grade : Math.round(score)}
          </span>
          {!showGrade && max !== 100 && (
            <span className="text-[9px] text-muted-foreground">/{max}</span>
          )}
        </div>
      </div>
      {label && (
        <span className="text-[10px] text-muted-foreground text-center max-w-[80px]">
          {label}
        </span>
      )}
    </div>
  );
}

/** Unified arc gauge (0-10 scale) */
export function AIGauge({
  value,
  max = 10,
  label,
  pillar = "startup",
}: {
  value: number;
  max?: number;
  label?: string;
  pillar?: ProjectType | string;
}) {
  return (
    <AIScoreBadge
      score={value}
      max={max}
      label={label}
      pillar={pillar}
      size="lg"
    />
  );
}
