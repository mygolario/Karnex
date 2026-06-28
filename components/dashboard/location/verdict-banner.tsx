"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Zap } from "lucide-react";
import { useLocation } from "./location-context";
import { cn } from "@/lib/utils";

const VERDICT_CONFIG = {
  go: {
    label: "بروید — موقعیت مناسب است",
    icon: CheckCircle2,
    gradient: "from-emerald-500/20 via-emerald-500/10 to-transparent",
    border: "border-emerald-500/30",
    iconColor: "text-emerald-400",
    badgeBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
    glow: "shadow-[0_0_40px_rgba(16,185,129,0.15)]",
    pulse: "bg-emerald-400",
    label_short: "برو",
  },
  caution: {
    label: "با احتیاط پیش بروید",
    icon: AlertTriangle,
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
    border: "border-amber-500/30",
    iconColor: "text-amber-400",
    badgeBg: "bg-amber-500/15 border-amber-500/30 text-amber-300",
    glow: "shadow-[0_0_40px_rgba(245,158,11,0.15)]",
    pulse: "bg-amber-400",
    label_short: "احتیاط",
  },
  "no-go": {
    label: "پیشنهاد نمی‌شود",
    icon: XCircle,
    gradient: "from-rose-500/20 via-rose-500/10 to-transparent",
    border: "border-rose-500/30",
    iconColor: "text-rose-400",
    badgeBg: "bg-rose-500/15 border-rose-500/30 text-rose-300",
    glow: "shadow-[0_0_40px_rgba(244,63,94,0.15)]",
    pulse: "bg-rose-400",
    label_short: "نرو",
  },
};

export function VerdictBanner() {
  const { analysis } = useLocation();

  if (!analysis?.verdict) return null;

  const v = analysis.verdict;
  const config = VERDICT_CONFIG[v.decision] || VERDICT_CONFIG["caution"];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "relative rounded-2xl border p-5 overflow-hidden",
        "bg-gradient-to-r",
        config.gradient,
        config.border,
        config.glow
      )}
    >
      {/* Animated background pulse */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <motion.div
          className={cn("absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10 blur-2xl", config.pulse)}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative flex items-center gap-4 dir-rtl">
        {/* Verdict Icon */}
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border",
          config.badgeBg
        )}>
          <Icon size={28} className={config.iconColor} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={cn(
              "text-[11px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border",
              config.badgeBg
            )}>
              حکم هوش مصنوعی
            </span>
            <span className={cn(
              "text-xs font-bold px-2.5 py-1 rounded-full border",
              config.badgeBg
            )}>
              {config.label}
            </span>
            {v.confidence && (
              <span className="text-[10px] text-muted-foreground font-medium bg-white/5 border border-white/10 px-2 py-0.5 rounded-full">
                اطمینان: {v.confidence}٪
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-foreground leading-relaxed">
            {v.headline}
          </p>
        </div>

        {/* Big verdict label */}
        <div className={cn(
          "hidden sm:flex items-center justify-center w-20 h-14 rounded-xl text-2xl font-black border shrink-0",
          config.badgeBg,
          config.iconColor
        )}>
          {config.label_short}
        </div>
      </div>
    </motion.div>
  );
}
