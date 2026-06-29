"use client";

import { useLocation } from "../location-context";
import { RiskGauge } from "../risk-gauge";
import { SurvivalGauge } from "../survival-gauge";
import { OpeningReadiness } from "../opening-readiness";
import { RegulatoryChecklist } from "../regulatory-checklist";
import { Card } from "@/components/ui/card";
import { ConfidenceBadge } from "../confidence-badge";
import { Truck } from "lucide-react";

export function RiskTab() {
  const { analysis } = useLocation();
  const supply = analysis?.supplyChain;

  return (
    <div className="space-y-4 dir-rtl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RiskGauge />
        <SurvivalGauge />
      </div>

      {supply && (
        <Card className="p-5 border-white/5 bg-card/30">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <Truck size={16} className="text-cyan-400" />
            <h3 className="font-bold text-sm">زنجیره تأمین</h3>
            <ConfidenceBadge level={supply.confidence} />
            <span className="text-sm font-black mr-auto">{supply.score}/10</span>
          </div>
          <div className="space-y-2">
            {supply.items?.slice(0, 6).map((item, i) => (
              <div key={i} className="text-xs flex justify-between gap-2 border-b border-white/5 pb-2">
                <span>{item.name}</span>
                <span className="text-muted-foreground">{item.distance} · {item.relevance}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <RegulatoryChecklist />
      <OpeningReadiness />
    </div>
  );
}
