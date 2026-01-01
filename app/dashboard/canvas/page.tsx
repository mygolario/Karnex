"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { getPlanFromCloud, savePlanToCloud, BusinessPlan } from "@/lib/db";
import { AlertTriangle, Lightbulb, Gem, Banknote, LayoutGrid, Sparkles, HelpCircle, Info } from "lucide-react";
import { PdfExportButton } from "@/components/dashboard/pdf-export-button";
import { SectionRegenerator } from "@/components/shared/section-regenerator";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverExplainer } from "@/components/ui/explainer";
import { LearnMore } from "@/components/ui/learn-more";
import { canvasExplanations, featureExplanations } from "@/lib/knowledge-base";

export default function CanvasPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading } = useProject();

  const handleSectionUpdate = async (field: keyof BusinessPlan['leanCanvas'], newContent: string) => {
    if (!plan || !user) return;
    
    await savePlanToCloud(user.uid, { 
        leanCanvas: { ...plan.leanCanvas, [field]: newContent } 
    }, true, plan.id || 'current');
  };

  if (loading || !plan) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center animate-pulse">
          <LayoutGrid size={32} className="text-white" />
        </div>
        <p className="text-muted-foreground">در حال بارگذاری بوم کسب‌وکار...</p>
      </div>
    );
  }

  const cardConfig = [
    {
      key: 'problem' as const,
      title: "مشکلات مشتری",
      icon: AlertTriangle,
      variant: "accent" as const,
      gradient: "from-amber-500 to-orange-500",
      explanation: canvasExplanations.problem
    },
    {
      key: 'solution' as const,
      title: "راه حل پیشنهادی",
      icon: Lightbulb,
      variant: "primary" as const,
      gradient: "from-primary to-purple-600",
      explanation: canvasExplanations.solution
    },
    {
      key: 'uniqueValue' as const,
      title: "ارزش پیشنهادی",
      icon: Gem,
      variant: "secondary" as const,
      gradient: "from-purple-500 to-pink-500",
      explanation: canvasExplanations.uniqueValue
    },
    {
      key: 'revenueStream' as const,
      title: "جریان درآمدی",
      icon: Banknote,
      variant: "secondary" as const,
      gradient: "from-secondary to-emerald-600",
      explanation: canvasExplanations.revenueStream
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Feature Explanation Banner */}
      <LearnMore title="بوم کسب‌وکار چیست؟" variant="primary">
        <p className="text-muted-foreground text-sm leading-7 mb-3">
          {featureExplanations.canvas.description}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lightbulb size={14} className="text-primary" />
          نکته: ماوس را روی عنوان هر بخش نگه دارید تا توضیحات آن را ببینید!
        </div>
      </LearnMore>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-black text-foreground">بوم کسب‌وکار</h1>
            <Badge variant="gradient" size="sm">
              <Sparkles size={12} />
              قابل ویرایش
            </Badge>
            <HoverExplainer text="این بخش خلاصه‌ای از کل مدل کسب‌وکار شماست. می‌توانید هر بخش را ویرایش کنید." />
          </div>
          <p className="text-muted-foreground">نقشه استراتژیک {plan.projectName}</p>
        </div>
        
        <PdfExportButton plan={plan} />
      </div>

      {/* Canvas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cardConfig.map((card, idx) => (
          <Card 
            key={idx} 
            variant="default"
            hover="lift"
            className="group relative overflow-hidden"
          >
            {/* Gradient Top Border */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient}`} />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CardIcon variant={card.variant} className="shadow-lg">
                  <card.icon size={20} />
                </CardIcon>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-foreground">
                    {card.title}
                  </h3>
                  <HoverExplainer text={card.explanation.simple} />
                </div>
              </div>
              
              {/* AI Regenerator */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <SectionRegenerator 
                  sectionTitle={card.title}
                  currentContent={plan.leanCanvas[card.key]}
                  onUpdate={(newContent) => handleSectionUpdate(card.key, newContent)}
                />
              </div>
            </div>
            
            {/* Content */}
            <p className="text-muted-foreground leading-8 whitespace-pre-wrap mb-4">
              {plan.leanCanvas[card.key]}
            </p>

            {/* Expandable Explanation */}
            <div className="border-t border-border pt-4 mt-4">
              <LearnMore title="این بخش چیست؟" variant="muted">
                <div className="space-y-3">
                  <p className="text-muted-foreground text-sm leading-7">
                    {card.explanation.detailed}
                  </p>
                  
                  {/* Example */}
                  <div className="bg-muted/50 rounded-lg p-3 border border-border">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Info size={12} className="text-primary" />
                      مثال:
                    </div>
                    <p className="text-sm text-foreground">{card.explanation.example}</p>
                  </div>
                </div>
              </LearnMore>
            </div>
          </Card>
        ))}
      </div>

      {/* Bottom Tips */}
      <Card variant="muted" className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
          <Lightbulb size={24} />
        </div>
        <div>
          <h3 className="font-bold text-foreground mb-1">نکته مهم</h3>
          <p className="text-sm text-muted-foreground">
            بوم کسب‌وکار یک سند زنده است! با پیشرفت کار و یادگیری بیشتر درباره مشتریان، برگردید و این بخش‌ها را به‌روزرسانی کنید. 
            برای ویرایش، روی دکمه جادویی (✨) هر بخش کلیک کنید.
          </p>
        </div>
      </Card>
    </div>
  );
}
