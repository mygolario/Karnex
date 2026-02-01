"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { savePlanToCloud, BusinessPlan } from "@/lib/db";
import { AlertTriangle, Lightbulb, Gem, Banknote, LayoutGrid, Sparkles, Info, ArrowUpRight } from "lucide-react";
import { PdfExportButton } from "@/components/dashboard/pdf-export-button";
import { AnalyzerButton } from "@/components/dashboard/analyzer-button";
import { SectionRegenerator } from "@/components/shared/section-regenerator";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverExplainer } from "@/components/ui/explainer";
import { LearnMore } from "@/components/ui/learn-more";
import { canvasExplanations, featureExplanations } from "@/lib/knowledge-base";
import { SWOTAnalysisCanvas } from "@/components/features/canvas/swot-analysis";
import { PersonalBrandCanvas } from "@/components/features/canvas/brand-canvas";

export default function CanvasPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading, updateActiveProject } = useProject();

  const handleSectionUpdate = async (field: keyof BusinessPlan['leanCanvas'], newContent: string) => {
    if (!plan || !user) return;
    
    // Update context immediately
    const updatedLeanCanvas = { ...plan.leanCanvas, [field]: newContent };
    updateActiveProject({ leanCanvas: updatedLeanCanvas });
    
    // Save to DB
    await savePlanToCloud(user.uid, { 
        leanCanvas: updatedLeanCanvas 
    }, true, plan.id || 'current');
  };

  if (loading || !plan) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center animate-pulse shadow-lg shadow-primary/20">
          <LayoutGrid size={40} className="text-white" />
        </div>
        <p className="text-muted-foreground font-medium animate-pulse">در حال بارگذاری بوم استراتژیک...</p>
      </div>
    );
  }

  // --- Specialized Renders ---
  
  if (plan.projectType === 'traditional') {
    return <SWOTAnalysisCanvas />;
  }

  if (plan.projectType === 'creator') {
    return <PersonalBrandCanvas />;
  }

  // --- Default: Lean Canvas (Startup) ---

  const cardConfig = [
    {
      key: 'problem' as const,
      title: "مشکلات مشتری",
      icon: AlertTriangle,
      variant: "accent" as const,
      gradient: "from-amber-500 to-orange-500",
      explanation: canvasExplanations.problem,
      connectedTo: "solution" // visual hint
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
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* Header */}
      <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <LayoutGrid size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-foreground">بوم کسب‌وکار (Lean Canvas)</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">نسخه ۱.۰</Badge>
                  <span className="text-sm text-muted-foreground">استراتژی استارتاپی {plan.projectName}</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground max-w-lg mt-4">
              مناسب برای استارتاپ‌ها: سریع، چابک و متمرکز بر حل مسئله.
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <AnalyzerButton plan={plan} />
            <PdfExportButton plan={plan} />
          </div>
        </div>
      </div>

      {/* Canvas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {cardConfig.map((card, idx) => (
          <Card 
            key={idx} 
            variant="default"
            hover="lift"
            className="group relative overflow-hidden border-2 border-transparent hover:border-primary/5 transition-all duration-300"
            padding="lg"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center text-white shadow-lg shadow-black/5`}>
                  <card.icon size={24} />
                </div>
                <div>
                  <h3 className="font-exrabold text-xl text-foreground flex items-center gap-2">
                    {card.title}
                    <HoverExplainer text={card.explanation.simple} />
                  </h3>
                  <div className="h-1 w-12 rounded-full bg-gradient-to-r from-border to-transparent mt-2" />
                </div>
              </div>
              
              <SectionRegenerator 
                sectionTitle={card.title}
                currentContent={plan.leanCanvas[card.key]}
                onUpdate={(newContent) => handleSectionUpdate(card.key, newContent)}
              />
            </div>
            
            {/* Content Area */}
            <div className="min-h-[120px] bg-muted/30 rounded-2xl p-4 border border-border/50 group-hover:bg-muted/50 transition-colors">
               <p className="text-foreground/80 leading-8 whitespace-pre-wrap text-lg">
                {plan.leanCanvas[card.key]}
              </p>
            </div>

            {/* Footer / Tip */}
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
               <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                 <Info size={14} />
                 <span>مثال: {card.explanation.example.substring(0, 30)}...</span>
               </div>
               
               {card.connectedTo && (
                 <div className="flex items-center gap-1 text-primary/60 font-medium">
                   <span>مرتبط با راه‌حل</span>
                   <ArrowUpRight size={14} />
                 </div>
               )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
