"use client";

import type { MouseEvent } from "react";
import { Card } from "@/components/ui/card";
import type { CompetitorIntel, CompetitorIntelItem } from "@/lib/competitors/types";
import { cn } from "@/lib/utils";

type Props = {
  intel: CompetitorIntel;
  active: CompetitorIntelItem[];
  onUpdatePosition: (patch: {
    x?: number;
    y?: number;
    xAxis?: string;
    yAxis?: string;
  }) => void;
  onUpdateRivalPosition: (id: string, x: number, y: number) => void;
};

export function PositionMapPanel({
  intel,
  active,
  onUpdatePosition,
  onUpdateRivalPosition,
}: Props) {
  const pos = intel.yourPosition || {
    x: 0.5,
    y: 0.5,
    xAxis: "قیمت (ارزان ← گران)",
    yAxis: "تخصص (عمومی ← تخصصی)",
  };

  const handleMapClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    // CSS y grows down; map yAxis typically "up = high"
    const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
    onUpdatePosition({ x, y });
  };

  return (
    <div className="space-y-4" dir="rtl">
      <div>
        <h2 className="font-semibold">نقشه موقعیت</h2>
        <p className="text-xs text-muted-foreground mt-1">
          روی نقشه کلیک کن تا جایگاه «شما» جابه‌جا شود. محورها را ویرایش کن.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">محور افقی</span>
          <input
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={pos.xAxis}
            onChange={(e) => onUpdatePosition({ xAxis: e.target.value })}
          />
        </label>
        <label className="space-y-1 text-xs">
          <span className="text-muted-foreground">محور عمودی</span>
          <input
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            value={pos.yAxis}
            onChange={(e) => onUpdatePosition({ yAxis: e.target.value })}
          />
        </label>
      </div>

      <Card className="p-4">
        <div
          className="relative aspect-[4/3] w-full rounded-xl border bg-muted/20 cursor-crosshair overflow-hidden"
          onClick={handleMapClick}
          role="presentation"
        >
          <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="border border-border/40" />
            ))}
          </div>

          <span className="absolute bottom-2 start-2 text-[10px] text-muted-foreground">
            {pos.xAxis}
          </span>
          <span className="absolute top-2 start-2 text-[10px] text-muted-foreground writing-mode-vertical">
            {pos.yAxis}
          </span>

          {active.map((c) => {
            const px = c.position?.x ?? 0.5;
            const py = c.position?.y ?? 0.5;
            return (
              <button
                key={c.id}
                type="button"
                title={c.name}
                className="absolute -translate-x-1/2 translate-y-1/2 w-2.5 h-2.5 rounded-full bg-muted-foreground/70 border border-background hover:scale-125 transition-transform"
                style={{ left: `${px * 100}%`, bottom: `${py * 100}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  // nudge toward click isn't needed; allow drag-like reposition via shift+click map later
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  const parent = e.currentTarget.parentElement;
                  if (!parent) return;
                  const rect = parent.getBoundingClientRect();
                  const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  const y = Math.max(0, Math.min(1, 1 - (e.clientY - rect.top) / rect.height));
                  onUpdateRivalPosition(c.id, x, y);
                }}
              />
            );
          })}

          <div
            className={cn(
              "absolute -translate-x-1/2 translate-y-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background shadow",
              "ring-4 ring-primary/20"
            )}
            style={{ left: `${pos.x * 100}%`, bottom: `${pos.y * 100}%` }}
            title="شما"
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">
          نقطه صورتی = شما · دوبارکلیک روی نقطه رقیب برای جابه‌جایی
        </p>
      </Card>

      {intel.whiteSpace && intel.whiteSpace.length > 0 && (
        <Card className="p-4 space-y-2">
          <p className="text-sm font-medium">شکاف‌های سفید روی نقشه</p>
          <ul className="space-y-1">
            {intel.whiteSpace.map((w) => (
              <li key={w} className="text-xs text-muted-foreground">
                • {w}
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
