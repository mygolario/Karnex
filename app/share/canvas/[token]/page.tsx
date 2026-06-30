"use client";

import { useEffect, useState } from "react";
import { getTemplate } from "@/lib/canvas/templates";
import type { CanvasState, CanvasType } from "@/lib/canvas/types";

export default function ShareCanvasPage({ params }: { params: Promise<{ token: string }> }) {
  const [data, setData] = useState<{
    projectName: string;
    canvasType: CanvasType;
    state: CanvasState;
  } | null>(null);

  useEffect(() => {
    params.then(({ token }) => {
      fetch(`/api/share/canvas/${token}`)
        .then((r) => r.json())
        .then(setData)
        .catch(() => setData(null));
    });
  }, [params]);

  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">در حال بارگذاری...</div>;
  }

  const template = getTemplate(data.canvasType);

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-bold mb-2">{data.projectName}</h1>
      <p className="text-sm text-muted-foreground mb-8">{template.nameFa} — نمایش فقط‌خواندنی</p>
      <div
        className="grid gap-3 max-w-6xl mx-auto"
        style={{
          gridTemplateColumns: template.gridTemplateColumns,
          gridTemplateRows: template.gridTemplateRows,
          gridTemplateAreas: template.gridTemplateAreas,
        }}
      >
        {template.sections.map((section) => (
          <div
            key={section.id}
            className="rounded-xl border border-border/50 bg-background/80 backdrop-blur-xl p-4"
            style={{ gridArea: section.area }}
          >
            <h3 className="text-sm font-bold mb-2">{section.title}</h3>
            <div className="space-y-2">
              {(data.state[section.id] || []).map((card) => (
                <div key={card.id} className="text-xs p-2 rounded-lg bg-muted/50">
                  {card.content || "(خالی)"}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
