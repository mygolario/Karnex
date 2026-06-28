"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Rocket, BarChart3, Lightbulb } from "lucide-react";
import { useLocation } from "./location-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const POTENTIAL_CONFIG = {
  High: {
    color: "text-emerald-400",
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/8",
    badgeBg: "bg-emerald-500/15 border-emerald-500/25 text-emerald-300",
    label: "پتانسیل بالا",
    icon: Rocket,
    barColor: "from-emerald-500 to-cyan-500",
    barWidth: "w-[85%]",
    glow: "hover:shadow-[0_4px_20px_rgba(52,211,153,0.12)]",
  },
  Medium: {
    color: "text-amber-400",
    border: "border-amber-500/20",
    bg: "bg-amber-500/8",
    badgeBg: "bg-amber-500/15 border-amber-500/25 text-amber-300",
    label: "پتانسیل متوسط",
    icon: BarChart3,
    barColor: "from-amber-500 to-orange-500",
    barWidth: "w-[55%]",
    glow: "hover:shadow-[0_4px_20px_rgba(245,158,11,0.12)]",
  },
  Low: {
    color: "text-blue-400",
    border: "border-blue-500/20",
    bg: "bg-blue-500/8",
    badgeBg: "bg-blue-500/15 border-blue-500/25 text-blue-300",
    label: "پتانسیل اولیه",
    icon: Lightbulb,
    barColor: "from-blue-500 to-indigo-500",
    barWidth: "w-[35%]",
    glow: "hover:shadow-[0_4px_20px_rgba(96,165,250,0.12)]",
  },
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {analysis.marketGapCards.map((gap, index) => {
          const config = POTENTIAL_CONFIG[gap.potential] || POTENTIAL_CONFIG.Medium;
          const PotIcon = config.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className={cn(
                "p-0 border overflow-hidden transition-all duration-300 cursor-default group",
                config.border,
                config.glow
              )}>
                {/* Top gradient bar */}
                <div className="h-1 w-full">
                  <div className={cn("h-full bg-gradient-to-r", config.barColor)} />
                </div>

                <div className={cn("p-5", config.bg)}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border shrink-0",
                      config.badgeBg
                    )}>
                      <PotIcon size={18} className={config.color} />
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] font-bold", config.badgeBg)}>
                      {config.label}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h4 className={cn("font-black text-sm mb-2 group-hover:text-primary transition-colors")}>
                    {gap.title}
                  </h4>

                  {/* Description */}
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {gap.description}
                  </p>

                  {/* Potential bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>پتانسیل بازار</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={cn("h-full rounded-full bg-gradient-to-r", config.barColor)}
                        initial={{ width: 0 }}
                        animate={{ width: config.barWidth.replace("w-[", "").replace("]", "") }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.2 + index * 0.1 }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
