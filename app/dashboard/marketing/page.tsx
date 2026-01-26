"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Megaphone, TrendingUp, Lightbulb, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContentGeneratorButton } from "@/components/dashboard/content-generator-button";
import { CompetitorAnalyzer } from "@/components/dashboard/competitor-analyzer";
import { MarketingScore } from "@/components/dashboard/marketing/marketing-score";
import { MarketingFunnel } from "@/components/dashboard/marketing/marketing-funnel";
import { ChannelCards } from "@/components/dashboard/marketing/channel-cards";
import { ContentCalendar } from "@/components/dashboard/marketing/content-calendar";
import { CampaignBuilder } from "@/components/dashboard/marketing/campaign-builder";

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
        <div className="grid md:grid-cols-2 gap-4 w-full">
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-48 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="max-w-[1400px] mx-auto space-y-8 pb-20"
    >

      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-600 via-orange-600 to-amber-500 text-white shadow-2xl shadow-rose-500/20"
      >
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 bg-center" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-300/30 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shadow-inner border border-white/20">
                <Megaphone size={32} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-1">مرکز فرماندهی بازاریابی</h1>
                <p className="text-white/70 text-sm">Marketing Command Center</p>
              </div>
            </div>
            <p className="text-white/90 max-w-xl text-base leading-relaxed">
              تمام ابزارهای بازاریابی <span className="font-bold text-white">{plan.projectName}</span> در یک‌جا.
              از تحلیل رقبا تا تولید محتوا و ساخت کمپین.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="glass px-5 py-3 rounded-xl border-white/10">
              <div className="text-xs text-white/70 mb-1 uppercase tracking-wider font-medium">مخاطب هدف</div>
              <Badge variant="secondary" className="text-sm py-1 px-3 bg-white text-rose-600 hover:bg-white/90">{plan.audience}</Badge>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dashboard Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Marketing Score */}
        <motion.div variants={itemVariants}>
          <MarketingScore />
        </motion.div>

        {/* Marketing Funnel */}
        <motion.div variants={itemVariants}>
          <MarketingFunnel />
        </motion.div>

        {/* Channel Cards */}
        <motion.div variants={itemVariants}>
          <ChannelCards />
        </motion.div>

        {/* Content Calendar */}
        <motion.div variants={itemVariants}>
          <ContentCalendar />
        </motion.div>
      </div>

      {/* Campaign Builder - Full Width */}
      <motion.div variants={itemVariants}>
        <CampaignBuilder />
      </motion.div>

      {/* Growth Tactics */}
      <motion.section variants={itemVariants} className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <TrendingUp size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">تکتیک‌های رشد</h2>
            <p className="text-sm text-muted-foreground font-medium">Growth Hacking Strategies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {plan.marketingStrategy.map((tactic: string, i: number) => (
            <Card
              key={i}
              variant="default"
              hover="lift"
              className={`cursor-pointer transition-all duration-300 relative overflow-hidden group ${expandedTactic === i
                  ? 'border-primary/50 shadow-xl shadow-primary/5 bg-primary/5 ring-1 ring-primary/20'
                  : 'card-glass hover:border-primary/20'
                }`}
              onClick={() => setExpandedTactic(expandedTactic === i ? null : i)}
            >
              <div className="flex gap-5 items-start p-2">
                <div className={`
                    w-12 h-12 shrink-0 rounded-xl flex items-center justify-center font-black text-lg shadow-inner transition-colors duration-300
                    ${expandedTactic === i ? 'bg-primary text-white shadow-primary/30' : 'bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10'}
                `}>
                  {i + 1}
                </div>

                <div className="flex-1 space-y-3 pt-0.5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-foreground leading-snug">
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
                    <div className="pt-4 border-t border-border/50 animate-in slide-in-from-top-4 fade-in duration-300">
                      <div className="flex items-start gap-3 text-sm text-foreground/80 bg-background/50 p-4 rounded-xl border border-border/50">
                        <Lightbulb size={20} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="leading-7">
                          <strong>نکته اجرایی:</strong> برای اجرای این تکتیک، ابتدا یک محتوای آزمایشی تولید کنید و در مقیاس کوچک تست کنید.
                          از دکمه "تولید محتوا" برای دریافت ایده استفاده کنید.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.section>

      {/* Competitor Analyzer */}
      <motion.section variants={itemVariants}>
        <CompetitorAnalyzer />
      </motion.section>

    </motion.div>
  );
}
