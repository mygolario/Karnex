"use client";

import { useState } from "react";
import { ChevronDown, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

export function AIReasoningPanel({
  reasoning,
  defaultOpen = false,
  className,
}: {
  reasoning?: string | null;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  if (!reasoning?.trim()) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-dashed border-ai/20 bg-muted/30 overflow-hidden",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-right text-xs font-medium text-ai hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Brain className="h-3.5 w-3.5" />
          تحلیل هوش مصنوعی
        </span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="border-t border-dashed border-ai/10 px-3 py-2.5 text-xs leading-relaxed text-muted-foreground whitespace-pre-wrap">
          {reasoning}
        </div>
      )}
    </div>
  );
}
