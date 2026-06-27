"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/lib/canvas/store";
import { getTemplate } from "@/lib/canvas/templates";
import { SECTION_COLOR_VARIANTS } from "@/lib/canvas/color-variants";
import { toPersianDigits } from "@/lib/utils";

export function CanvasMinimap() {
  const canvasState = useCanvasStore((s) => s.canvasState);
  const canvasType = useCanvasStore((s) => s.canvasType);
  const viewport = useCanvasStore((s) => s.viewport);
  const zoomReset = useCanvasStore((s) => s.zoomReset);

  const template = getTemplate(canvasType);

  const totalCards = useMemo(() => {
    return Object.values(canvasState).reduce((sum, cards) => sum + cards.length, 0);
  }, [canvasState]);

  return (
    <div className="absolute bottom-3 end-3 z-20 w-48 bg-background/90 backdrop-blur-xl border border-border rounded-xl p-2 shadow-lg canvas-export-exclude">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">نمای کلی</span>
        <div className="flex items-center gap-1">
          <button onClick={zoomReset} className="text-[9px] text-muted-foreground hover:text-foreground transition-colors">
            {toPersianDigits(Math.round(viewport.zoom * 100))}%
          </button>
        </div>
      </div>
      <div
        className="grid gap-0.5 h-20"
        style={{
          gridTemplateColumns: template.gridTemplateColumns,
          gridTemplateRows: template.gridTemplateRows,
          gridTemplateAreas: template.gridTemplateAreas,
        }}
      >
        {template.sections.map((section) => {
          const cards = canvasState[section.id] || [];
          const variant = SECTION_COLOR_VARIANTS[section.color] || SECTION_COLOR_VARIANTS.blue;
          const hasContent = cards.length > 0;
          return (
            <div
              key={section.id}
              className={cn(
                "rounded-[3px] transition-all cursor-pointer",
                hasContent
                  ? cn("bg-gradient-to-br", variant.gradient, variant.darkGradient)
                  : "bg-muted/50",
              )}
              style={{ gridArea: section.area }}
              title={`${section.title}: ${cards.length} کارت`}
            />
          );
        })}
      </div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[9px] text-muted-foreground">{template.nameFa}</span>
        <span className="text-[9px] text-muted-foreground tabular-nums">{toPersianDigits(totalCards)} کارت</span>
      </div>
    </div>
  );
}
