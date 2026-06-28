"use client";

import { Card } from "@/components/ui/card";
import { Users, DollarSign, TrendingUp, Store, Info } from "lucide-react";
import { useLocation } from "./location-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

function useCountUp(target: number, duration = 1200, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return val;
}

const METRIC_CONFIG = [
  {
    key: "footfallIndex" as const,
    label: "پاخور منطقه",
    icon: Users,
    tooltip: "تعداد تقریبی افرادی که روزانه از این منطقه عبور می‌کنند",
    colorMap: {
      High: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "from-emerald-500 to-cyan-500", glow: "shadow-[0_0_20px_rgba(52,211,153,0.15)]" },
      Medium: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", bar: "from-amber-500 to-orange-500", glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]" },
      Low: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", bar: "from-rose-500 to-red-500", glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]" },
    },
    valueMap: { High: "بسیار بالا", Medium: "متوسط", Low: "کم" },
    barWidth: { High: 90, Medium: 55, Low: 25 },
    emoji: { High: "🔥", Medium: "🚶", Low: "🌙" },
  },
  {
    key: "spendPower" as const,
    label: "قدرت خرید",
    icon: DollarSign,
    tooltip: "میزان تمایل و توانایی ساکنان منطقه برای خرج کردن",
    colorMap: {
      High: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "from-emerald-500 to-teal-500", glow: "shadow-[0_0_20px_rgba(52,211,153,0.15)]" },
      Medium: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", bar: "from-amber-500 to-yellow-500", glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]" },
      Low: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", bar: "from-rose-500 to-pink-500", glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]" },
    },
    valueMap: { High: "بالا", Medium: "متوسط", Low: "پایین" },
    barWidth: { High: 88, Medium: 52, Low: 22 },
    emoji: { High: "💎", Medium: "💰", Low: "💸" },
  },
  {
    key: "competitionDensity" as const,
    label: "تراکم رقبا",
    icon: Store,
    tooltip: "تعداد کسب‌وکارهای مشابه در شعاع ۵۰۰ متری",
    colorMap: {
      High: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", bar: "from-rose-500 to-red-500", glow: "shadow-[0_0_20px_rgba(244,63,94,0.15)]" },
      Medium: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", bar: "from-amber-500 to-orange-500", glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]" },
      Low: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", bar: "from-emerald-500 to-cyan-500", glow: "shadow-[0_0_20px_rgba(52,211,153,0.15)]" },
    },
    valueMap: { High: "اشباع شده", Medium: "متوسط", Low: "فرصت خوب" },
    barWidth: { High: 85, Medium: 50, Low: 20 },
    emoji: { High: "⚔️", Medium: "🛡️", Low: "🏆" },
  },
];

export function MetricCards() {
  const { analysis } = useLocation();
  const [hovered, setHovered] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(timer);
  }, [analysis]);

  if (!analysis?.metrics) return null;
  const metrics = analysis.metrics;

  return (
    <div ref={ref} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {METRIC_CONFIG.map((metric, index) => {
          const value = metrics[metric.key] as string;
          const colors = metric.colorMap[value as keyof typeof metric.colorMap] || metric.colorMap.Medium;
          const displayVal = metric.valueMap[value as keyof typeof metric.valueMap] || value;
          const barPct = metric.barWidth[value as keyof typeof metric.barWidth] || 50;
          const emoji = metric.emoji[value as keyof typeof metric.emoji] || "📊";
          const Icon = metric.icon;

          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHovered(metric.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <Card className={cn(
                "relative p-5 border overflow-hidden cursor-default transition-all duration-300",
                colors.bg, colors.border,
                hovered === metric.key && colors.glow
              )}>
                {/* Background emoji watermark */}
                <div className="absolute top-2 left-3 text-5xl opacity-5 select-none pointer-events-none">
                  {emoji}
                </div>

                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", colors.bg, colors.border, "border")}>
                    <Icon size={16} className={colors.text} />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{metric.label}</span>
                </div>

                {/* Value */}
                <div className={cn("text-xl font-black mb-3", colors.text)}>
                  {emoji} {displayVal}
                </div>

                {/* Animated bar */}
                <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className={cn("h-full rounded-full bg-gradient-to-r", colors.bar)}
                    initial={{ width: 0 }}
                    animate={{ width: visible ? `${barPct}%` : 0 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 + index * 0.1 }}
                  />
                </div>

                {/* Tooltip */}
                <AnimatedTooltip show={hovered === metric.key} text={metric.tooltip} />
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Risk/Reward full bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <Card className="p-5 bg-card/30 backdrop-blur border-white/5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp size={16} className="text-violet-400" />
              <span className="text-sm font-bold">نسبت ریسک / پاداش</span>
            </div>
            <span className="text-sm font-black text-foreground">{metrics.riskRewardRatio}٪</span>
          </div>
          <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${metrics.riskRewardRatio}%` }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
            <span className="text-emerald-400/70">ریسک کم — پاداش کم</span>
            <span className="text-rose-400/70">ریسک بالا — پاداش بالا</span>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

function AnimatedTooltip({ show, text }: { show: boolean; text: string }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-0 start-0 end-0 p-3 bg-background/95 backdrop-blur-sm border-t border-border text-xs text-muted-foreground flex items-start gap-2"
    >
      <Info size={14} className="shrink-0 mt-0.5 text-primary" />
      {text}
    </motion.div>
  );
}
