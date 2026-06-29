export type ConfidenceLevel = "real" | "inferred" | "ai";

export const CONFIDENCE_LABELS: Record<ConfidenceLevel, string> = {
  real: "داده واقعی",
  inferred: "استنتاج",
  ai: "تخمین هوشمند",
};

export const CONFIDENCE_STYLES: Record<
  ConfidenceLevel,
  { badge: string; dot: string }
> = {
  real: {
    badge: "bg-emerald-500/10 border-emerald-500/25 text-emerald-400",
    dot: "bg-emerald-400",
  },
  inferred: {
    badge: "bg-amber-500/10 border-amber-500/25 text-amber-400",
    dot: "bg-amber-400",
  },
  ai: {
    badge: "bg-muted/50 border-white/10 text-muted-foreground",
    dot: "bg-muted-foreground",
  },
};
