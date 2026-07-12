"use client";

import { cn } from "@/lib/utils";
import {
  CONFIDENCE_LABELS,
  CONFIDENCE_STYLES,
  type ConfidenceLevel,
} from "@/lib/location/confidence";

interface ConfidenceBadgeProps {
  level?: ConfidenceLevel;
  className?: string;
  showDot?: boolean;
}

const FALLBACK_LEVEL: ConfidenceLevel = "ai";

function resolveLevel(level?: ConfidenceLevel): ConfidenceLevel {
  if (level && level in CONFIDENCE_STYLES) return level;
  return FALLBACK_LEVEL;
}

export function ConfidenceBadge({
  level,
  className,
  showDot = true,
}: ConfidenceBadgeProps) {
  const safeLevel = resolveLevel(level);
  const styles = CONFIDENCE_STYLES[safeLevel];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border",
        styles.badge,
        className
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", styles.dot)} />
      )}
      {CONFIDENCE_LABELS[safeLevel]}
    </span>
  );
}
