"use client";

import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Copy, Share2, Sparkles, Target, Zap, Calendar, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface StrategySnapshotProps {
  plan: any;
  onContinue: () => void;
}

export function StrategySnapshot({ plan, onContinue }: StrategySnapshotProps) {
  const [copied, setCopied] = useState(false);

  if (!plan) return null;

  // Calculate stats (mock logic for display)
  const totalSteps = plan.roadmap?.reduce((acc: any, p: any) => acc + p.steps.length, 0) || 12;
  const estimatedDays = Math.round(totalSteps * 2.5);
  const difficulty = totalSteps > 15 ? "بالا" : totalSteps > 8 ? "متوسط" : "آسان";
  const difficultyColor = totalSteps > 15 ? "text-rose-400" : totalSteps > 8 ? "text-amber-400" : "text-emerald-400";

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 w-full" dir="rtl">
      
      <div className="relative z-10 w-full max-w-4xl animate-fade-in-up flex flex-col items-center">
        
         {/* Success Badge */}
        <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="mb-12"
        >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <CheckCircle2 size={16} />
                <span>طرح کسب‌وکار آماده شد!</span>
            </div>
        </motion.div>

        {/* Hero Section - Text Only, No Card */}
        <div className="text-center mb-16 space-y-6">
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-3xl mx-auto flex items-center justify-center text-5xl font-black text-white shadow-2xl shadow-primary/30"
            >
              {plan.projectName?.charAt(0) || "K"}
            </motion.div>
            
            <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tighter"
            >
                {plan.projectName}
            </motion.h1>
            
            <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xl text-white/60 font-light max-w-2xl mx-auto leading-relaxed"
            >
              {plan.tagline || plan.ideaInput}
            </motion.p>
        </div>

        {/* Stats Grid - Floating, Glassmorphism */}
        <motion.div 
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16"
        >
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center hover:bg-white/10 transition-colors group">
                 <Calendar className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
                 <span className="text-4xl font-black text-white mb-1">{estimatedDays}</span>
                 <span className="text-sm text-white/40">روز تا راه‌اندازی</span>
            </div>
            
             <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center hover:bg-white/10 transition-colors group">
                 <Gauge className={cn("w-8 h-8 mb-4 group-hover:scale-110 transition-transform", difficultyColor)} />
                 <span className={cn("text-4xl font-black mb-1", difficultyColor)}>{difficulty}</span>
                 <span className="text-sm text-white/40">سطح پیچیدگی</span>
            </div>

            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col items-center text-center hover:bg-white/10 transition-colors group">
                 <Target className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
                 <span className="text-xl font-bold text-white mb-1 line-clamp-1">{plan.audience || "عمومی"}</span>
                 <span className="text-sm text-white/40">مخاطب هدف</span>
            </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full max-w-md space-y-6 flex flex-col items-center"
        >
             <Button
              onClick={onContinue}
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-white h-20 rounded-2xl text-2xl font-bold shadow-[0_0_50px_rgba(236,72,153,0.4)] animate-pulse-glow transition-all hover:scale-[1.02]"
            >
                بریم داشبورد!
                <ArrowLeft className="w-6 h-6 mr-2" />
            </Button>

            <button
                className="flex items-center gap-2 text-white/40 hover:text-white transition-colors"
                onClick={handleCopy}
            >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400"/> : <Copy className="w-4 h-4"/>}
                <span className="text-sm font-medium">کپی خلاصه استراتژی</span>
            </button>
        </motion.div>

      </div>
    </div>
  );
}
