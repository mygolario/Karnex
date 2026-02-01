"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Megaphone, TrendingUp, Users, Zap, Lightbulb, Target, Sparkles, BarChart3, Globe, Shield, AlertTriangle, Presentation } from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverExplainer } from "@/components/ui/explainer";
import { LearnMore } from "@/components/ui/learn-more";
import { featureExplanations, getCostLabel, getDifficultyLabel } from "@/lib/knowledge-base";
import { ContentGeneratorButton } from "@/components/dashboard/content-generator-button";

import { MediaKitBuilder } from "@/components/features/media-kit/media-kit-builder";
import { PitchDeckBuilder } from "@/components/features/pitch-deck/pitch-deck-builder";

export default function MarketingPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [expandedTactic, setExpandedTactic] = useState<number | null>(null);

  if (loading || !plan) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center animate-pulse shadow-lg shadow-rose-500/20">
          <Megaphone size={40} className="text-white" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">در حال تدوین استراتژی رشد...</p>
      </div>
    );
  }

  // TRINITY: Render Media Kit Builder for Creators
  if (plan.projectType === 'creator') {
    return (
        <div className="p-6 max-w-7xl mx-auto pb-20 h-[calc(100vh-100px)]">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Sparkles size={24} />
                </div>
                <div>
                   <h1 className="text-3xl font-black text-foreground">مدیا کیت ساز</h1>
                   <p className="text-muted-foreground text-sm">پروفایل حرفه‌ای برای جذب اسپانسر</p>
                </div>
             </div>
             <MediaKitBuilder />
        </div>
    );
  }
  
  // TRINITY: Render Pitch Deck Builder for Startups
  if (plan.projectType === 'startup') {
    return (
        <div className="p-6 max-w-7xl mx-auto pb-20 h-[calc(100vh-100px)]">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <Presentation size={24} />
                </div>
                <div>
                   <h1 className="text-3xl font-black text-foreground">ساخت پیچ دک (Pitch Deck)</h1>
                   <p className="text-muted-foreground text-sm">ارائه استاندارد برای جذب سرمایه‌گذار</p>
                </div>
             </div>
             <PitchDeckBuilder />
        </div>
    );
  }

  // STANDARD / TRADITIONAL VIEW
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-12 pb-20">
      
      {/* Header */}
      <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Megaphone size={24} />
              </div>
              <h1 className="text-3xl font-black text-foreground">بازاریابی و رشد</h1>
              <Badge variant="gradient" size="sm">
                <Sparkles size={12} />
                Actionable
              </Badge>
            </div>
            <p className="text-muted-foreground max-w-lg mt-2">
              موتور جذب کاربر برای <span className="font-bold text-foreground">{plan.projectName}</span>. 
              اینجا استراتژی‌ها به برنامه عملی تبدیل می‌شوند.
            </p>
          </div>
          
          <div className="flex gap-3">
             <div className="text-right hidden md:block">
                <div className="text-xs text-muted-foreground mb-1">مخاطب هدف</div>
                <Badge variant="secondary">{plan.audience}</Badge>
             </div>
          </div>
        </div>
      </div>

      {/* 1. Growth Tactics */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <TrendingUp size={20} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">تکتیک‌های رشد</h2>
            <p className="text-xs text-muted-foreground">Growth Hacking Strategies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {plan.marketingStrategy.map((tactic: string, i: number) => (
            <Card 
              key={i} 
              variant="default"
              hover="lift"
              className={`cursor-pointer border-2 transition-all ${expandedTactic === i ? 'border-primary/20 shadow-md' : 'border-transparent'}`}
              onClick={() => setExpandedTactic(expandedTactic === i ? null : i)}
            >
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 shrink-0 bg-primary/5 text-primary rounded-2xl flex items-center justify-center font-black text-lg">
                  {i + 1}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-foreground leading-snug">
                      {tactic}
                    </h3>
                    
                    <div className="flex items-center gap-2">
                      <ContentGeneratorButton 
                        strategy={tactic} 
                        projectName={plan.projectName} 
                        audience={plan.audience} 
                      />
                    </div>
                  </div>

                  {expandedTactic === i && (
                    <div className="pt-4 border-t border-border animate-in slide-in-from-top-2 p-1">
                      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 p-4 rounded-xl">
                        <Lightbulb size={16} className="text-accent shrink-0 mt-0.5" />
                        <p>
                          نکته اجرایی: برای اجرای این تکتیک، ابتدا یک محتوای آزمایشی تولید کنید و در مقیاس کوچک تست کنید. 
                          استفاده از دکمه "تولید محتوا" می‌تواند نقطه شروع خوبی باشد.
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

      {/* 2. SWOT & Competitors */}
      <section className="grid lg:grid-cols-2 gap-8">
        {/* Competitors List */}
        <div className="space-y-6">
           <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Users size={20} />
            </div>
            <h2 className="text-xl font-bold text-foreground">تحلیل رقبا</h2>
          </div>

          <div className="space-y-4">
            {plan.competitors?.map((comp, idx) => (
              <div key={idx} className="bg-card border border-border p-4 rounded-2xl flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-bold">
                  {comp.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-foreground">{comp.name}</span>
                    <Badge variant="outline" className="text-xs">{comp.channel}</Badge>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      قوت: {comp.strength}
                    </span>
                    <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                      ضعف: {comp.weakness}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            {(!plan.competitors || plan.competitors.length === 0) && (
              <div className="p-8 text-center bg-muted/30 rounded-2xl border border-dashed border-border text-muted-foreground">
                رقیبی یافت نشد.
              </div>
            )}
          </div>
        </div>

        {/* SWOT Visualization (Based on general AI knowledge or mock for now as we don't store SWOT explicitly) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
              <BarChart3 size={20} />
            </div>
            <h2 className="text-xl font-bold text-foreground">تحلیل SWOT</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 h-full">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
               <div className="flex items-center gap-2 text-emerald-700 font-bold mb-2">
                 <Shield size={16} />
                 نقاط قوت
               </div>
               <p className="text-xs text-emerald-900/70 leading-5">
                 • ایده نوآورانه<br/>
                 • هزینه شروع پایین<br/>
                 • انعطاف‌پذیری بالا
               </p>
            </div>
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl">
               <div className="flex items-center gap-2 text-rose-700 font-bold mb-2">
                 <AlertTriangle size={16} />
                 نقاط ضعف
               </div>
               <p className="text-xs text-rose-900/70 leading-5">
                 • منابع محدود<br/>
                 • برند ناشناخته<br/>
                 • تیم کوچک
               </p>
            </div>
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
               <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
                 <Zap size={16} />
                 فرصت‌ها
               </div>
               <p className="text-xs text-blue-900/70 leading-5">
                 • بازار در حال رشد<br/>
                 • نیاز مشتریان<br/>
                 • تکنولوژی جدید
               </p>
            </div>
            <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl">
               <div className="flex items-center gap-2 text-orange-700 font-bold mb-2">
                 <Target size={16} />
                 تهدیدها
               </div>
               <p className="text-xs text-orange-900/70 leading-5">
                 • تغییرات قوانین<br/>
                 • ورود رقبای بزرگ<br/>
                 • تورم اقتصادی
               </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
