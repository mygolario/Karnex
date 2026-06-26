"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Brain, Rocket, Zap, Database, Search } from "lucide-react";
import { useState, useEffect } from "react";

interface GenerationLoaderProps {
  isLoading: boolean;
  title?: string;
  /** Optional explicit progress (0-100). When omitted, an honest indeterminate bar is shown. */
  progress?: number;
}

// Phases are mapped to elapsed-time buckets so messaging stays honest with the
// real AI (up to ~45s) + project-save (up to ~30s) budget. No fake "full bar".
const PHASES = [
  { untilMs: 8000, text: "تحلیل ورودی‌ها...", icon: Brain },
  { untilMs: 20000, text: "طراحی مدل کسب‌وکار...", icon: Zap },
  { untilMs: 35000, text: "بررسی رقبا و تدوین استراتژی...", icon: Search },
  { untilMs: 60000, text: "ساختاردهی داده‌ها...", icon: Database },
  { untilMs: Infinity, text: "آماده‌سازی داشبورد شما...", icon: Rocket },
];

export function GenerationLoader({
  isLoading,
  title = "در حال ساخت...",
  progress,
}: GenerationLoaderProps) {
  const [elapsed, setElapsed] = useState(0);
  const [start, setStart] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setStart(null);
      setElapsed(0);
      return;
    }
    const now = Date.now();
    setStart(now);
    const interval = setInterval(() => {
      setElapsed(Date.now() - now);
    }, 250);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const phase = PHASES.find((p) => elapsed < p.untilMs) ?? PHASES[PHASES.length - 1];
  const PhaseIcon = phase.icon;
  const hasRealProgress = typeof progress === "number";

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background text-foreground"
      dir="rtl"
    >
      {/* Ambient background (brand tokens) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 start-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-primary/20 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute top-1/3 end-1/4 w-[300px] h-[300px] bg-brand-secondary/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-12">
        {/* Central core */}
        <div className="relative">
          <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full animate-pulse-glow" />
          <div className="absolute inset-0 bg-brand-secondary/10 blur-2xl rounded-full" />

          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-muted/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-t-brand-primary border-r-transparent border-b-brand-secondary/50 border-l-transparent rounded-full animate-spin" />

            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={phase.text}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <PhaseIcon className="w-8 h-8 text-brand-primary" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-w-sm">
          <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 tracking-tight">
            {title}
          </h2>

          {/* Animated phase text */}
          <div className="h-8 relative overflow-hidden w-full flex justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={phase.text}
                initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2 text-muted-foreground font-medium absolute text-lg whitespace-nowrap"
              >
                <span>{phase.text}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Honest progress bar: real if provided, else indeterminate shimmer */}
          <div className="w-full h-1 bg-muted/20 rounded-full overflow-hidden mt-4 relative">
            {hasRealProgress ? (
              <motion.div
                className="h-full bg-gradient-to-r from-brand-primary to-brand-secondary"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.min(100, Math.max(0, progress!))}%` }}
                transition={{ duration: 0.4 }}
              />
            ) : (
              <motion.div
                className="h-full w-1/3 bg-gradient-to-r from-brand-primary to-brand-secondary rounded-full"
                animate={{ x: ["-100%", "300%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            )}
          </div>

          {!hasRealProgress && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>این مرحله ممکن است تا یک دقیقه طول بکشد...</span>
              <Sparkles className="w-3 h-3 text-brand-secondary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
