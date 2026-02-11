"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitCompare, X, MapPin, TrendingUp, Users, DollarSign, Store, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "./location-context";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScoreGauge } from "./score-gauge";

const COMPARISON_ROWS = [
  { key: "score", label: "امتیاز کل", icon: TrendingUp, format: (v: any) => `${v}/10` },
  { key: "footfall", label: "پاخور", icon: Users, format: (v: any) => v === "High" ? "بالا" : v === "Medium" ? "متوسط" : "کم" },
  { key: "spendPower", label: "قدرت خرید", icon: DollarSign, format: (v: any) => v === "High" ? "بالا" : v === "Medium" ? "متوسط" : "کم" },
  { key: "competition", label: "رقابت", icon: Store, format: (v: any) => v === "High" ? "بالا" : v === "Medium" ? "متوسط" : "کم" },
  { key: "risk", label: "ریسک", icon: AlertTriangle, format: (v: any) => `${v}%` },
  { key: "rent", label: "اجاره تخمینی", icon: DollarSign, format: (v: any) => v || "—" },
];

function extractValue(analysis: any, key: string) {
  switch (key) {
    case "score": return analysis.score;
    case "footfall": return analysis.metrics?.footfallIndex || "—";
    case "spendPower": return analysis.metrics?.spendPower || "—";
    case "competition": return analysis.metrics?.competitionDensity || "—";
    case "risk": return analysis.metrics?.riskRewardRatio || "—";
    case "rent": return analysis.rentEstimate || "—";
    default: return "—";
  }
}

function getBestIndex(values: any[], key: string): number {
  if (values.length < 2) return -1;
  if (key === "score") {
    const max = Math.max(...values.map(v => (typeof v === "number" ? v : 0)));
    return values.findIndex(v => v === max);
  }
  if (key === "risk") {
    const min = Math.min(...values.map(v => (typeof v === "number" ? v : 100)));
    return values.findIndex(v => v === min);
  }
  // For High/Medium/Low metrics (footfall, spendPower — higher is better)
  if (["footfall", "spendPower"].includes(key)) {
    const order = { High: 3, Medium: 2, Low: 1 };
    const scores = values.map(v => order[v as keyof typeof order] || 0);
    const max = Math.max(...scores);
    return scores.findIndex(s => s === max);
  }
  if (key === "competition") {
    // Lower competition = better
    const order = { High: 1, Medium: 2, Low: 3 };
    const scores = values.map(v => order[v as keyof typeof order] || 0);
    const max = Math.max(...scores);
    return scores.findIndex(s => s === max);
  }
  return -1;
}

export function ComparisonView() {
  const { comparisonItems, comparisonMode, removeFromComparison, toggleComparisonMode } = useLocation();

  if (!comparisonMode || comparisonItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
      >
        <Card className="p-6 bg-card/50 backdrop-blur-xl border-primary/10 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <GitCompare size={18} className="text-primary" />
              <h3 className="font-bold">مقایسه مکان‌ها</h3>
              <Badge variant="outline" className="text-[10px] text-primary border-primary/20">
                {comparisonItems.length} مکان
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={toggleComparisonMode} className="text-xs text-muted-foreground hover:text-foreground">
              <X size={14} className="ml-1" />
              بستن
            </Button>
          </div>

          {/* Score Gauges Row */}
          <div className="flex justify-center gap-8 mb-8">
            {comparisonItems.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <ScoreGauge score={item.score} size="sm" />
                <div className="text-center">
                  <p className="text-xs font-bold truncate max-w-[120px]">{item.address}</p>
                  <p className="text-[10px] text-muted-foreground">{item.city}</p>
                </div>
                <button
                  onClick={() => removeFromComparison(item.createdAt)}
                  className="text-[10px] text-red-400 hover:text-red-500 transition-colors"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="border border-white/5 rounded-xl overflow-hidden">
            {/* Header Row */}
            <div className="grid bg-white/[0.02] border-b border-white/5" style={{ gridTemplateColumns: `180px repeat(${comparisonItems.length}, 1fr)` }}>
              <div className="p-3 text-xs font-bold text-muted-foreground">معیار</div>
              {comparisonItems.map((item, i) => (
                <div key={i} className="p-3 text-xs font-bold text-center flex items-center justify-center gap-1">
                  <MapPin size={10} className="text-primary" />
                  {item.address.substring(0, 20)}
                </div>
              ))}
            </div>

            {/* Data Rows */}
            {COMPARISON_ROWS.map((row, ri) => {
              const values = comparisonItems.map(item => extractValue(item, row.key));
              const bestIdx = getBestIndex(values, row.key);
              const Icon = row.icon;

              return (
                <div
                  key={row.key}
                  className={cn(
                    "grid border-b border-white/5 last:border-none",
                    ri % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
                  )}
                  style={{ gridTemplateColumns: `180px repeat(${comparisonItems.length}, 1fr)` }}
                >
                  <div className="p-3 text-xs text-muted-foreground flex items-center gap-2">
                    <Icon size={14} />
                    {row.label}
                  </div>
                  {values.map((val, vi) => (
                    <div
                      key={vi}
                      className={cn(
                        "p-3 text-sm text-center font-semibold",
                        vi === bestIdx ? "text-emerald-500 bg-emerald-500/5" : "text-foreground"
                      )}
                    >
                      {row.format(val)}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
