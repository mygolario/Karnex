"use client";

import dynamic from "next/dynamic";
import { useLocation } from "../location-context";
import { Card } from "@/components/ui/card";
import { ConfidenceBadge } from "../confidence-badge";
import { Users } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const DemographicsDashboard = dynamic(
  () => import("../demographics-dashboard").then((m) => m.DemographicsDashboard),
  { loading: () => <div className="min-h-[200px]" /> }
);
const AnalysisCharts = dynamic(
  () => import("../analysis-charts").then((m) => m.AnalysisCharts),
  { loading: () => <div className="min-h-[200px]" /> }
);

export function CustomersTab() {
  const { analysis } = useLocation();
  if (!analysis) return null;

  const cohort = analysis.cohortFit;
  const tier = analysis.footfallTier || "ai";
  const tierLabel =
    tier === "real" ? "real" : tier === "inferred" ? "inferred" : "ai";

  return (
    <div className="space-y-4 dir-rtl">
      {cohort && (
        <Card className="p-5 border-white/5 bg-card/30">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Users size={16} className="text-violet-400" />
            <h3 className="font-bold text-sm">تطابق مشتری هدف</h3>
            <ConfidenceBadge level={cohort.confidence} />
            <span className="text-lg font-black mr-auto">{cohort.score}/10</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{cohort.summary}</p>
          {cohort.tags && (
            <div className="flex flex-wrap gap-1 mt-2">
              {cohort.tags.map((t) => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                  {t}
                </span>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card className="p-4 border-white/5 bg-card/30">
        <div className="flex items-center gap-2 mb-3">
          <span className="font-bold text-sm">پاخور</span>
          <ConfidenceBadge level={tierLabel} />
        </div>
        <AnalysisCharts />
      </Card>

      {analysis.seasonality && analysis.seasonality.length > 0 && (
        <Card className="p-4 border-white/5 bg-card/30">
          <h3 className="font-bold text-sm mb-3">فصلی‌سازی (ایران)</h3>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analysis.seasonality}>
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Line type="monotone" dataKey="index" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <DemographicsDashboard />
    </div>
  );
}
