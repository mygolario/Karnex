"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GenerationLoaderProps {
  isLoading: boolean;
  progress?: number; // 0 to 100
  title?: string;
}

const TIPS = [
  "در حال تحلیل مدل‌های کسب‌وکار موفق...",
  "ساختاردهی به جریان‌های درآمدی...",
  "شناسایی بخش‌های مشتریان هدف...",
  "بهینه‌سازی ارزش پیشنهادی...",
  "بررسی استراتژی‌های رشد...",
  "تدوین ساختار هزینه‌ها...",
  "تحلیل رقبا و مزیت‌های رقابتی...",
];

export function GenerationLoader({ isLoading, progress, title = "در حال ساخت طرح کسب‌وکار" }: GenerationLoaderProps) {
  const [tipIndex, setTipIndex] = useState(0);
  const [dots, setDots] = useState("");

  // Rotate tips
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isLoading]);

  // Animated dots
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-md p-8 flex flex-col items-center"
        >
          {/* 3D Building Blocks Animation */}
          <div className="relative h-40 w-40 mb-12 perserve-3d">
            <div className="absolute inset-0 flex items-center justify-center" style={{ perspective: "1000px" }}>
              {/* Base Block */}
              <motion.div
                className="absolute w-16 h-16 bg-blue-600 rounded-lg shadow-xl"
                initial={{ y: 50, opacity: 0, scale: 0.5, rotateX: 45, rotateZ: 45 }}
                animate={{ y: 0, opacity: 1, scale: 1, rotateX: 60, rotateZ: 45 }}
                transition={{ duration: 0.6, delay: 0, type: "spring" }}
                style={{ zIndex: 1 }}
              />
              {/* Middle Block */}
              <motion.div
                className="absolute w-16 h-16 bg-indigo-500 rounded-lg shadow-xl"
                initial={{ y: -50, opacity: 0, scale: 0.5, rotateX: 45, rotateZ: 45 }}
                animate={{ y: -25, opacity: 1, scale: 1, rotateX: 60, rotateZ: 45 }}
                transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
                style={{ zIndex: 2 }}
              />
              {/* Top Block */}
              <motion.div
                className="absolute w-16 h-16 bg-purple-500 rounded-lg shadow-xl"
                initial={{ y: -100, opacity: 0, scale: 0.5, rotateX: 45, rotateZ: 45 }}
                animate={{ y: -50, opacity: 1, scale: 1, rotateX: 60, rotateZ: 45 }}
                transition={{ duration: 0.6, delay: 0.8, type: "spring" }}
                style={{ zIndex: 3 }}
              />

              {/* Floating Particles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{ opacity: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 100 - 50
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-2 text-center text-primary">
            {title}{dots}
          </h3>

          <div className="h-8 mb-6 overflow-hidden relative w-full text-center">
            <AnimatePresence mode="wait">
              <motion.p
                key={tipIndex}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="text-muted-foreground text-sm absolute w-full font-medium"
              >
                {TIPS[tipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden relative">
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
              initial={{ width: "0%" }}
              animate={{
                width: progress !== undefined ? `${progress}%` : "100%",
                left: progress !== undefined ? "0%" : ["-100%", "100%"]
              }}
              transition={
                progress !== undefined
                  ? { type: "spring", stiffness: 50 }
                  : { repeat: Infinity, duration: 2, ease: "linear" }
              }
            />
          </div>

          {progress !== undefined && (
            <p className="mt-2 text-xs font-mono text-muted-foreground">{progress}%</p>
          )}

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
