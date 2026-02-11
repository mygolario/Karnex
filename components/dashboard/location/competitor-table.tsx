"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Target, Shield, Zap } from "lucide-react";
import { useLocation } from "./location-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip
} from "recharts";

export function CompetitorTable() {
  const { analysis } = useLocation();

  if (!analysis?.competitorAnalysis) return null;

  const { directCompetitors, saturationLevel, marketGap, competitorCount } = analysis.competitorAnalysis;

  // Build radar chart data from first 4 competitors
  const radarData = directCompetitors && directCompetitors.length > 0
    ? ["product", "marketing", "price", "support"].map(axis => {
        const entry: any = { 
          axis: axis === "product" ? "محصول" : axis === "marketing" ? "بازاریابی" : axis === "price" ? "قیمت" : "پشتیبانی" 
        };
        directCompetitors.slice(0, 4).forEach((comp, i) => {
          entry[comp.name] = comp.scores?.[axis as keyof typeof comp.scores] || 5;
        });
        return entry;
      })
    : null;

  const COLORS = ["#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];

  const getSaturationBadge = () => {
    if (!saturationLevel) return null;
    if (saturationLevel.includes("Blue")) return { label: "اقیانوس آبی — فرصت!", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" };
    if (saturationLevel.includes("Red")) return { label: "اقیانوس قرمز — اشباع", color: "bg-red-500/10 text-red-500 border-red-500/20" };
    return { label: "بازار نیشی", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" };
  };

  const badge = getSaturationBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Market Status Bar */}
      <div className="flex flex-wrap items-center gap-3">
        {badge && (
          <Badge variant="outline" className={cn("px-3 py-1.5 text-xs font-bold", badge.color)}>
            <Target size={12} className="ml-1" /> {badge.label}
          </Badge>
        )}
        {competitorCount !== undefined && (
          <Badge variant="outline" className="px-3 py-1.5 text-xs border-border text-muted-foreground">
            <Store size={12} className="ml-1" /> {competitorCount} رقیب شناسایی شده
          </Badge>
        )}
        {marketGap && (
          <Badge variant="outline" className="px-3 py-1.5 text-xs border-emerald-500/20 text-emerald-500 bg-emerald-500/5">
            <Zap size={12} className="ml-1" /> خلاء: {marketGap}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competitor Table */}
        <Card className="p-0 overflow-hidden bg-card/30 border-white/5">
          <div className="p-4 border-b border-white/5">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              رقبای مستقیم
            </h4>
          </div>
          <div className="divide-y divide-white/5">
            {directCompetitors && directCompetitors.length > 0 ? directCompetitors.map((comp, i) => (
              <div key={i} className="flex items-center gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: `${COLORS[i % COLORS.length]}15`, color: COLORS[i % COLORS.length] }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate">{comp.name}</p>
                  <p className="text-[11px] text-muted-foreground">{comp.distance} فاصله</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 max-w-[120px] truncate">{comp.strength}</span>
                  <span className="text-[10px] px-2 py-1 rounded-md bg-red-500/10 text-red-500 border border-red-500/20 max-w-[120px] truncate">{comp.weakness}</span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-sm text-muted-foreground">رقیب مستقیمی شناسایی نشد</div>
            )}
          </div>
        </Card>

        {/* Radar Chart */}
        {radarData && directCompetitors && directCompetitors.length > 0 && (
          <Card className="p-6 bg-card/30 border-white/5">
            <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Target size={16} className="text-primary" />
              مقایسه قدرت رقبا
            </h4>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis tick={false} domain={[0, 10]} axisLine={false} />
                {directCompetitors.slice(0, 4).map((comp, i) => (
                  <Radar
                    key={comp.name}
                    name={comp.name}
                    dataKey={comp.name}
                    stroke={COLORS[i]}
                    fill={COLORS[i]}
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                ))}
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#1e293b',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {directCompetitors.slice(0, 4).map((comp, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  {comp.name}
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
