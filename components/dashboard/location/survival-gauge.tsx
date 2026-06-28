"use client";

import { motion } from "framer-motion";
import { useLocation } from "./location-context";
import { cn } from "@/lib/utils";
import { ShieldAlert } from "lucide-react";

function getArcColor(score: number) {
  if (score >= 70) return { stroke: "#22c55e", glow: "rgba(34,197,94,0.4)", text: "text-emerald-400", bg: "from-emerald-500/10" };
  if (score >= 45) return { stroke: "#f59e0b", glow: "rgba(245,158,11,0.4)", text: "text-amber-400", bg: "from-amber-500/10" };
  return { stroke: "#f43f5e", glow: "rgba(244,63,94,0.4)", text: "text-rose-400", bg: "from-rose-500/10" };
}

export function SurvivalGauge() {
  const { analysis } = useLocation();

  if (!analysis?.survivalProbability) return null;

  const { score, label, categoryInsight } = analysis.survivalProbability;
  const colors = getArcColor(score);

  // SVG arc parameters
  const svgW = 180;
  const svgH = 100;
  const cx = 90;
  const cy = 96;
  const r = 72;
  const semiCircumference = Math.PI * r;
  const progressOffset = semiCircumference - (score / 100) * semiCircumference;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className={cn(
        "rounded-2xl border border-white/8 p-5 bg-gradient-to-br to-card/30 backdrop-blur-md",
        colors.bg
      )}
    >
      <div className="flex items-center gap-2 mb-4 dir-rtl">
        <ShieldAlert size={16} className={colors.text} />
        <h4 className="text-sm font-bold">احتمال بقا</h4>
        {analysis.businessCategory && (
          <span className="text-[10px] text-muted-foreground bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
            {analysis.businessCategory}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 dir-rtl">
        {/* Semicircle gauge */}
        <div className="relative shrink-0">
          <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
            {/* Track */}
            <circle
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={semiCircumference}
              strokeDashoffset={0}
              transform={`rotate(180, ${cx}, ${cy})`}
            />
            {/* Progress */}
            <motion.circle
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={colors.stroke}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={semiCircumference}
              initial={{ strokeDashoffset: semiCircumference }}
              animate={{ strokeDashoffset: progressOffset }}
              transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 }}
              transform={`rotate(180, ${cx}, ${cy})`}
              style={{ filter: `drop-shadow(0 0 8px ${colors.glow})` }}
            />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center pb-1">
            <motion.span
              className={cn("text-3xl font-black", colors.text)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {score}٪
            </motion.span>
            <span className={cn("text-[10px] font-semibold mt-0.5", colors.text)}>{label}</span>
          </div>
        </div>

        {/* Category insight */}
        <p className="text-xs text-muted-foreground leading-relaxed text-justify flex-1">
          {categoryInsight}
        </p>
      </div>
    </motion.div>
  );
}
