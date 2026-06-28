"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Target, Zap } from "lucide-react";
import { useLocation } from "./location-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SWOT_SECTIONS = [
  {
    key: "strengths" as const,
    label: "نقاط قوت",
    icon: CheckCircle2,
    gradient: "from-emerald-500/15 to-emerald-500/5",
    border: "border-emerald-500/20",
    iconColor: "text-emerald-400",
    dot: "bg-emerald-400",
    headerBg: "bg-emerald-500/10",
    glow: "shadow-[inset_0_1px_0_0_rgba(52,211,153,0.1)]",
  },
  {
    key: "weaknesses" as const,
    label: "نقاط ضعف",
    icon: AlertTriangle,
    gradient: "from-rose-500/15 to-rose-500/5",
    border: "border-rose-500/20",
    iconColor: "text-rose-400",
    dot: "bg-rose-400",
    headerBg: "bg-rose-500/10",
    glow: "shadow-[inset_0_1px_0_0_rgba(251,113,133,0.1)]",
  },
  {
    key: "opportunities" as const,
    label: "فرصت‌ها",
    icon: Target,
    gradient: "from-blue-500/15 to-blue-500/5",
    border: "border-blue-500/20",
    iconColor: "text-blue-400",
    dot: "bg-blue-400",
    headerBg: "bg-blue-500/10",
    glow: "shadow-[inset_0_1px_0_0_rgba(96,165,250,0.1)]",
  },
  {
    key: "threats" as const,
    label: "تهدیدها",
    icon: Zap,
    gradient: "from-amber-500/15 to-amber-500/5",
    border: "border-amber-500/20",
    iconColor: "text-amber-400",
    dot: "bg-amber-400",
    headerBg: "bg-amber-500/10",
    glow: "shadow-[inset_0_1px_0_0_rgba(251,191,36,0.1)]",
  },
];

export function SwotGrid() {
  const { analysis } = useLocation();

  if (!analysis?.swot) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SWOT_SECTIONS.map((section, index) => {
          const items = analysis.swot[section.key];
          const Icon = section.icon;
          return (
            <motion.div
              key={section.key}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.08 }}
            >
              <Card className={cn(
                "p-0 border overflow-hidden backdrop-blur-sm",
                section.border,
                section.glow
              )}>
                {/* Header strip */}
                <div className={cn(
                  "flex items-center gap-2 px-4 py-3 border-b",
                  section.headerBg, section.border
                )}>
                  <Icon size={15} className={section.iconColor} />
                  <h4 className={cn("font-bold text-sm", section.iconColor)}>{section.label}</h4>
                  <span className="mr-auto text-[10px] text-muted-foreground font-medium">
                    {items?.length || 0} مورد
                  </span>
                </div>

                {/* Items */}
                <div className={cn("p-4 bg-gradient-to-br", section.gradient)}>
                  <ul className="space-y-2.5">
                    {items?.map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.08 + i * 0.05 }}
                        className="text-xs text-muted-foreground flex items-start gap-2.5 leading-relaxed"
                      >
                        <span className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", section.dot)} />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
