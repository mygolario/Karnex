"use client";

import { motion } from "framer-motion";
import { useLocation } from "./location-context";
import { cn } from "@/lib/utils";
import { Fingerprint } from "lucide-react";

export function LocationDnaCard() {
  const { analysis } = useLocation();

  if (!analysis?.locationDNA) return null;

  const dna = analysis.locationDNA;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="relative rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-card/40 to-indigo-500/5 p-5 overflow-hidden backdrop-blur-md"
    >
      {/* Decorative bg glow */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative dir-rtl">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Fingerprint size={16} className="text-violet-400 shrink-0" />
          <span className="text-xs font-bold text-violet-300">DNA موقعیت</span>
        </div>

        {/* Archetype */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{dna.archetypeIcon}</span>
          <div>
            <h4 className="font-black text-base text-foreground leading-tight">{dna.archetype}</h4>
            <p className="text-xs text-muted-foreground mt-0.5">شخصیت محله</p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {dna.tags?.map((tag, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.07 }}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-300"
            >
              {tag}
            </motion.span>
          ))}
        </div>

        {/* Story */}
        <p className="text-xs text-muted-foreground leading-relaxed text-justify border-r-2 border-violet-500/30 pr-3">
          {dna.story}
        </p>
      </div>
    </motion.div>
  );
}
