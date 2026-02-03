"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Zap, Rocket, Store, Video } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export const StripeHero = () => {
  return (
    <section className="relative w-full overflow-hidden bg-background pt-32 pb-40 lg:pt-48 lg:pb-64">
      
      {/* === Professional Gradient Backgrounds (Stripe-like) === */}
      <div className="absolute inset-0 pointer-events-none -z-20 overflow-hidden">
         {/* Main vivid gradient mesh */}
         <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-gradient-to-br from-primary/30 to-purple-600/30 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-70 animate-pulse-slow" />
         <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-cyan-400/20 to-emerald-400/20 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen opacity-60" />
         
         {/* Grid Pattern */}
         <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
         
         {/* Slatned Stripe Divider */}
         <div className="absolute bottom-0 left-0 w-full h-[150px] bg-background origin-bottom-right -skew-y-3 translate-y-1/2 scale-110" />
      </div>

      <div className="container relative z-10 px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* === Text Content === */}
          <div className="flex flex-col gap-8 text-center lg:text-right">
            
            {/* Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/5 dark:bg-slate-50/10 border border-slate-200 dark:border-slate-800 backdrop-blur-sm text-sm font-bold text-foreground w-fit mx-auto lg:mx-0 shadow-sm">
                    <span className="flex h-2 w-2 rounded-full bg-green-500 animate-ping" />
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ایده با تو، مسیرش با کارنکس</span>
                </div>
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1] md:leading-[1.1]"
            >
              هم‌بنیان‌گذار هوشمند برای <br />
              <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                هر نوع کسب‌وکار
              </span>
            </motion.h1>

            {/* Sub-headline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium"
            >
              با تکنولوژی <strong className="text-foreground">Genesis</strong>، مسیر اختصاصی خود را بسازید. 
              ابزارهای تخصصی برای <span className="text-foreground border-b-2 border-primary/20">استارتاپ‌ها</span>،{" "}
              <span className="text-foreground border-b-2 border-emerald-500/20">کسب‌وکارهای سنتی</span> و{" "}
              <span className="text-foreground border-b-2 border-pink-500/20">کریتورها</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:scale-105 bg-foreground text-background hover:bg-foreground/90 w-full sm:w-auto">
                  شروع رایگان
                  <ArrowLeft className="mr-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/#demo">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2 bg-background/50 backdrop-blur hover:bg-background transition-all w-full sm:w-auto">
                  <Play className="ml-2 h-4 w-4 fill-foreground" />
                  مشاهده دمو
                </Button>
              </Link>
            </motion.div>
            
            {/* Social Proof */}
            <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ duration: 1, delay: 0.6 }}
                 className="flex items-center gap-6 justify-center lg:justify-start pt-4 opacity-80"
            >
                <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-bold text-muted-foreground">Startup</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                    <Store className="w-5 h-5 text-emerald-500" />
                    <span className="text-sm font-bold text-muted-foreground">Traditional</span>
                </div>
                <div className="w-px h-4 bg-border" />
                <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-pink-500" />
                    <span className="text-sm font-bold text-muted-foreground">Creator</span>
                </div>
            </motion.div>
          </div>

          {/* === Visual Content (3D Interactive Mockup) === */}
          <div className="relative mx-auto w-full max-w-[600px]">
             <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-full blur-[100px] animate-pulse-slow" />
             
             {/* Main Card */}
             <motion.div 
               initial={{ opacity: 0, x: 100, rotateY: -20 }}
               animate={{ opacity: 1, x: 0, rotateY: 0 }}
               transition={{ duration: 1, type: "spring" }}
               className="relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-white/5 p-6 rounded-3xl shadow-2xl transform rotate-y-12 hover:rotate-y-0 transition-transform duration-700 perspective-1000"
             >
                {/* Mockup Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="px-3 py-1 rounded-full bg-muted/50 text-[10px] font-mono text-muted-foreground">
                        karnex.ir/dashboard
                    </div>
                </div>

                {/* Mockup Body - The Trinity Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/5 border border-primary/10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">
                            <Rocket size={24} />
                        </div>
                        <div>
                            <h4 className="font-bold text-foreground">راه‌اندازی استارتاپ</h4>
                            <p className="text-xs text-muted-foreground">تولید بوم، نقشه راه، MVP</p>
                        </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                            <Store size={20} />
                        </div>
                        <h4 className="font-bold text-sm">کسب‌وکار</h4>
                        <div className="mt-2 h-1.5 w-12 bg-emerald-100 rounded-full" />
                    </div>
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="w-10 h-10 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center mb-3">
                            <Video size={20} />
                        </div>
                        <h4 className="font-bold text-sm">کریتور</h4>
                        <div className="mt-2 h-1.5 w-12 bg-pink-100 rounded-full" />
                    </div>
                </div>

                {/* Mockup Chart */}
                <div className="h-32 w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50 relative overflow-hidden flex items-end justify-between px-4 pb-0 pt-8 gap-2">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                        <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                            className="w-full bg-gradient-to-t from-primary/20 to-primary rounded-t-sm opacity-80"
                        />
                    ))}
                </div>
             </motion.div>

             {/* Floating Elements */}
            <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -left-10 z-20"
            >
                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl border border-border flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-muted-foreground">سرعت ساخت</p>
                        <p className="text-lg font-black text-foreground">۳۰ ثانیه</p>
                    </div>
                </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

