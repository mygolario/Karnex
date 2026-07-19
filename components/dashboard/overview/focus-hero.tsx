"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Play, Target } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FocusHeroProps {
  nextStepName: string | null;
}

export function FocusHero({ nextStepName }: FocusHeroProps) {
  if (!nextStepName) {
    return (
      <motion.div
        data-tour-id="overview-focus"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 shadow-2xl shadow-emerald-500/20"
      >
        <div className="absolute top-0 end-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 mix-blend-overlay" />
        <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between p-8 md:p-12 gap-8">
          <div className="flex-1 flex flex-col items-start space-y-6 w-full text-right">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-white" />
              <span className="text-sm font-medium text-white tracking-wide">وضعیت نقشه راه</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white leading-relaxed tracking-tight drop-shadow-sm py-2 text-right max-w-3xl">
              همه گام‌های فعلی انجام شده
            </h2>
            <p className="text-lg text-white/80 max-w-xl leading-relaxed text-right">
              عالی است! نقشه راه را مرور کنید یا با دستیار کارنکس گام بعدی را تعریف کنید.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
              <Link href="/dashboard/roadmap">
                <Button size="xl" className="h-14 px-8 text-lg rounded-2xl gap-3 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold bg-white text-emerald-700 hover:bg-white/90 border-0">
                  مشاهده نقشه راه
                </Button>
              </Link>
              <Link href="/dashboard/copilot">
                <Button size="xl" variant="outline" className="h-14 px-8 text-lg rounded-2xl gap-3 border-white/30 text-white hover:bg-white/10">
                  گفتگو با دستیار
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      data-tour-id="overview-focus"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative w-full overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary/80 to-violet-600 shadow-2xl shadow-primary/20"
    >
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 end-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 mix-blend-overlay" />
      <div className="absolute bottom-0 start-0 w-[300px] h-[300px] bg-black/10 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 mix-blend-overlay" />
       <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-soft-light" />


      <div className="relative z-10 flex flex-col md:flex-row items-stretch md:items-center justify-between p-8 md:p-12 gap-8">
        <div className="flex-1 flex flex-col items-start space-y-6 w-full text-right">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-white tracking-wide">مأموریت فعلی شما</span>
          </div>
          
          <h2 className="text-3xl md:text-5xl font-black text-white leading-relaxed md:leading-relaxed tracking-tight drop-shadow-sm py-2 text-right max-w-3xl">
            {nextStepName}
          </h2>
          
          <p className="text-lg text-white/80 max-w-xl leading-relaxed text-right">
            برای پیشرفت پروژه، این گام را تکمیل کنید. کارنکس در تمام مسیر همراه شماست.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-4 pt-4">
            <Link href="/dashboard/roadmap">
              <Button size="xl" className="h-14 px-8 text-lg rounded-2xl gap-3 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white border-0">
                شروع مأموریت <Play size={20} fill="currentColor" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Dynamic Visual Icon */}
        <div className="relative hidden md:flex items-center justify-center w-64 h-64">
           {/* Animated Rings */}
           {[1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                className="absolute inset-0 border-2 border-white/20 rounded-full"
              />
           ))}
           <div className="relative w-40 h-40 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl">
              <Target size={64} className="text-white drop-shadow-md" />
           </div>
        </div>
      </div>
    </motion.div>
  );
}
