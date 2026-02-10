"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Rocket, Sparkles, Play, Globe, Store, Video } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function ScrollyHero() {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  // Parallax Values
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.9]);
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 200]);

  // 3D Elements separate parallax
  const layer1Y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const layer2Y = useTransform(scrollYProgress, [0, 1], [0, -400]);

  return (
    <section ref={targetRef} className="relative h-[150vh] bg-background">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        
        {/* === Background Layers === */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="absolute inset-0 pattern-grid opacity-20 mask-radial-faded" />

        {/* === Floating Background Elements (Parallax) === */}
        <motion.div 
          style={{ y: layer1Y }}
          animate={{ x: [-20, 20, -20], opacity: [0.5, 0.8, 0.5] }} 
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", y: { duration: 0 } }}
          className="absolute top-[15%] right-[10%] w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-3xl" 
        />
        <motion.div 
           style={{ y: layer2Y }}
           animate={{ x: [20, -20, 20], opacity: [0.5, 0.8, 0.5] }} 
           transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", y: { duration: 0 } }}
           className="absolute bottom-[15%] left-[10%] w-96 h-96 bg-gradient-to-tr from-emerald-500/10 to-cyan-500/10 rounded-full blur-3xl" 
        />

        {/* === Content === */}
        <motion.div 
          style={{ opacity, scale, y }} 
          className="relative z-10 text-center max-w-5xl mx-auto px-4 mt-20 md:mt-0"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-8"
          >
            <Badge variant="outline" className="px-4 py-1.5 text-sm border-primary/20 bg-primary/5 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-primary mr-2 animate-pulse" />
              نسخه ۲.۰: دستیار کارنکس
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black tracking-tighter mb-8 leading-[1.1]"
          >
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-foreground to-foreground/50">
              ساخت کسب‌وکار
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-500 to-secondary animate-gradient-x">
              در سطح جهانی
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12"
          >
            اولین پلتفرم هوشمند که ایده شما را به برنامه اجرایی، 
            تحلیل مالی و استراتژی رشد تبدیل می‌کند.
          </motion.p>

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex justify-center gap-6"
          >
             <div className="flex items-center gap-4 justify-center">
                  <Link href="/pricing">
                    <Button 
                      size="xl" 
                      rounded="full"
                      className="bg-foreground text-background hover:bg-foreground/90 h-14 px-8 text-lg shadow-2xl shadow-primary/20"
                    >
                      <Rocket size={20} className="mr-2" />
                      شروع رایگان
                    </Button>
                  </Link>
                  
                  <Link href="/features">
                    <Button 
                      variant="outline"
                      size="xl" 
                      rounded="full"
                      className="h-14 px-8 text-lg backdrop-blur-md bg-white/5 border-white/10 hover:bg-white/10"
                    >
                      دموی محصول
                    </Button>
                  </Link>
              </div>
          </motion.div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-right">
               {[
                  { icon: Rocket, title: "استارتاپ", color: "bg-blue-500" },
                  { icon: Store, title: "کسب‌وکار سنتی", color: "bg-emerald-500" },
                  { icon: Video, title: "تولید محتوا", color: "bg-purple-500" },
              ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + i * 0.1 }}
                    className="p-4 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors"
                  >
                      <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white mb-3 shadow-lg`}>
                          <item.icon size={20} />
                      </div>
                      <h3 className="font-bold text-base">{item.title}</h3>
                  </motion.div>
              ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
