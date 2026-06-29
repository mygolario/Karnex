"use client";

import dynamic from "next/dynamic";
import { Loader2, MapPin, AlertTriangle } from "lucide-react";
import { useLocation } from "../location-context";
import { CompetitorTable } from "../competitor-table";
import { Card } from "@/components/ui/card";
import { ConfidenceBadge } from "../confidence-badge";

const InteractiveMap = dynamic(
  () => import("../interactive-map").then((m) => m.InteractiveMap),
  {
    loading: () => (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    ),
    ssr: false,
  }
);

interface MapTabProps {
  radius: number;
}

export function MapTab({ radius }: MapTabProps) {
  const { analysis, requestPinAnalysis } = useLocation();
  if (!analysis) return null;

  const catchment = analysis.catchment;
  const cann = analysis.cannibalization;

  return (
    <div className="space-y-4 dir-rtl">
      {catchment && (
        <Card className="p-4 border-white/5 bg-card/30 flex flex-wrap gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">شعاع: </span>
            <span className="font-bold">{catchment.radiusM}m</span>
          </div>
          <div>
            <span className="text-muted-foreground">چگالی POI: </span>
            <span className="font-bold">{catchment.poiDensity}</span>
          </div>
          <div>
            <span className="text-muted-foreground">حمل‌ونقل: </span>
            <span className="font-bold">{catchment.transitStops} ایستگاه</span>
          </div>
          <ConfidenceBadge level={catchment.confidence} />
        </Card>
      )}

      {cann?.hasOverlap && (
        <Card className="p-4 border-amber-500/20 bg-amber-500/5 flex gap-2 text-xs">
          <AlertTriangle className="text-amber-400 shrink-0" size={16} />
          <div>
            <p className="font-bold text-amber-300 mb-1">ریسک کانibalization</p>
            <p className="text-muted-foreground">{cann.summary}</p>
          </div>
          <ConfidenceBadge level={cann.confidence || "inferred"} />
        </Card>
      )}

      <div className="h-[420px] rounded-xl overflow-hidden border border-white/5">
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
          radius={catchment?.radiusM || radius}
          onPinDragEnd={requestPinAnalysis}
          mapStyle="light"
          showLayerToggle
        />
      </div>

      <CompetitorTable />
    </div>
  );
}
