"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import type { SyncProposal } from "@/lib/pitch-deck";
import { getSlideTypeLabel } from "@/lib/pitch-deck";
import { RefreshCw, X } from "lucide-react";

interface SyncPanelProps {
  proposals: SyncProposal[];
  onApply: (acceptedIds: Set<string>) => void;
  onClose: () => void;
}

export function SyncPanel({ proposals, onApply, onClose }: SyncPanelProps) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(proposals.map((p) => p.slideId))
  );

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (proposals.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" dir="rtl">
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold">همگام‌سازی</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            داده‌ای از بوم، رقبا یا نقشه راه برای به‌روزرسانی اسلایدها پیدا نشد.
          </p>
          <Button className="mt-4 w-full" onClick={onClose}>
            بستن
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm" dir="rtl">
      <div className="max-h-[80vh] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <RefreshCw size={16} className="text-primary" />
            <h3 className="font-bold">همگام‌سازی از بوم و رقبا</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>
        <div className="max-h-[50vh] space-y-2 overflow-y-auto p-4">
          <p className="mb-3 text-xs text-muted-foreground">
            تغییرات پیشنهادی را انتخاب کنید. هیچ اسلایدی بدون تأیید شما بازنویسی نمی‌شود.
          </p>
          {proposals.map((p) => (
            <label
              key={`${p.slideId}-${p.description}`}
              className="flex cursor-pointer items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3 hover:bg-muted/40"
            >
              <Checkbox
                checked={selected.has(p.slideId)}
                onCheckedChange={() => toggle(p.slideId)}
                className="mt-0.5"
              />
              <div className="min-w-0 flex-1 text-right">
                <div className="text-xs font-bold">
                  {getSlideTypeLabel(p.slideType)} · {p.slideTitle || "بدون عنوان"}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{p.description}</div>
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-2 border-t border-border p-4">
          <Button variant="ghost" className="flex-1" onClick={onClose}>
            انصراف
          </Button>
          <Button
            className="flex-1 bg-gradient-to-l from-primary to-orange-500 font-bold text-white"
            onClick={() => onApply(selected)}
            disabled={selected.size === 0}
          >
            اعمال انتخاب‌شده‌ها
          </Button>
        </div>
      </div>
    </div>
  );
}
