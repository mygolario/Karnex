"use client";

import type { CompletenessItem } from "@/lib/pitch-deck";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompletenessPanelProps {
  items: CompletenessItem[];
  onJump: (slideIndex: number) => void;
  className?: string;
}

export function CompletenessPanel({ items, onJump, className }: CompletenessPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border/60 bg-background/60 p-3",
        className
      )}
      dir="rtl"
    >
      <div className="mb-2 flex items-center gap-2">
        {items.length === 0 ? (
          <CheckCircle2 size={14} className="text-emerald-500" />
        ) : (
          <AlertTriangle size={14} className="text-amber-500" />
        )}
        <h4 className="text-xs font-bold">آمادگی ارائه</h4>
      </div>
      {items.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">همه چیز برای ارائه آماده به‌نظر می‌رسد.</p>
      ) : (
        <ul className="max-h-40 space-y-1.5 overflow-y-auto">
          {items.slice(0, 8).map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => item.slideIndex >= 0 && onJump(item.slideIndex)}
                className={cn(
                  "w-full rounded-lg px-2 py-1.5 text-right text-[11px] transition-colors hover:bg-muted/50",
                  item.severity === "error" ? "text-rose-600" : "text-amber-700 dark:text-amber-400"
                )}
              >
                <span className="font-bold">{item.label}:</span> {item.message}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
