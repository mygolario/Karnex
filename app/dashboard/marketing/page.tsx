"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { getPlanFromCloud, BusinessPlan } from "@/lib/db";
import { Megaphone, TrendingUp, Users, Instagram, Globe, MapPin, Sparkles, Target, Zap, Lightbulb, HelpCircle, DollarSign, Clock } from "lucide-react";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverExplainer } from "@/components/ui/explainer";
import { LearnMore } from "@/components/ui/learn-more";
import { featureExplanations, marketingExplanations, getCostLabel, getDifficultyLabel } from "@/lib/knowledge-base";

export default function MarketingPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();
  const [expandedTactic, setExpandedTactic] = useState<number | null>(null);

  if (loading || !plan) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center animate-pulse">
          <Megaphone size={32} className="text-white" />
        </div>
        <p className="text-muted-foreground">در حال تدوین استراتژی...</p>
      </div>
    );
  }

  // Function to get marketing explanation if available
  const getMarketingExplanation = (tactic: string) => {
    const lowerTactic = tactic.toLowerCase();
    if (lowerTactic.includes("محتوا") || lowerTactic.includes("پست")) {
      return marketingExplanations["content"];
    }
    if (lowerTactic.includes("اینفلوئنسر") || lowerTactic.includes("بلاگر")) {
      return marketingExplanations["influencer"];
    }
    if (lowerTactic.includes("معرفی") || lowerTactic.includes("تخفیف")) {
      return marketingExplanations["referral"];
    }
    return null;
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-10">
      
      {/* Feature Explanation Banner */}
      <LearnMore title="بازاریابی چیست؟" variant="primary">
        <p className="text-muted-foreground text-sm leading-7 mb-3">
          {featureExplanations.marketing.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lightbulb size={14} className="text-primary" />
          نکته: روی هر تکتیک کلیک کنید تا مراحل اجرا و هزینه تخمینی را ببینید!
        </div>
      </LearnMore>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-black text-foreground">بازاریابی و رشد</h1>
          <Badge variant="gradient" size="sm">
            <Sparkles size={12} />
            هوشمند
          </Badge>
          <HoverExplainer text="این استراتژی‌ها بر اساس نوع کسب‌وکار و مخاطب شما پیشنهاد شده‌اند" />
        </div>
        <p className="text-muted-foreground">
          موتور جذب مشتری برای: <span className="font-bold text-foreground">{plan.projectName}</span>
        </p>
      </div>

      {/* 1. Growth Tactics */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CardIcon variant="primary" className="w-10 h-10">
            <TrendingUp size={20} />
          </CardIcon>
          <span className="font-bold text-sm uppercase tracking-wider">استراتژی‌های رشد (Growth Hacking)</span>
          <HoverExplainer text="روش‌های کم‌هزینه برای رشد سریع کسب‌وکار" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.marketingStrategy.map((tactic: string, i: number) => {
            const explanation = getMarketingExplanation(tactic);
            const isExpanded = expandedTactic === i;
            
            return (
              <Card 
                key={i} 
                variant="default"
                hover="lift"
                className="cursor-pointer"
                onClick={() => setExpandedTactic(isExpanded ? null : i)}
              >
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">
                      {i + 1}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-foreground">تکتیک شماره {i + 1}</h4>
                      {i === 0 && (
                        <Badge variant="accent" size="sm">
                          <Zap size={10} />
                          پیشنهادی
                        </Badge>
                      )}
                      {explanation && (
                        <>
                          <Badge variant="muted" size="sm" className="gap-1">
                            <DollarSign size={10} />
                            {getCostLabel(explanation.cost)}
                          </Badge>
                          <Badge variant="muted" size="sm" className="gap-1">
                            {explanation.difficulty === "easy" ? "🟢" : "🟡"}
                            {getDifficultyLabel(explanation.difficulty)}
                          </Badge>
                        </>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">{tactic}</p>

                    {/* Expanded Content */}
                    {isExpanded && explanation && (
                      <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
                        <p className="text-muted-foreground text-sm mb-4">{explanation.description}</p>
                        
                        <div className="bg-muted/50 rounded-lg p-4">
                          <h5 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                            <Zap size={14} className="text-primary" />
                            چطور اجرا کنم؟
                          </h5>
                          <ol className="space-y-2">
                            {explanation.howTo.map((step, j) => (
                              <li key={j} className="flex gap-3 text-sm text-muted-foreground">
                                <span className="w-5 h-5 shrink-0 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                                  {j + 1}
                                </span>
                                {step}
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}

                    {isExpanded && !explanation && (
                      <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Lightbulb size={14} className="text-accent" />
                          برای اجرای این تکتیک از دستیار هوشمند (گوشه پایین صفحه) کمک بگیرید!
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* 2. Competitors */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CardIcon variant="secondary" className="w-10 h-10">
            <Users size={20} />
          </CardIcon>
          <span className="font-bold text-sm uppercase tracking-wider">تحلیل رقبا</span>
          <Badge variant="info" size="sm">Dynamic</Badge>
          <HoverExplainer text="شناخت رقبا به شما کمک می‌کند نقاط ضعف آن‌ها را هدف قرار دهید" />
        </div>

        {/* Competitor Analysis Explanation */}
        <LearnMore title="چرا تحلیل رقبا مهم است؟" variant="secondary">
          <p className="text-muted-foreground text-sm leading-7 mb-3">
            با شناخت رقبا می‌فهمید چه کسانی در بازار فعال هستند، نقاط قوت و ضعفشان چیست، و چطور می‌توانید متفاوت باشید. 
            نیازی نیست همه را شکست دهید - فقط یک مزیت منحصربه‌فرد کافی است!
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lightbulb size={14} className="text-secondary" />
            نکته: روی نقاط ضعف رقبا تمرکز کنید و مزیت خود را حول آن بسازید.
          </div>
        </LearnMore>
        
        <Card variant="default" padding="none" className="overflow-hidden">
          <table className="w-full text-right">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="p-4 font-bold text-foreground text-sm">نوع رقیب</th>
                <th className="p-4 font-bold text-foreground text-sm">
                  نقاط قوت
                  <HoverExplainer text="چیزی که رقیب در آن خوب است" className="mr-2" />
                </th>
                <th className="p-4 font-bold text-foreground text-sm">
                  نقاط ضعف
                  <HoverExplainer text="فرصت شما! جایی که می‌توانید بهتر باشید" className="mr-2" />
                </th>
                <th className="p-4 font-bold text-foreground text-sm">کانال اصلی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {plan.competitors?.map((comp, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center text-muted-foreground">
                        <Target size={16} />
                      </div>
                      <span className="font-bold text-foreground">{comp.name}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-secondary bg-secondary/10 px-2 py-1 rounded-lg">
                      {comp.strength}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="text-sm text-destructive bg-destructive/10 px-2 py-1 rounded-lg">
                      {comp.weakness}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      {comp.channel.includes('اینستا') ? (
                        <Instagram size={14} className="text-pink-500" />
                      ) : comp.channel.includes('سایت') || comp.channel.includes('اپلیکیشن') ? (
                        <Globe size={14} className="text-primary" />
                      ) : (
                        <MapPin size={14} className="text-accent" />
                      )}
                      {comp.channel}
                    </div>
                  </td>
                </tr>
              ))}

              {(!plan.competitors || plan.competitors.length === 0) && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground text-sm">
                    داده‌های رقبا برای این پروژه موجود نیست. (پروژه قدیمی)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Bottom Tips */}
      <Card variant="muted" className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
          <Lightbulb size={24} />
        </div>
        <div>
          <h3 className="font-bold text-foreground mb-1">شروع کنید!</h3>
          <p className="text-sm text-muted-foreground">
            نیازی نیست همه این کارها را همزمان انجام دهید. اول یک تکتیک را انتخاب کنید و تا جایی که می‌توانید تمرکز کنید. 
            وقتی نتیجه گرفتید، سراغ تکتیک بعدی بروید.
          </p>
        </div>
      </Card>
    </div>
  );
}
