"use client";

import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useLocation } from "./location-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const RISK_CATEGORIES = [
  { key: "financial" as const, label: "ریسک مالی", emoji: "💰" },
  { key: "competition" as const, label: "ریسک رقابت", emoji: "⚔️" },
  { key: "accessibility" as const, label: "ریسک دسترسی", emoji: "🚗" },
  { key: "market" as const, label: "ریسک بازار", emoji: "📉" },
];

function getRiskColor(value: number) {
  if (value <= 30) return { bar: "bg-emerald-500", text: "text-emerald-500", label: "کم" };
  if (value <= 60) return { bar: "bg-amber-500", text: "text-amber-500", label: "متوسط" };
  return { bar: "bg-red-500", text: "text-red-500", label: "بالا" };
}

export function RiskGauge() {
  const { analysis } = useLocation();

  if (!analysis?.riskBreakdown) return null;

  const risk = analysis.riskBreakdown;
  const avgRisk = Math.round((risk.financial + risk.competition + risk.accessibility + risk.market) / 4);
  const avgColor = getRiskColor(avgRisk);

  // Semi-circle gauge using strokeDasharray (clean rendering)
  const svgW = 200;
  const svgH = 120;
  const cx = 100;
  const cy = 105;
  const r = 80;
  const semiCircumference = Math.PI * r;
  const progressOffset = semiCircumference - (avgRisk / 100) * semiCircumference;
  const strokeColor = avgRisk <= 30 ? "#10b981" : avgRisk <= 60 ? "#f59e0b" : "#ef4444";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="p-6 bg-card/30 border-white/5">
        <h4 className="font-bold text-sm mb-6 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500" />
          تحلیل ریسک
        </h4>

        <div className="flex flex-col lg:flex-row items-center gap-8">
          {/* Semi-circle Gauge */}
          <div className="relative flex flex-col items-center">
            <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
              {/* Background semi-circle */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={semiCircumference}
                strokeDashoffset={0}
                transform={`rotate(180, ${cx}, ${cy})`}
              />
              {/* Progress semi-circle */}
              <motion.circle
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={strokeColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={semiCircumference}
                initial={{ strokeDashoffset: semiCircumference }}
                animate={{ strokeDashoffset: progressOffset }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                transform={`rotate(180, ${cx}, ${cy})`}
                style={{
                  filter: `drop-shadow(0 0 6px ${strokeColor}40)`,
                }}
              />
            </svg>
            <div className="absolute bottom-0 text-center">
              <div className={cn("text-3xl font-black", avgColor.text)}>{avgRisk}%</div>
              <div className="text-[10px] text-muted-foreground mt-0.5">{avgColor.label}</div>
            </div>
          </div>

          {/* Risk Breakdown Bars */}
          <div className="flex-1 w-full space-y-4">
            {RISK_CATEGORIES.map((cat, i) => {
              const value = risk[cat.key];
              const color = getRiskColor(value);
              return (
                <motion.div
                  key={cat.key}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <span>{cat.emoji}</span>
                      {cat.label}
                    </span>
                    <span className={cn("text-xs font-bold", color.text)}>{value}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", color.bar)}
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.4 + i * 0.1 }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
