"use client";

import { motion } from "framer-motion";
import { Sparkles, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProgressGamificationProps {
  currentStep: number;
  totalSteps: number;
  xpEarned?: number;
}

const encouragements = [
  "عالیه! داری خوب پیش میری 🎉",
  "ایده‌ات جالب به نظر میرسه! 💡",
  "داری حرفه‌ای کار می‌کنی! 🚀",
  "تقریباً تمومه! ادامه بده 💪",
  "چند قدم دیگه مونده! ⭐",
];

export function ProgressGamification({ currentStep, totalSteps, xpEarned = 0 }: ProgressGamificationProps) {
  const progress = (currentStep / totalSteps) * 100;
  const encouragement = encouragements[Math.min(currentStep - 1, encouragements.length - 1)];

  return (
    <div className="space-y-4">
      {/* Progress Ring and XP */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Progress Ring */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="text-muted"
              />
              <motion.circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="url(#progressGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                  pathLength: progress / 100,
                }}
                strokeDasharray="100"
                strokeDashoffset={100 - progress}
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary))" />
                  <stop offset="100%" stopColor="hsl(var(--secondary))" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
              {Math.round(progress)}%
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground">
              مرحله {currentStep} از {totalSteps}
            </p>
            <p className="text-xs text-muted-foreground">
              {encouragement}
            </p>
          </div>
        </div>

        {/* XP Counter */}
        <motion.div
          key={xpEarned}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1 px-3 py-1.5 bg-accent/10 rounded-full"
        >
          <Sparkles size={14} className="text-accent" />
          <span className="text-sm font-bold text-accent">{xpEarned} XP</span>
        </motion.div>
      </div>

      {/* Social Proof */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Users size={12} />
          <span>۱۲,۳۴۵ کارآفرین</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp size={12} />
          <span>۹۸٪ موفقیت</span>
        </div>
      </div>
    </div>
  );
}
