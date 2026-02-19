"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Rocket, Store, Video } from "lucide-react";
import Link from "next/link";

const PillarCard = ({ 
  icon: Icon, 
  title, 
  color, 
  delay 
}: { 
  icon: any; 
  title: string; 
  color: string; 
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30, rotateX: -15 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ delay, duration: 0.8 }}
    whileHover={{ scale: 1.05, y: -5 }}
    className={`relative group cursor-pointer`}
  >
    <div className={`absolute inset-0 ${color} rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`} />
    <div className="relative bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center shadow-lg`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <span className="font-bold text-lg text-foreground">{title}</span>
    </div>
  </motion.div>
);

export const HeroSection = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* === ADVANCED BACKGROUND === */}
      <div className="absolute inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-muted/30" />
        
        {/* Animated mesh gradient - DESKTOP ONLY */}
        {!prefersReducedMotion && (
          <>
            <motion.div
              animate={{
                background: [
                  "radial-gradient(circle at 20% 50%, hsl(330 81% 60% / 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 50%, hsl(330 81% 60% / 0.15) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 50%, hsl(330 81% 60% / 0.15) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 10, repeat: Infinity }}
              className="absolute inset-0"
            />
            <motion.div
              animate={{
                background: [
                  "radial-gradient(circle at 80% 30%, hsl(25 95% 53% / 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 20% 70%, hsl(25 95% 53% / 0.1) 0%, transparent 50%)",
                  "radial-gradient(circle at 80% 30%, hsl(25 95% 53% / 0.1) 0%, transparent 50%)",
                ],
              }}
              transition={{ duration: 12, repeat: Infinity }}
              className="absolute inset-0"
            />
          </>
        )}

        {/* Static gradient fallback for reduced motion */}
        {prefersReducedMotion && (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(330_81%_60%_/0.1),transparent_70%)]" />
        )}
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        
        {/* Floating orbs - Disabled for reduced motion */}
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

      <div className="container relative z-10 px-4 md:px-6 py-20">
        <div className="max-w-5xl mx-auto text-center">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="font-bold text-sm bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                ایده با تو، مسیرش با کارنکس
              </span>
            </div>
          </motion.div>

          {/* Main Headline - Optimize LCP for Mobile */}
          <motion.h1
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-8"
          >
            <span className="text-foreground">هم‌بنیان‌گذار</span>
            <br />
            <span className="relative">
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                هوشمند
              </span>
              {/* Underline decoration */}
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <motion.path
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.8 }}
                  d="M2 8C50 2 150 2 198 8"
                  stroke="url(#gradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="0">
                    <stop offset="0%" stopColor="hsl(330 81% 60%)" />
                    <stop offset="100%" stopColor="hsl(25 95% 53%)" />
                  </linearGradient>
                </defs>
              </svg>
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            مسیر اختصاصی برای{" "}
            <span className="text-startup font-bold">استارتاپ‌ها</span>،{" "}
            <span className="text-traditional font-bold">کسب‌وکارهای سنتی</span> و{" "}
            <span className="text-creator font-bold">تولید کنندگان محتوا</span>.
            <br className="hidden md:block" />
            از ایده تا اولین درآمد، ما کنارتونیم.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Link href="/signup">
              <Button 
                size="lg" 
                className="h-16 px-10 text-lg rounded-2xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:scale-105 transition-all font-bold"
              >
                شروع رایگان
                <ArrowLeft className="mr-2 h-5 w-5" />
              </Button>
            </Link>

          </motion.div>

          {/* Three Pillars Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto"
          >
            <PillarCard 
              icon={Rocket} 
              title="استارتاپ" 
              color="bg-startup" 
              delay={0.7} 
            />
            <PillarCard 
              icon={Store} 
              title="کسب‌وکار سنتی" 
              color="bg-traditional" 
              delay={0.8} 
            />
            <PillarCard 
              icon={Video} 
              title="تولید کننده محتوا" 
              color="bg-creator" 
              delay={0.9} 
            />
          </motion.div>


        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
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
