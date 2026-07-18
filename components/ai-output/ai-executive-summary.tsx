"use client";

import { cn } from "@/lib/utils";

export function AIExecutiveSummary({
  bullets,
  primaryAction,
  className,
}: {
  bullets: string[];
  primaryAction?: React.ReactNode;
  className?: string;
}) {
  if (!bullets.length) return null;
  return (
    <div
      className={cn(
        "rounded-lg bg-muted/40 border p-4 space-y-3",
        className
      )}
    >
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        خلاصه اجرایی
      </p>
      <ul className="space-y-1.5 text-sm leading-relaxed">
        {bullets.slice(0, 3).map((b, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-ai font-bold shrink-0">•</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
      {primaryAction && <div className="pt-1">{primaryAction}</div>}
    </div>
  );
}
