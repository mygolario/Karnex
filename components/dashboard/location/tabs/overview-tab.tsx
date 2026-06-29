"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { VerdictCommandCenter } from "../verdict-command-center";
import { ExecutiveSummaryCard } from "../executive-summary-card";
import { FitScoreBreakdown } from "../fit-score-breakdown";
import { StreetContextPanel } from "../street-context-panel";
import { QuickActionStrip } from "../quick-action-strip";
import { MetricCards } from "../metric-cards";
import { NeighborhoodCard } from "../neighborhood-card";
import { useLocation } from "../location-context";

const InteractiveMap = dynamic(
  () => import("../interactive-map").then((m) => m.InteractiveMap),
  {
    loading: () => (
      <div className="min-h-[200px] flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    ),
    ssr: false,
  }
);

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
  onOpenChat: () => void;
  radius: number;
}

export function OverviewTab({ onNavigateTab, onOpenChat, radius }: OverviewTabProps) {
  const { analysis, requestPinAnalysis } = useLocation();

  return (
    <div className="space-y-6 dir-rtl">
      <VerdictCommandCenter />
      <ExecutiveSummaryCard onNavigateTab={onNavigateTab} />
      <QuickActionStrip onOpenChat={onOpenChat} />
      <FitScoreBreakdown />
      <StreetContextPanel />
      {analysis && (
        <div className="h-[280px] rounded-xl overflow-hidden border border-white/5">
          <InteractiveMap
            center={analysis.coordinates || { lat: 35.6892, lon: 51.3890 }}
            competitors={
              analysis.competitorAnalysis?.directCompetitors
                ?.filter((c) => c.coordinates?.lat && c.coordinates?.lon)
                .map((c) => ({
                  name: c.name,
                  lat: c.coordinates!.lat,
                  lon: c.coordinates!.lon,
                })) || []
            }
            radius={analysis.catchment?.radiusM || radius}
            onPinDragEnd={requestPinAnalysis}
            mapStyle="light"
          />
        </div>
      )}
      <NeighborhoodCard />
      <MetricCards />
    </div>
  );
}
