"use client";

import { motion } from "framer-motion";
import { useLocation } from "./location-context";
import { cn } from "@/lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine
} from "recharts";
import { TrendingUp, Info } from "lucide-react";
import { useState } from "react";

const SCENARIOS = [
  { key: "pessimistic", label: "بدبینانه", color: "#f43f5e", gradient: "pessGrad" },
  { key: "realistic", label: "واقع‌بینانه", color: "#8b5cf6", gradient: "realGrad" },
  { key: "optimistic", label: "خوش‌بینانه", color: "#22c55e", gradient: "optGrad" },
] as const;

function formatToman(val: number) {
  if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)} میلیارد`;
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)} میلیون`;
  return val.toLocaleString("fa-IR");
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f172a] border border-white/10 rounded-xl p-3 text-xs text-right dir-rtl min-w-[180px]">
      <p className="font-bold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between items-center gap-4 mb-1">
          <span style={{ color: p.color }} className="font-semibold">{
            SCENARIOS.find(s => s.key === p.dataKey)?.label
          }</span>
          <span className="font-bold text-foreground">{formatToman(p.value)} ت</span>
        </div>
      ))}
    </div>
  );
};

export function RevenueProjectionChart() {
  const { analysis } = useLocation();
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  if (!analysis?.revenueProjection || analysis.revenueProjection.length === 0) return null;

  const data = analysis.revenueProjection;
  const milestones = data.filter(d => d.milestone);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl border border-white/8 bg-card/30 backdrop-blur-md p-6 dir-rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-violet-400" />
          <h4 className="font-bold text-sm">پیش‌بینی درآمد — ۱۲ ماه اول</h4>
        </div>
        <div className="text-[10px] text-muted-foreground bg-white/5 border border-white/8 px-2 py-1 rounded-full">
          بر اساس داده‌های بازار
        </div>
      </div>

      <p className="text-xs text-muted-foreground mb-5">
        سه سناریوی مختلف برای رشد درآمد کسب‌وکار شما در این موقعیت در ۱۲ ماه نخست
      </p>

      {/* Scenario toggles */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {SCENARIOS.map(s => (
          <button
            key={s.key}
            onClick={() => setActiveScenario(activeScenario === s.key ? null : s.key)}
            className={cn(
              "flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all",
              activeScenario === null || activeScenario === s.key
                ? "border-white/15 bg-white/5"
                : "border-white/5 opacity-40"
            )}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
            {s.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="pessGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="label"
              fontSize={9}
              tickLine={false}
              axisLine={false}
              stroke="#64748b"
              interval={1}
            />
            <YAxis
              fontSize={9}
              tickLine={false}
              axisLine={false}
              stroke="#64748b"
              tickFormatter={(v) => formatToman(v)}
              width={70}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Milestone reference lines */}
            {milestones.map((m, i) => (
              <ReferenceLine
                key={i}
                x={m.label}
                stroke="rgba(255,255,255,0.15)"
                strokeDasharray="4 4"
                label={{ value: m.milestone, position: "top", fontSize: 9, fill: "#94a3b8" }}
              />
            ))}

            {SCENARIOS.map(s => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={activeScenario === null || activeScenario === s.key ? 2 : 1}
                fillOpacity={activeScenario === null || activeScenario === s.key ? 1 : 0.2}
                fill={`url(#${s.gradient})`}
                opacity={activeScenario === null || activeScenario === s.key ? 1 : 0.3}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Milestone chips */}
      {milestones.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {milestones.map((m, i) => (
            <span key={i} className="text-[10px] bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-muted-foreground">
              📍 {m.milestone} — {m.label}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
