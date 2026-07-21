"use client";

import { motion } from "framer-motion";
import { Sparkles, Zap, Compass } from "lucide-react";
import { useGenesisWizard } from "./genesis-wizard-context";
import { cn } from "@/lib/utils";

export function StepWelcome() {
  const { pathMode, setPathMode, advance } = useGenesisWizard();

  return (
    <div className="w-full max-w-2xl mx-auto px-6 pb-24 md:pb-8">
      <div className="text-center mb-10 space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white shadow-xl shadow-primary/25"
        >
          <Sparkles className="w-8 h-8" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl md:text-5xl font-black tracking-tight"
        >
          کارنکس
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed"
        >
          هم‌بنیان‌گذار هوشمندت اینجاست. ایده مبهم هم کافی است — قدم‌به‌قدم
          کمکت می‌کنیم تا بوم و نقشه راه بسازی.
        </motion.p>
      </div>

      <div className="space-y-3 mb-8">
        <p className="text-sm font-medium text-muted-foreground text-center mb-4">
          چقدر وقت داری؟
        </p>
        <button
          type="button"
          onClick={() => setPathMode("deep")}
          className={cn(
            "w-full rounded-2xl border p-5 text-start transition-all",
            pathMode === "deep"
              ? "border-brand-primary ring-2 ring-brand-primary/20 bg-brand-primary/5"
              : "border-border/60 bg-card/40 hover:border-brand-primary/40"
          )}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white">
              <Compass className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-lg">مسیر کامل</p>
              <p className="text-sm text-muted-foreground mt-1">
                حدود ۸ تا ۱۰ دقیقه — برای ایده مبهم، بهترین کیفیت نقشه راه
              </p>
            </div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setPathMode("express")}
          className={cn(
            "w-full rounded-2xl border p-5 text-start transition-all",
            pathMode === "express"
              ? "border-brand-primary ring-2 ring-brand-primary/20 bg-brand-primary/5"
              : "border-border/60 bg-card/40 hover:border-brand-primary/40"
          )}
        >
          <div className="flex items-start gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-secondary/90 text-white">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <p className="font-bold text-lg">مسیر سریع</p>
              <p className="text-sm text-muted-foreground mt-1">
                حدود ۳ دقیقه — سوال‌های کمتر، بعداً می‌توانی جزئیات را کامل کنی
              </p>
            </div>
          </div>
        </button>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex justify-center md:static md:border-0 md:bg-transparent md:p-0">
        <button
          type="button"
          onClick={advance}
          className="h-14 w-full max-w-md rounded-xl font-bold text-lg text-white bg-gradient-to-r from-brand-primary to-brand-secondary shadow-lg shadow-primary/25"
        >
          شروع گفت‌وگو با هم‌بنیان‌گذار
        </button>
      </div>
    </div>
  );
}
