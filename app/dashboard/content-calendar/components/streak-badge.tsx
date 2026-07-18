"use client";

import { ContentStreak } from "@/lib/db";
import { motion } from "framer-motion";
import { Flame, Trophy, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakBadgeProps {
  streak: ContentStreak;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  const isOnFire = streak.current >= 3;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center gap-3"
    >
      {/* Streak Counter */}
      <motion.div
        className={cn(
          "relative flex items-center gap-2 px-4 py-2 rounded-2xl border",
          isOnFire
            ? "bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40 shadow-lg shadow-amber-500/10"
            : "bg-white/5 border-white/10"
        )}
        animate={isOnFire ? { boxShadow: ["0 0 20px rgba(245,158,11,0.1)", "0 0 30px rgba(245,158,11,0.2)", "0 0 20px rgba(245,158,11,0.1)"] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <motion.div
          animate={isOnFire ? { rotate: [-5, 5, -5] } : {}}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <Flame className={cn("w-5 h-5", isOnFire ? "text-amber-400" : "text-slate-500")} />
        </motion.div>
        <div className="text-right">
          <div className="flex items-baseline gap-1">
            <span className={cn("text-xl font-black", isOnFire ? "text-amber-400" : "text-slate-400")}>
              {streak.current}
            </span>
            <span className="text-xs text-muted-foreground">هفته</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-none">استریک جاری</p>
        </div>
      </motion.div>

      {/* Best Record */}
      {streak.best > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
          <Trophy className="w-3.5 h-3.5 text-yellow-500" />
          <div className="text-right">
            <span className="text-sm font-bold text-foreground">{streak.best}</span>
            <span className="text-[10px] text-muted-foreground mr-1">بهترین</span>
          </div>
        </div>
      )}

      {/* This week */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
        <Zap className="w-3.5 h-3.5 text-sky-400" />
        <div className="text-right">
          <span className="text-sm font-bold text-foreground">{streak.thisWeekPublished}</span>
          <span className="text-[10px] text-muted-foreground mr-1">این هفته</span>
        </div>
      </div>
    </motion.div>
  );
}
