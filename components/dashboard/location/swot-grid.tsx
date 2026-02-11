"use client";

import { Card } from "@/components/ui/card";
import { CheckCircle2, AlertTriangle, Target, Info } from "lucide-react";
import { useLocation } from "./location-context";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const SWOT_SECTIONS = [
  { key: "strengths" as const, label: "نقاط قوت", icon: CheckCircle2, colors: "border-emerald-500/20 bg-emerald-500/5", iconColor: "text-emerald-500", dot: "bg-emerald-400" },
  { key: "weaknesses" as const, label: "نقاط ضعف", icon: AlertTriangle, colors: "border-rose-500/20 bg-rose-500/5", iconColor: "text-rose-500", dot: "bg-rose-400" },
  { key: "opportunities" as const, label: "فرصت‌ها", icon: Target, colors: "border-blue-500/20 bg-blue-500/5", iconColor: "text-blue-500", dot: "bg-blue-400" },
  { key: "threats" as const, label: "تهدیدها", icon: Info, colors: "border-amber-500/20 bg-amber-500/5", iconColor: "text-amber-500", dot: "bg-amber-400" },
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
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn("p-5 border", section.colors)}>
                <h4 className={cn("font-bold text-sm mb-3 flex items-center gap-2", section.iconColor)}>
                  <Icon size={16} />
                  {section.label}
                </h4>
                <ul className="space-y-2">
                  {items?.map((item, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2 leading-relaxed">
                      <span className={cn("mt-1.5 w-1.5 h-1.5 rounded-full shrink-0", section.dot)} />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
