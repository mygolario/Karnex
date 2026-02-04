"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, Brain, Rocket, Zap, Database, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface GenerationLoaderProps {
  isLoading: boolean;
  title?: string;
  progress?: number;
}

const LOADING_PHASES = [
  { text: "تحلیل ورودی‌ها...", icon: Brain },
  { text: "طراحی مدل کسب‌وکار...", icon: Zap },
  { text: "بررسی رقبا...", icon: Search },
  { text: "ساختاردهی داده‌ها...", icon: Database },
  { text: "تدوین استراتژی نهایی...", icon: Sparkles },
  { text: "آماده‌سازی داشبورد...", icon: Rocket },
];

export function GenerationLoader({ isLoading, title = "در حال ساخت...", progress }: GenerationLoaderProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % LOADING_PHASES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  const CurrentIcon = LOADING_PHASES[phaseIndex].icon;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black text-white" dir="rtl">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] animate-pulse-glow" />
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05]" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-12">
        {/* Central Core Animation */}
        <div className="relative">
             {/* Glowing Orbs */}
             <div className="absolute inset-0 bg-primary/30 blur-3xl rounded-full animate-pulse-glow" />
             <div className="absolute inset-0 bg-secondary/20 blur-2xl rounded-full animate-pulse delay-75" />
             
             {/* Spinner */}
             <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-secondary border-l-transparent rounded-full animate-spin" />
                
                {/* Center Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={phaseIndex}
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CurrentIcon className="w-8 h-8 text-white" />
                        </motion.div>
                    </AnimatePresence>
                </div>
             </div>
        </div>

        <div className="space-y-6 max-w-sm">
             <h2 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 tracking-tight">
                {title}
             </h2>

             {/* Animated Text Phase */}
             <div className="h-8 relative overflow-hidden w-full flex justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={phaseIndex}
                        initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-2 text-white/60 font-medium absolute text-lg whitespace-nowrap"
                    >
                        <span>{LOADING_PHASES[phaseIndex].text}</span>
                    </motion.div>
                </AnimatePresence>
             </div>
             
             {/* Fake Progress Bar if undefined, real if defined */}
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mt-4">
                <motion.div 
                    className="h-full bg-gradient-to-r from-primary to-secondary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 15, ease: "easeInOut" }} // 15s fake loading duration
                />
            </div>
        </div>
      </div>
    </div>
  );
}
