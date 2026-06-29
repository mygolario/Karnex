"use client";

import { Card } from "@/components/ui/card";
import { useLocation } from "./location-context";
import { ScoreGauge } from "./score-gauge";
import { ConfidenceBadge } from "./confidence-badge";
import type { LocationConfidenceLevel } from "@/lib/db";

export function FitScoreBreakdown() {
  const { analysis } = useLocation();
  const items = analysis?.fitScoreBreakdown;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 dir-rtl">
      <Card className="lg:col-span-4 p-5 bg-card/30 border-white/5 flex flex-col items-center">
        <ScoreGauge score={analysis?.score ?? 0} />
        <p className="text-xs text-muted-foreground mt-2 text-center leading-relaxed">
          {analysis?.scoreReason}
        </p>
      </Card>
      <div className="lg:col-span-8 space-y-2">
        {(items && items.length > 0
          ? items
          : [
              { key: "footfall", label: "تطابق پاخور", score: analysis?.score ?? 0, confidence: "ai" as LocationConfidenceLevel, reason: analysis?.metrics?.footfallIndex ? `شاخص: ${analysis.metrics.footfallIndex}` : "" },
              { key: "competition", label: "رقابت", score: Math.max(0, 10 - (analysis?.competitorAnalysis?.saturationPercentage ?? 50) / 10), confidence: "inferred" as LocationConfidenceLevel, reason: analysis?.competitorAnalysis?.saturationLevel || "" },
            ]
        ).map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-card/20"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <span className="text-xs font-bold">{item.label}</span>
                <ConfidenceBadge level={item.confidence} />
              </div>
              {item.reason && (
                <p className="text-[11px] text-muted-foreground">{item.reason}</p>
              )}
            </div>
            <span className="text-lg font-black text-primary tabular-nums">
              {item.score.toFixed(1)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
