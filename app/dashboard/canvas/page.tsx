"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getPlanFromCloud, savePlanToCloud, BusinessPlan } from "@/lib/db";
import { AlertTriangle, Lightbulb, Gem, Banknote, LayoutGrid, Sparkles } from "lucide-react";
import { PdfExportButton } from "@/components/dashboard/pdf-export-button";
import { SectionRegenerator } from "@/components/shared/section-regenerator";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CanvasPage() {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<BusinessPlan | null>(null);

  useEffect(() => {
    if (user && !authLoading) {
      getPlanFromCloud(user.uid).then(setPlan);
    }
  }, [user, authLoading]);

  const handleSectionUpdate = async (field: keyof BusinessPlan['leanCanvas'], newContent: string) => {
    if (!plan || !user) return;
    
    // Update local state
    const newPlan = {
      ...plan,
      leanCanvas: {
        ...plan.leanCanvas,
        [field]: newContent
      }
    };
    setPlan(newPlan);
    
    // Save to cloud
    await savePlanToCloud(user.uid, { leanCanvas: newPlan.leanCanvas });
  };

  if (!plan) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center animate-pulse">
          <LayoutGrid size={32} className="text-white" />
        </div>
        <p className="text-muted-foreground">در حال بارگذاری بوم کسب‌وکار...</p>
      </div>
    );
  }

  // Define keys explicitly for type safety
  const cardConfig = [
    {
      key: 'problem' as const,
      title: "مشکلات مشتری",
      icon: AlertTriangle,
      variant: "accent" as const,
      gradient: "from-amber-500 to-orange-500"
    },
    {
      key: 'solution' as const,
      title: "راه حل پیشنهادی",
      icon: Lightbulb,
      variant: "primary" as const,
      gradient: "from-primary to-purple-600"
    },
    {
      key: 'uniqueValue' as const,
      title: "ارزش پیشنهادی",
      icon: Gem,
      variant: "secondary" as const,
      gradient: "from-purple-500 to-pink-500"
    },
    {
      key: 'revenueStream' as const,
      title: "جریان درآمدی",
      icon: Banknote,
      variant: "secondary" as const,
      gradient: "from-secondary to-emerald-600"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-black text-foreground">بوم کسب‌وکار</h1>
            <Badge variant="gradient" size="sm">
              <Sparkles size={12} />
              قابل ویرایش
            </Badge>
          </div>
          <p className="text-muted-foreground">نقشه استراتژیک {plan.projectName}</p>
        </div>
        
        {/* The PDF Export Button */}
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
                <h3 className="font-bold text-lg text-foreground">
                  {card.title}
                </h3>
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
            
            <p className="text-muted-foreground leading-8 whitespace-pre-wrap">
              {plan.leanCanvas[card.key]}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
