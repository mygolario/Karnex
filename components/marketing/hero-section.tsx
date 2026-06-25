"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Play,
  Rocket,
  Store,
  Video,
  TrendingUp,
  Map,
  Bot,
} from "lucide-react";
import Link from "next/link";

/* ── Trust avatars (gradient circles with initials) ── */
const trustAvatars = [
  { initials: "ع", color: "from-violet-500 to-purple-600" },
  { initials: "س", color: "from-emerald-500 to-teal-600" },
  { initials: "م", color: "from-amber-500 to-orange-600" },
  { initials: "ز", color: "from-pink-500 to-rose-600" },
];

export const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-28 pb-16">
      {/* ═══ Background ═══ */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />

        {/* Animated mesh — desktop only */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              animate={{
                background: [
                  "radial-gradient(circle at 20% 50%, hsl(330 81% 60% / 0.12) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 50%, hsl(330 81% 60% / 0.12) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 50%, hsl(330 81% 60% / 0.12) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute inset-0"
            />
            <motion.div
              animate={{
                background: [
                  "radial-gradient(circle at 80% 30%, hsl(25 95% 53% / 0.08) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 70%, hsl(25 95% 53% / 0.08) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 30%, hsl(25 95% 53% / 0.08) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 12, repeat: Infinity }}
              className="absolute inset-0"
            />
          </>
        )}

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

        {/* Floating orbs */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-[15%] w-72 h-72 bg-primary/20 rounded-full blur-[100px]"
            />
            <motion.div
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-40 left-[10%] w-96 h-96 bg-secondary/15 rounded-full blur-[120px]"
            />
          </>
        )}
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center max-w-7xl mx-auto">
          {/* ═══ Right column (text — first in RTL) ═══ */}
          <div className="text-center lg:text-start">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                <span className="font-bold text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  ایده با تو، مسیرش با کارنکس
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.15] mb-6"
            >
              <span className="text-foreground">از ایده تا </span>
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                درآمد
              </span>
              <br />
              <span className="text-foreground">در یک پلتفرم</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              هم‌بنیان‌گذار هوشمند شما — مسیر اختصاصی برای{" "}
              <span className="text-startup font-bold">استارتاپ‌ها</span>،{" "}
              <span className="text-traditional font-bold">کسب‌وکارهای سنتی</span> و{" "}
              <span className="text-creator font-bold">تولیدکنندگان محتوا</span>.
            </motion.p>

            {/* Dual CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <Link href="/signup">
                <Button
                  size="xl"
                  rounded="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all font-bold gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  شروع رایگان
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button
                  size="xl"
                  variant="outline"
                  rounded="lg"
                  className="font-bold gap-2 h-[3.5rem]"
                >
                  <Play className="w-5 h-5" />
                  چطور کار می‌کند؟
                </Button>
              </Link>
            </motion.div>

            {/* Trust line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex items-center gap-4 justify-center lg:justify-start"
            >
              {/* Avatar stack */}
              <div className="flex -space-x-3 space-x-reverse">
                {trustAvatars.map((avatar, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-white font-bold text-sm border-2 border-background`}
                  >
                    {avatar.initials}
                  </div>
                ))}
              </div>
              <div className="text-start">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  مورد اعتماد <span className="font-bold text-foreground">۲,۰۰۰+</span> کارآفرین
                </p>
              </div>
            </motion.div>
          </div>

          {/* ═══ Left column (dashboard mockup) ═══ */}
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative hidden lg:block"
          >
            {/* Glow behind mockup */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 blur-[80px] rounded-3xl" />

            {/* Mockup card */}
            <div className="relative bg-card/80 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden">
              {/* Window bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <span className="text-xs text-muted-foreground font-medium ms-2">app.karnex.ir/dashboard</span>
              </div>

              {/* Mockup content */}
              <div className="p-6 space-y-4">
                {/* Greeting */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">سلام، علی 👋</p>
                    <p className="text-lg font-bold text-foreground">بریم مسیرت رو ادامه بدیم</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                </div>

                {/* Progress card */}
                <div className="rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-foreground">پیشرفت مسیر</span>
                    <span className="text-sm font-black text-primary">۶۸٪</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "68%" }}
                      transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                    />
                  </div>
                </div>

                {/* Mini cards row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border border-border/50 p-3">
                    <TrendingUp className="w-5 h-5 text-emerald-500 mb-2" />
                    <p className="text-lg font-black text-foreground">۱۲</p>
                    <p className="text-[10px] text-muted-foreground">قدم کامل شده</p>
                  </div>
                  <div className="rounded-xl border border-border/50 p-3">
                    <Map className="w-5 h-5 text-violet-500 mb-2" />
                    <p className="text-lg font-black text-foreground">۴</p>
                    <p className="text-[10px] text-muted-foreground">ابزار فعال</p>
                  </div>
                  <div className="rounded-xl border border-border/50 p-3">
                    <Sparkles className="w-5 h-5 text-amber-500 mb-2" />
                    <p className="text-lg font-black text-foreground">۸۵</p>
                    <p className="text-[10px] text-muted-foreground">امتیاز کارنکس</p>
                  </div>
                </div>

                {/* AI suggestion */}
                <div className="rounded-xl bg-muted/40 p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground mb-1">پیشنهاد دستیار کارنکس</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      گام بعدی: بوم مدل کسب‌وکارت رو کامل کن تا نقاط ضعفت رو پیدا کنیم.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge — bottom right */}
            {!prefersReducedMotion && (
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-6 -end-6 bg-card border border-border rounded-2xl shadow-xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">رشد این هفته</p>
                  <p className="text-sm font-black text-foreground">+۲۴٪ 🚀</p>
                </div>
              </motion.div>
            )}

            {/* Floating badge — top left */}
            {!prefersReducedMotion && (
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute -top-4 -start-4 bg-card border border-border rounded-2xl shadow-xl p-3 flex items-center gap-2"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-bold text-foreground">AI دستیار فعال</span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Three Pillars — compact inline row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-3 gap-3 max-w-2xl mx-auto mt-16 lg:hidden"
        >
          {[
            { icon: Rocket, title: "استارتاپ", color: "bg-startup" },
            { icon: Store, title: "سنتی", color: "bg-traditional" },
            { icon: Video, title: "محتوا", color: "bg-creator" },
          ].map((p) => (
            <div
              key={p.title}
              className="flex items-center gap-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3"
            >
              <div className={`w-8 h-8 rounded-lg ${p.color} flex items-center justify-center shrink-0`}>
                <p.icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-foreground">{p.title}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 start-1/2 -translate-x-1/2 hidden md:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1"
        >
          <div className="w-1.5 h-3 rounded-full bg-primary" />
        </motion.div>
      </motion.div>
    </section>
  );
};
