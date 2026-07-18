"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  EVIDENCE_ENTRY_LABELS,
  EVIDENCE_ENTRY_TYPES,
  type EvidenceEntry,
  type EvidenceEntryType,
  type ValidationAssumption,
} from "@/lib/validation/types";
import { Archive, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function EvidenceVault({
  entries,
  assumptions,
  onAdd,
  onRemove,
  onRescore,
  rescoreLoading,
  canRescore,
}: {
  entries: EvidenceEntry[];
  assumptions: ValidationAssumption[];
  onAdd: (entry: Omit<EvidenceEntry, "id" | "createdAt">) => void;
  onRemove: (id: string) => void;
  onRescore?: () => void;
  rescoreLoading?: boolean;
  canRescore?: boolean;
}) {
  const [type, setType] = useState<EvidenceEntryType>("interview");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [metric, setMetric] = useState("");
  const [assumptionIds, setAssumptionIds] = useState<string[]>([]);

  const toggleAssumption = (id: string) => {
    setAssumptionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submit = () => {
    if (!notes.trim() && !title.trim()) return;
    onAdd({
      type,
      title: title.trim() || EVIDENCE_ENTRY_LABELS[type],
      notes: notes.trim(),
      metric: metric.trim(),
      assumptionIds,
    });
    setTitle("");
    setNotes("");
    setMetric("");
    setAssumptionIds([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2">
          <Archive className="h-4 w-4 text-ai mt-0.5" />
          <div>
            <h3 className="text-sm font-bold">صندوق شواهد</h3>
            <p className="text-xs text-muted-foreground">
              مصاحبه، لیست انتظار، نظرسنجی یا سیگنال درآمد را ثبت کن.
            </p>
          </div>
        </div>
        {onRescore && (
          <Button
            size="sm"
            disabled={!canRescore || rescoreLoading}
            onClick={onRescore}
          >
            {rescoreLoading ? "بازامتیاز..." : "بازامتیاز (۲ اعتبار)"}
          </Button>
        )}
      </div>

      <div className="rounded-xl border bg-muted/20 p-3 space-y-3">
        <div className="flex flex-wrap gap-2">
          {EVIDENCE_ENTRY_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs",
                type === t ? "border-ai/40 bg-ai/10" : "text-muted-foreground"
              )}
            >
              {EVIDENCE_ENTRY_LABELS[t]}
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">عنوان</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثلاً: ۵ مصاحبه با فروشندگان"
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">یادداشت / نقل‌قول</Label>
          <Textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="چه شنیدی؟ چند نفر؟ نقل‌قول کلیدی…"
            className="text-sm resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">معیار عددی (اختیاری)</Label>
          <Input
            value={metric}
            onChange={(e) => setMetric(e.target.value)}
            placeholder="مثلاً: ۱۲ نفر در لیست انتظار"
            className="h-9 text-sm"
          />
        </div>
        {assumptions.length > 0 && (
          <div className="space-y-1.5">
            <Label className="text-xs">مرتبط با فرض‌ها</Label>
            <div className="flex flex-wrap gap-1.5">
              {assumptions.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => toggleAssumption(a.id)}
                  className={cn(
                    "rounded-lg border px-2 py-1 text-[10px] max-w-[200px] truncate",
                    assumptionIds.includes(a.id)
                      ? "border-ai/40 bg-ai/10"
                      : "text-muted-foreground"
                  )}
                  title={a.text}
                >
                  {a.text.slice(0, 40)}
                  {a.text.length > 40 ? "…" : ""}
                </button>
              ))}
            </div>
          </div>
        )}
        <Button size="sm" className="gap-1.5" onClick={submit}>
          <Plus className="h-3.5 w-3.5" />
          افزودن شاهد
        </Button>
      </div>

      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground">
            هنوز شاهدی ثبت نشده. اولین مصاحبه را همین هفته بنویس.
          </p>
        )}
        {entries.map((e) => (
          <div
            key={e.id}
            className="rounded-xl border p-3 flex gap-3 items-start"
          >
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {EVIDENCE_ENTRY_LABELS[e.type]}
                </Badge>
                <span className="text-sm font-medium truncate">{e.title}</span>
              </div>
              {e.notes && (
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {e.notes}
                </p>
              )}
              {e.metric && (
                <p className="text-[11px] text-muted-foreground">
                  معیار: {e.metric}
                </p>
              )}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0"
              onClick={() => onRemove(e.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
