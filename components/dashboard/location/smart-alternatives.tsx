"use client";

import { motion } from "framer-motion";
import { useLocation } from "./location-context";
import { cn } from "@/lib/utils";
import { MapPin, ArrowUpRight, Star } from "lucide-react";

function getScoreColor(score: number) {
  if (score >= 7) return { text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" };
  if (score >= 5) return { text: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" };
  return { text: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20" };
}

export function SmartAlternatives() {
  const { analysis, analyzeLocation } = useLocation();

  if (!analysis?.alternatives || analysis.alternatives.length === 0) return null;

  // Only show alternatives prominently if score is below 6
  const isLowScore = analysis.score < 6;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="dir-rtl"
    >
      <div className="flex items-center gap-2 mb-3">
        <MapPin size={16} className={isLowScore ? "text-amber-400" : "text-cyan-400"} />
        <h4 className="text-sm font-bold">
          {isLowScore ? "موقعیت‌های بهتر در نزدیکی" : "گزینه‌های جایگزین برای مقایسه"}
        </h4>
        {isLowScore && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300">
            پیشنهاد هوشمند
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {analysis.alternatives.map((alt, i) => {
          const colors = getScoreColor(alt.estimatedScore);
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="group rounded-xl border border-white/8 bg-card/30 backdrop-blur-sm p-4 hover:border-primary/20 transition-all duration-300 cursor-default"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border",
                  colors.bg, colors.text
                )}>
                  {alt.estimatedScore.toFixed(1)}
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <Star
                      key={j}
                      size={10}
                      className={j < Math.round(alt.estimatedScore / 3.33)
                        ? colors.text
                        : "text-white/10"
                      }
                      fill={j < Math.round(alt.estimatedScore / 3.33) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
              </div>

              <h5 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors leading-tight">
                {alt.name}
              </h5>
              <p className="text-[10px] text-muted-foreground mb-2">{alt.distance} از موقعیت فعلی</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{alt.reason}</p>

              <button
                onClick={() => {
                  if (analysis.city) {
                    analyzeLocation(
                      analysis.city,
                      alt.name,
                      analysis.businessDescription ||
                        analysis.inputs?.businessDescription ||
                        ""
                    );
                  }
                }}
                className="mt-3 w-full flex items-center justify-center gap-1 text-[10px] font-semibold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/20 rounded-lg py-1.5 transition-all"
              >
                <ArrowUpRight size={12} />
                تحلیل این موقعیت
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
