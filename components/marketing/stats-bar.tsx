"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Users, FolderKanban, Wrench, Clock } from "lucide-react";

/* ── Persian digit formatter ── */
const toPersian = (n: number) =>
  n.toLocaleString("fa-IR");

/* ── Animated counter ── */
function AnimatedCounter({
  value,
  suffix = "",
  duration = 2000,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const prefersReducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, prefersReducedMotion]);

  return (
    <span ref={ref}>
      {toPersian(display)}
      {suffix}
    </span>
  );
}

const stats = [
  { icon: Users, value: 2000, suffix: "+", label: "کارآفرین فعال", color: "text-primary" },
  { icon: FolderKanban, value: 15000, suffix: "+", label: "پروژه ساخته شده", color: "text-secondary" },
  { icon: Wrench, value: 50000, suffix: "+", label: "ابزار استفاده شده", color: "text-startup" },
  { icon: Clock, value: 24, suffix: "/۷", label: "پشتیبانی هوشمند", color: "text-traditional" },
];

export const StatsBar = () => {
  return (
    <section className="relative py-12 border-y border-border/40 bg-muted/20 overflow-hidden">
      {/* Subtle gradient line top */}
      <div className="absolute top-0 start-0 end-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:gap-4 lg:text-start"
            >
              <div className={`w-12 h-12 rounded-2xl bg-muted/60 flex items-center justify-center mb-3 lg:mb-0 shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl lg:text-3xl font-black text-foreground leading-none mb-1">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
