"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { toPersianDigits } from "@/lib/utils";
import { blueprintBlocksFromInput, type QualityScoreInput } from "@/lib/onboarding/quality-score";
import { CheckCircle2, Circle } from "lucide-react";

interface Props {
  input: QualityScoreInput;
  score: number;
  gaps: { label: string; impact: number }[];
  className?: string;
}

export function BlueprintPreview({ input, score, gaps, className }: Props) {
  const blocks = blueprintBlocksFromInput(input);

  return (
    <aside
      className={cn(
        "frosted-glass rounded-2xl border border-border/60 p-5 flex flex-col gap-4",
        className
      )}
      aria-live="polite"
      aria-label="پیش‌نمایش طرح راه‌اندازی"
    >
      <div>
        <p className="text-xs font-bold text-muted-foreground mb-1">کیفیت طرح</p>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black text-brand-primary">
            {toPersianDigits(String(score))}٪
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-l from-brand-primary to-brand-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      <div>
        <p className="text-sm font-bold mb-3">بوم مدل (پیش‌نمایش)</p>
        <ul className="grid grid-cols-2 gap-2">
          {blocks.map((b) => (
            <li
              key={b.id}
              className={cn(
                "text-xs p-2 rounded-lg border flex items-center gap-1.5",
                b.filled
                  ? "border-brand-primary/30 bg-brand-primary/5 text-foreground"
                  : "border-dashed border-muted-foreground/30 text-muted-foreground"
              )}
            >
              {b.filled ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-primary shrink-0" aria-hidden />
              ) : (
                <Circle className="w-3.5 h-3.5 shrink-0" aria-hidden />
              )}
              {b.label}
            </li>
          ))}
        </ul>
      </div>

      {gaps.length > 0 && (
        <div>
          <p className="text-xs font-bold text-muted-foreground mb-2">برای بهبود طرح</p>
          <ul className="space-y-1">
            {gaps.slice(0, 3).map((g) => (
              <li key={g.label} className="text-xs text-muted-foreground">
                +{toPersianDigits(String(g.impact))}٪ — {g.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
