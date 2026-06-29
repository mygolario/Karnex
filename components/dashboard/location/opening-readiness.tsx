"use client";

import { motion } from "framer-motion";
import { useLocation } from "./location-context";
import { cn } from "@/lib/utils";
import {
  Scale, Wallet, Building2, Megaphone, Settings2,
  CheckCircle2, Circle, AlertCircle
} from "lucide-react";

const CATEGORY_CONFIG: Record<string, { icon: any; label: string; color: string; bg: string; border: string }> = {
  legal: {
    icon: Scale,
    label: "حقوقی / قانونی",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
  },
  financial: {
    icon: Wallet,
    label: "مالی",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  physical: {
    icon: Building2,
    label: "فیزیکی / ساختاری",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  marketing: {
    icon: Megaphone,
    label: "بازاریابی",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
  operational: {
    icon: Settings2,
    label: "عملیاتی",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
  },
};

export function OpeningReadiness() {
  const { analysis, getReadinessChecked, toggleReadinessCheck } = useLocation();
  const checked = getReadinessChecked();

  const items = analysis?.openingReadiness;
  const legacyItems = analysis?.legalChecklist;

  // Use openingReadiness if available, fall back to legacy
  const allItems = items && items.length > 0 ? items : (legacyItems?.map((l, i) => ({
    id: `legacy-${i}`,
    title: l.title,
    desc: l.desc,
    category: "legal" as const,
    isRequired: l.isRequired,
    estimatedDays: undefined,
  })));

  if (!allItems || allItems.length === 0) return null;

  const toggle = (id: string) => {
    void toggleReadinessCheck(id);
  };

  const totalItems = allItems.length;
  const doneItems = checked.size;
  const progressPct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const requiredItems = allItems.filter(i => i.isRequired);
  const requiredDone = requiredItems.filter(i => checked.has(i.id)).length;

  // Group by category
  const grouped = allItems.reduce((acc, item) => {
    const cat = item.category || "operational";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof allItems>);

  const progressColor = progressPct >= 75
    ? "text-emerald-400"
    : progressPct >= 40
    ? "text-amber-400"
    : "text-rose-400";

  const arcR = 36;
  const arcCirc = 2 * Math.PI * arcR;
  const arcOffset = arcCirc - (progressPct / 100) * arcCirc;
  const arcStroke = progressPct >= 75 ? "#22c55e" : progressPct >= 40 ? "#f59e0b" : "#f43f5e";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/8 bg-card/30 backdrop-blur-md p-6 dir-rtl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={18} className="text-emerald-400" />
            <h4 className="font-bold text-sm">آمادگی برای افتتاح</h4>
          </div>
          <p className="text-xs text-muted-foreground">
            {requiredDone}/{requiredItems.length} الزامی انجام شده
          </p>
        </div>

        {/* Progress ring */}
        <div className="relative w-20 h-20 shrink-0">
          <svg width="80" height="80" className="transform -rotate-90">
            <circle cx="40" cy="40" r={arcR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
            <motion.circle
              cx="40" cy="40" r={arcR}
              fill="none"
              stroke={arcStroke}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={arcCirc}
              initial={{ strokeDashoffset: arcCirc }}
              animate={{ strokeDashoffset: arcOffset }}
              transition={{ duration: 1, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 6px ${arcStroke}60)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-xl font-black", progressColor)}>{progressPct}٪</span>
            <span className="text-[9px] text-muted-foreground">آماده</span>
          </div>
        </div>
      </div>

      {/* Category groups */}
      <div className="space-y-4">
        {Object.entries(grouped).map(([cat, catItems]) => {
          const catConf = CATEGORY_CONFIG[cat] || CATEGORY_CONFIG.operational;
          const CatIcon = catConf.icon;
          return (
            <div key={cat}>
              <div className={cn("flex items-center gap-1.5 text-xs font-bold mb-2 px-2 py-1 rounded-lg w-fit", catConf.bg, catConf.color)}>
                <CatIcon size={12} />
                {catConf.label}
              </div>
              <div className="space-y-2">
                {catItems.map((item, idx) => {
                  const isDone = checked.has(item.id);
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => toggle(item.id)}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200",
                        isDone
                          ? "bg-emerald-500/5 border-emerald-500/20 opacity-70"
                          : item.isRequired
                          ? "bg-rose-500/[0.03] border-rose-500/10 hover:border-rose-500/20"
                          : "bg-white/[0.02] border-white/5 hover:border-white/10"
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 size={16} className="text-emerald-400" />
                        ) : item.isRequired ? (
                          <AlertCircle size={16} className="text-rose-400" />
                        ) : (
                          <Circle size={16} className="text-muted-foreground/40" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className={cn(
                            "font-bold text-xs",
                            isDone ? "line-through text-muted-foreground" : "text-foreground"
                          )}>
                            {item.title}
                          </span>
                          {item.isRequired && !isDone && (
                            <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                              الزامی
                            </span>
                          )}
                          {item.estimatedDays && (
                            <span className="text-[9px] text-muted-foreground bg-white/5 border border-white/8 px-1.5 py-0.5 rounded">
                              ~{item.estimatedDays} روز
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
