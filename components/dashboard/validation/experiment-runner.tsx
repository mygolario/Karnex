"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  EXPERIMENT_STATUS_LABELS,
  EXPERIMENT_RUN_STATUSES,
  type ExperimentRunState,
  type ExperimentRunStatus,
  type ValidationExperiment,
} from "@/lib/validation/types";
import { FlaskConical, MessageSquare } from "lucide-react";

export function ExperimentRunner({
  experiments,
  runStates,
  primaryId,
  onUpdateRun,
  onAskCopilot,
}: {
  experiments: ValidationExperiment[];
  runStates: ExperimentRunState[];
  primaryId?: string;
  onUpdateRun: (
    experimentId: string,
    patch: Partial<ExperimentRunState>
  ) => void;
  onAskCopilot: (exp: ValidationExperiment) => void;
}) {
  const [focusId, setFocusId] = useState(
    primaryId || experiments.find((e) => e.isPrimary)?.id || experiments[0]?.id
  );

  const focus =
    experiments.find((e) => e.id === focusId) || experiments[0] || null;
  const run = focus
    ? runStates.find((r) => r.experimentId === focus.id) || {
        experimentId: focus.id,
        status: "todo" as ExperimentRunStatus,
        notes: "",
        result: "",
        updatedAt: "",
      }
    : null;

  if (!focus || !run) {
    return (
      <p className="text-sm text-muted-foreground">آزمایشی در گزارش نیست.</p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <FlaskConical className="h-4 w-4 text-ai mt-0.5" />
        <div>
          <h3 className="text-sm font-bold">اجرای آزمایش این هفته</h3>
          <p className="text-xs text-muted-foreground">
            یک آزمایش را جلو ببر، نتیجه را ثبت کن، بعد بازامتیاز بگیر.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {experiments.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setFocusId(e.id)}
            className={cn(
              "rounded-lg border px-2.5 py-1.5 text-xs",
              focusId === e.id
                ? "border-ai/40 bg-ai/10"
                : "border-border text-muted-foreground"
            )}
          >
            {e.title}
            {e.isPrimary || e.id === primaryId ? (
              <Badge className="ms-1 text-[9px] px-1 py-0">اولویت</Badge>
            ) : null}
          </button>
        ))}
      </div>

      <div
        className={cn(
          "rounded-xl border p-4 space-y-3",
          focus.isPrimary || focus.id === primaryId
            ? "border-ai/40 bg-ai/5"
            : ""
        )}
      >
        <h4 className="font-semibold text-sm">{focus.title}</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {focus.steps || "گام‌ها مشخص نشده."}
        </p>
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>معیار: {focus.metric || "—"}</span>
          <span>هزینه: {focus.estimatedCost || "—"}</span>
          <span>زمان: {focus.estimatedTime || "—"}</span>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">وضعیت</Label>
          <div className="flex flex-wrap gap-2">
            {EXPERIMENT_RUN_STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() =>
                  onUpdateRun(focus.id, {
                    status: s,
                    updatedAt: new Date().toISOString(),
                  })
                }
                className={cn(
                  "rounded-lg border px-2.5 py-1 text-xs",
                  run.status === s
                    ? "border-ai/40 bg-ai/10"
                    : "text-muted-foreground"
                )}
              >
                {EXPERIMENT_STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">یادداشت اجرا</Label>
          <Textarea
            rows={2}
            value={run.notes}
            placeholder="چه کردی؟ با چند نفر حرف زدی؟"
            onChange={(e) =>
              onUpdateRun(focus.id, {
                notes: e.target.value,
                updatedAt: new Date().toISOString(),
              })
            }
            className="text-sm resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">نتیجه / یادگیری</Label>
          <Textarea
            rows={2}
            value={run.result}
            placeholder="فرض تأیید شد؟ رد شد؟ چه چیزی عوض شد؟"
            onChange={(e) =>
              onUpdateRun(focus.id, {
                result: e.target.value,
                updatedAt: new Date().toISOString(),
              })
            }
            className="text-sm resize-none"
          />
        </div>

        <Button
          size="sm"
          className="gap-2"
          onClick={() => onAskCopilot(focus)}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          ادامه با کوپایلت
        </Button>
      </div>
    </div>
  );
}
