"use client";

import { Card } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Store, Info } from "lucide-react";
import { useLocation } from "./location-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";

const METRIC_CONFIG = [
  {
    key: "footfallIndex" as const,
    label: "پاخور",
    icon: Users,
    tooltip: "تعداد تقریبی افرادی که روزانه از این منطقه عبور می‌کنند",
    colorMap: { High: "text-emerald-500", Medium: "text-amber-500", Low: "text-red-500" },
    valueMap: { High: "بسیار بالا", Medium: "متوسط", Low: "کم" },
    bgMap: { High: "bg-emerald-500/10 border-emerald-500/20", Medium: "bg-amber-500/10 border-amber-500/20", Low: "bg-red-500/10 border-red-500/20" },
  },
  {
    key: "spendPower" as const,
    label: "قدرت خرید",
    icon: DollarSign,
    tooltip: "میزان تمایل و توانایی ساکنان منطقه برای خرج کردن",
    colorMap: { High: "text-emerald-500", Medium: "text-amber-500", Low: "text-red-500" },
    valueMap: { High: "بالا", Medium: "متوسط", Low: "پایین" },
    bgMap: { High: "bg-emerald-500/10 border-emerald-500/20", Medium: "bg-amber-500/10 border-amber-500/20", Low: "bg-red-500/10 border-red-500/20" },
  },
  {
    key: "competitionDensity" as const,
    label: "تراکم رقابت",
    icon: Store,
    tooltip: "تعداد کسب‌وکارهای مشابه در شعاع ۵۰۰ متری",
    colorMap: { High: "text-red-500", Medium: "text-amber-500", Low: "text-emerald-500" },
    valueMap: { High: "بالا (اشباع)", Medium: "متوسط", Low: "کم (فرصت)" },
    bgMap: { High: "bg-red-500/10 border-red-500/20", Medium: "bg-amber-500/10 border-amber-500/20", Low: "bg-emerald-500/10 border-emerald-500/20" },
  },
];

export function MetricCards() {
  const { analysis } = useLocation();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  if (!analysis?.metrics) return null;

  const metrics = analysis.metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {METRIC_CONFIG.map((metric, index) => {
        const value = metrics[metric.key] as string;
        const Icon = metric.icon;
        return (
          <motion.div
            key={metric.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className={cn(
                "relative p-5 border cursor-default transition-all duration-300 overflow-hidden",
                metric.bgMap[value as keyof typeof metric.bgMap] || "bg-card/30 border-white/5"
              )}
              onMouseEnter={() => setHoveredCard(metric.key)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center",
                  value === "High" ? "bg-white/10" : value === "Medium" ? "bg-white/10" : "bg-white/10"
                )}>
                  <Icon size={20} className={metric.colorMap[value as keyof typeof metric.colorMap] || "text-muted-foreground"} />
                </div>
                <span className="text-sm font-medium text-muted-foreground">{metric.label}</span>
              </div>
              <div className={cn(
                "text-xl font-black",
                metric.colorMap[value as keyof typeof metric.colorMap] || "text-foreground"
              )}>
                {metric.valueMap[value as keyof typeof metric.valueMap] || value}
              </div>

              {/* Tooltip on hover */}
              {hoveredCard === metric.key && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute bottom-0 left-0 right-0 p-3 bg-background/95 backdrop-blur-sm border-t border-border text-xs text-muted-foreground flex items-start gap-2"
                >
                  <Info size={14} className="shrink-0 mt-0.5 text-primary" />
                  {metric.tooltip}
                </motion.div>
              )}
            </Card>
          </motion.div>
        );
      })}

      {/* Risk/Reward Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="sm:col-span-3"
      >
        <Card className="p-5 bg-card/30 backdrop-blur border-white/5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp size={18} />
              <span className="text-sm font-medium">نسبت ریسک / پاداش</span>
            </div>
            <span className="text-sm font-mono font-bold text-foreground">{metrics.riskRewardRatio}%</span>
          </div>
          <div className="h-3 w-full bg-secondary/30 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.riskRewardRatio}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span>ریسک کم</span>
            <span>ریسک بالا</span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
