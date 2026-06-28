"use client";

import { motion } from "framer-motion";
import { useLocation } from "./location-context";
import { cn } from "@/lib/utils";
import {
  Car, Navigation, Train, Eye, HardHat, Sun,
  CheckCircle2, AlertTriangle, XCircle
} from "lucide-react";

const TYPE_CONFIG: Record<string, { icon: any; label: string }> = {
  parking: { icon: Car, label: "پارکینگ" },
  direction: { icon: Navigation, label: "مسیر" },
  transit: { icon: Train, label: "حمل‌ونقل" },
  visibility: { icon: Eye, label: "دید از خیابان" },
  construction: { icon: HardHat, label: "ساخت‌وساز" },
  shade: { icon: Sun, label: "آفتاب" },
};

const SENTIMENT_CONFIG = {
  positive: {
    icon: CheckCircle2,
    border: "border-emerald-500/20",
    bg: "bg-emerald-500/8",
    iconColor: "text-emerald-400",
    valueColor: "text-emerald-300",
    dot: "bg-emerald-400",
  },
  neutral: {
    icon: AlertTriangle,
    border: "border-amber-500/20",
    bg: "bg-amber-500/8",
    iconColor: "text-amber-400",
    valueColor: "text-amber-300",
    dot: "bg-amber-400",
  },
  negative: {
    icon: XCircle,
    border: "border-rose-500/20",
    bg: "bg-rose-500/8",
    iconColor: "text-rose-400",
    valueColor: "text-rose-300",
    dot: "bg-rose-400",
  },
};

export function StreetIntelligence() {
  const { analysis } = useLocation();

  if (!analysis?.streetIntelligence || analysis.streetIntelligence.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="dir-rtl"
    >
      <div className="flex items-center gap-2 mb-3">
        <Navigation size={16} className="text-cyan-400" />
        <h4 className="text-sm font-bold">اطلاعات خیابانی</h4>
        <span className="text-[10px] text-muted-foreground bg-white/5 border border-white/8 px-2 py-0.5 rounded-full">
          Street Intelligence
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {analysis.streetIntelligence.map((item, i) => {
          const typeConf = TYPE_CONFIG[item.type] || { icon: Eye, label: item.type };
          const sentConf = SENTIMENT_CONFIG[item.sentiment] || SENTIMENT_CONFIG.neutral;
          const TypeIcon = typeConf.icon;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              className={cn(
                "rounded-xl border p-3 flex items-start gap-2.5",
                sentConf.bg, sentConf.border
              )}
            >
              <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5", sentConf.bg, sentConf.border)}>
                <TypeIcon size={14} className={sentConf.iconColor} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-muted-foreground font-medium">{typeConf.label}</p>
                <p className={cn("text-xs font-bold leading-tight mt-0.5", sentConf.valueColor)}>
                  {item.value}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
