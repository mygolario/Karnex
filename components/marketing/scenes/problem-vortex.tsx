"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function ProblemVortex() {
  const [dots, setDots] = useState<{x: number, y: number, delay: number}[]>([]);

  useEffect(() => {
    // Generate random dots for the chaos/vortex effect
    const newDots = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }));
    setDots(newDots);
  }, []);

  return (
    <section className="h-screen w-full relative flex items-center justify-center bg-black text-white overflow-hidden snap-center">
      {/* === CHAOS BACKGROUND === */}
      <div className="absolute inset-0 opacity-30">
        {dots.map((dot, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-red-500 rounded-full"
            style={{ left: `${dot.x}%`, top: `${dot.y}%` }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
              opacity: [0, 1, 0],
              scale: [0, 2, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: dot.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* === CENTRAL VORTEX === */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
        >
            <h2 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900">
                ایده‌ها گم می‌شوند.
            </h2>
            <p className="text-xl md:text-3xl text-gray-400 font-light leading-relaxed">
               ۹۰٪ استارتاپ‌ها شکست می‌خورند، نه به‌خاطر ایده بد،<br/>
               بلکه به‌خاطر <span className="text-red-500 font-bold">هرج‌ و‌ مرج</span> در اجرا.
            </p>
        </motion.div>
      </div>

      {/* === Bottom Gradient === */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent" />
    </section>
  );
}
