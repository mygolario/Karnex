"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: "sm" | "md" | "lg";
}

export function ScoreGauge({ score, label, size = "lg" }: ScoreGaugeProps) {
  const sizes = {
    sm: { w: 80, stroke: 6, r: 32, font: "text-xl" },
    md: { w: 120, stroke: 8, r: 48, font: "text-3xl" },
    lg: { w: 160, stroke: 10, r: 64, font: "text-5xl" },
  };

  const s = sizes[size];
  const circumference = 2 * Math.PI * s.r;
  const progress = (score / 10) * circumference;
  const center = s.w / 2;

  const getScoreColor = () => {
    if (score >= 7) return { gradient: "from-emerald-400 to-cyan-400", stroke: "#10b981", bg: "bg-emerald-500/10", text: "text-emerald-500" };
    if (score >= 4) return { gradient: "from-amber-400 to-orange-400", stroke: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-500" };
    return { gradient: "from-red-400 to-rose-400", stroke: "#ef4444", bg: "bg-red-500/10", text: "text-red-500" };
  };

  const colors = getScoreColor();

  const getStatusText = () => {
    if (score >= 8) return "فوق‌العاده عالی";
    if (score >= 6) return "مناسب";
    if (score >= 4) return "متوسط";
    return "پر ریسک";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: s.w, height: s.w }}>
        <svg width={s.w} height={s.w} className="transform -rotate-90">
          {/* Background Circle */}
          <circle
            cx={center}
            cy={center}
            r={s.r}
            fill="none"
            stroke="currentColor"
            strokeWidth={s.stroke}
            className="text-white/5"
          />
          {/* Animated Progress Circle */}
          <motion.circle
            cx={center}
            cy={center}
            r={s.r}
            fill="none"
            stroke={colors.stroke}
            strokeWidth={s.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 8px ${colors.stroke}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={cn(s.font, "font-black", colors.text)}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-muted-foreground font-medium">از ۱۰</span>
        </div>
      </div>
      {label && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className={cn("px-4 py-1.5 rounded-full text-xs font-bold", colors.bg, colors.text)}
        >
          {label || getStatusText()}
        </motion.div>
      )}
      {!label && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className={cn("px-4 py-1.5 rounded-full text-xs font-bold", colors.bg, colors.text)}
        >
          {getStatusText()}
        </motion.div>
      )}
    </div>
  );
}
