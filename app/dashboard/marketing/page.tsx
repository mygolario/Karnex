"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Megaphone, TrendingUp, Users, Zap, Lightbulb, Target, Sparkles, BarChart3, Globe, Shield, AlertTriangle } from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverExplainer } from "@/components/ui/explainer";
import { LearnMore } from "@/components/ui/learn-more";
import { featureExplanations, getCostLabel, getDifficultyLabel } from "@/lib/knowledge-base";
import { ContentGeneratorButton } from "@/components/dashboard/content-generator-button";
import { CompetitorAnalyzer } from "@/components/dashboard/competitor-analyzer";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] as const } }
};

export default function MarketingPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [expandedTactic, setExpandedTactic] = useState<number | null>(null);

  if (loading || !plan) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="skeleton w-full h-48 rounded-[2rem]" />
        <div className="grid gap-4 w-full">
          {[1,2,3].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-[1400px] mx-auto space-y-12 pb-20"
    >
      
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-600 via-orange-600 to-amber-500 text-white shadow-2xl shadow-rose-500/20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-5 mb-4">
              <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center text-white shadow-inner border border-white/20 animate-pulse-glow">
                <Megaphone size={40} />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">بازاریابی و رشد</h1>
                <Badge variant="outline" className="border-white/20 text-white bg-white/10 backdrop-blur-sm px-3 py-1 gap-2">
                  <Sparkles size={14} />
                  استراتژی‌های عملی
                </Badge>
              </div>
            </div>
            <p className="text-white/90 max-w-2xl text-lg leading-relaxed font-medium">
              موتور جذب کاربر برای <span className="font-extrabold text-white bg-white/20 px-2 rounded">{plan.projectName}</span>. 
              اینجا استراتژی‌ها به برنامه اجرایی تبدیل می‌شوند.
            </p>
          </div>
          
          <div className="text-right hidden md:block glass px-6 py-4 rounded-2xl border-white/10 min-w-[200px]">
             <div className="text-xs text-white/70 mb-2 uppercase tracking-widest font-bold">مخاطب هدف</div>
             <Badge variant="secondary" className="text-base py-1 px-3 bg-white text-rose-600 hover:bg-white/90">{plan.audience}</Badge>
          </div>
        </div>
      </div>

      {/* 1. Growth Tactics */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">تکتیک‌های رشد</h2>
            <p className="text-sm text-muted-foreground font-medium">Growth Hacking Strategies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {plan.marketingStrategy.map((tactic: string, i: number) => (
            <Card 
              key={i} 
              variant="default"
              hover="lift"
              className={`cursor-pointer transition-all duration-300 relative overflow-hidden group ${
                expandedTactic === i 
                  ? 'border-primary/50 shadow-xl shadow-primary/5 bg-primary/5 ring-1 ring-primary/20' 
                  : 'card-glass hover:border-primary/20'
              }`}
              onClick={() => setExpandedTactic(expandedTactic === i ? null : i)}
            >
              <div className="flex gap-6 items-start p-2">
                <div className={`
                    w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner transition-colors duration-300
                    ${expandedTactic === i ? 'bg-primary text-white shadow-primary/30' : 'bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'}
                `}>
                  {i + 1}
                </div>
                
                <div className="flex-1 space-y-3 pt-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-foreground leading-snug">
                      {tactic}
                    </h3>
                    
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <ContentGeneratorButton 
                        strategy={tactic} 
                        projectName={plan.projectName} 
                        audience={plan.audience} 
                      />
                    </div>
                  </div>

                  {expandedTactic === i && (
                    <div className="pt-6 border-t border-border/50 animate-in slide-in-from-top-4 fade-in duration-300">
                      <div className="flex items-start gap-3 text-base text-foreground/80 bg-background/50 p-5 rounded-2xl border border-border/50 shadow-sm">
                        <Lightbulb size={24} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="leading-8">
                          <strong>نکته اجرایی:</strong> برای اجرای این تکتیک، ابتدا یک محتوای آزمایشی تولید کنید و در مقیاس کوچک تست کنید. 
                          استفاده از دکمه "تولید محتوا" می‌تواند نقطه شروع خوبی باشد تا ببینید هوش مصنوعی چه پیشنهادی دارد.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. Competitor Analysis Bot */}
      <motion.section variants={itemVariants}>
        <CompetitorAnalyzer />
      </motion.section>

    </motion.div>
  );
}
