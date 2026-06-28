"use client";

import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";
import type { ProjectType } from "@/lib/account/types";

const PILLAR_LABELS: Record<ProjectType, string> = {
  startup: "استارتاپ",
  traditional: "کسب‌وکار سنتی",
  creator: "تولید محتوا",
};

const PILLAR_STYLES: Record<ProjectType, string> = {
  startup: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  traditional: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  creator: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export function PillarBadge({
  pillar,
  className,
}: {
  pillar?: ProjectType | string;
  className?: string;
}) {
  const p = (pillar || "startup") as ProjectType;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        PILLAR_STYLES[p] || PILLAR_STYLES.startup,
        className
      )}
    >
      {PILLAR_LABELS[p] || pillar}
    </span>
  );
}

export function AIOutputShell({
  title,
  subtitle,
  pillar,
  confidence,
  timestamp,
  children,
  className,
  actions,
}: {
  title: string;
  subtitle?: string;
  pillar?: ProjectType | string;
  confidence?: number;
  timestamp?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card/80 overflow-hidden ai-output-shell",
        pillar === "traditional" && "border-l-4 border-l-emerald-500",
        pillar === "creator" && "border-l-4 border-l-rose-500",
        (!pillar || pillar === "startup") && "border-l-4 border-l-indigo-500",
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-muted/30 px-4 py-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="ai-orb flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-sm truncate">{title}</h3>
              {pillar && <PillarBadge pillar={pillar} />}
            </div>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {confidence != null && (
            <ConfidencePill value={confidence} />
          )}
          {timestamp && (
            <span className="text-[10px] text-muted-foreground">{timestamp}</span>
          )}
          {actions}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function ConfidencePill({ value }: { value: number }) {
  const label =
    value >= 75 ? "بالا" : value >= 45 ? "متوسط" : "پایین";
  const color =
    value >= 75
      ? "bg-emerald-500/10 text-emerald-700"
      : value >= 45
        ? "bg-amber-500/10 text-amber-700"
        : "bg-rose-500/10 text-rose-700";
  return (
    <span
      className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", color)}
      title={`اطمینان: ${value}%`}
    >
      اطمینان {label}
    </span>
  );
}
