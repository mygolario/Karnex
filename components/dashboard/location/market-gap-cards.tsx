"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, ArrowUpRight } from "lucide-react";
import { useLocation } from "./location-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const POTENTIAL_CONFIG = {
  High: { color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20", label: "پتانسیل بالا", icon: "🚀" },
  Medium: { color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20", label: "پتانسیل متوسط", icon: "📊" },
  Low: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", label: "پتانسیل اولیه", icon: "💡" },
};

export function MarketGapCards() {
  const { analysis } = useLocation();

  if (!analysis?.marketGapCards || analysis.marketGapCards.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles size={18} className="text-primary" />
        <h3 className="font-bold text-sm">فرصت‌های کشف نشده</h3>
        <Badge variant="outline" className="text-[10px] border-primary/20 text-primary bg-primary/5">
          Market Gaps
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {analysis.marketGapCards.map((gap, index) => {
          const config = POTENTIAL_CONFIG[gap.potential] || POTENTIAL_CONFIG.Medium;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className={cn(
                "p-5 border hover:border-primary/20 transition-all duration-300 group cursor-default",
                "bg-card/30 backdrop-blur border-white/5"
              )}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">{config.icon}</span>
                  <Badge variant="outline" className={cn("text-[10px] font-bold", config.bg, config.color)}>
                    {config.label}
                  </Badge>
                </div>
                <h4 className="font-bold text-sm mb-2 group-hover:text-primary transition-colors">
                  {gap.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {gap.description}
                </p>
                <div className="mt-3 flex items-center gap-1 text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <TrendingUp size={12} />
                  فرصت سرمایه‌گذاری
                  <ArrowUpRight size={10} />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
