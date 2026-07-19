"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ASSUMPTION_STATUS_LABELS,
  ASSUMPTION_STATUSES,
  type AssumptionStatus,
  type ValidationAssumption,
} from "@/lib/validation/types";
import { Target, MessageSquareText } from "lucide-react";

const RISK_STYLES: Record<string, string> = {
  critical: "border-rose-500/50 bg-rose-500/5",
  major: "border-amber-500/40 bg-amber-500/5",
  minor: "border-border bg-muted/30",
};

const STATUS_CYCLE: AssumptionStatus[] = [...ASSUMPTION_STATUSES];

export function AssumptionBoard({
  assumptions,
  statuses,
  onStatusChange,
  onRequestScript,
  onFocusExperiment,
  scriptLoading,
}: {
  assumptions: ValidationAssumption[];
  statuses: Record<string, AssumptionStatus>;
  onStatusChange: (id: string, status: AssumptionStatus) => void;
  onRequestScript?: (assumption: ValidationAssumption) => void;
  onFocusExperiment?: (experimentId: string) => void;
  scriptLoading?: boolean;
}) {
  const cycleStatus = (id: string) => {
    const current = statuses[id] || "open";
    const idx = STATUS_CYCLE.indexOf(current);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    onStatusChange(id, next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-2">
        <Target className="h-4 w-4 text-ai mt-0.5" />
        <div>
          <h3 className="text-sm font-bold">تخته کشتن فرض‌ها</h3>
          <p className="text-xs text-muted-foreground">
            روی وضعیت بزن تا بچرخد. فرض‌های بحرانی را اول بکش.
          </p>
        </div>
      </div>

      {assumptions.length === 0 && (
        <p className="text-sm text-muted-foreground">فرضی در گزارش نیست.</p>
      )}

      <div className="space-y-2">
        {assumptions.map((a) => {
          const status = statuses[a.id] || "open";
          return (
            <div
              key={a.id}
              className={cn(
                "rounded-xl border p-3 space-y-2",
                RISK_STYLES[a.risk] || RISK_STYLES.major
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {a.risk === "critical"
                    ? "بحرانی"
                    : a.risk === "minor"
                      ? "جزئی"
                      : "مهم"}
                </Badge>
                <button
                  type="button"
                  onClick={() => cycleStatus(a.id)}
                  className={cn(
                    "rounded-lg border px-2 py-0.5 text-[10px] font-medium",
                    status === "validated" &&
                      "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    status === "invalidated" &&
                      "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
                    status === "testing" &&
                      "border-ai/40 bg-ai/10 text-foreground",
                    status === "open" && "text-muted-foreground"
                  )}
                >
                  {ASSUMPTION_STATUS_LABELS[status]}
                </button>
              </div>
              <p className="text-sm leading-relaxed">{a.text}</p>
              <div className="flex flex-wrap gap-2">
                {a.experimentId && onFocusExperiment && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => onFocusExperiment(a.experimentId!)}
                  >
                    آزمایش مرتبط
                  </Button>
                )}
                {onRequestScript && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1"
                    disabled={scriptLoading}
                    onClick={() => onRequestScript(a)}
                  >
                    <MessageSquareText className="h-3 w-3" />
                    اسکریپت مصاحبه
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
