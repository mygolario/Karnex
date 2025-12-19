"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getPlanFromCloud, savePlanToCloud, BusinessPlan } from "@/lib/db";
import { AlertTriangle, Lightbulb, Gem, Banknote } from "lucide-react";
import { PdfExportButton } from "@/components/dashboard/pdf-export-button";
import { SectionRegenerator } from "@/components/shared/section-regenerator";

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

  if (!plan) return <div className="p-12 text-center text-slate-400">در حال بارگذاری بوم کسب‌وکار...</div>;

  // Define keys explicitly for type safety
  const cardConfig = [
    {
      key: 'problem' as const,
      title: "مشکلات مشتری",
      icon: AlertTriangle,
      color: "text-amber-500",
      bg: "bg-amber-50",
      border: "border-amber-200"
    },
    {
      key: 'solution' as const,
      title: "راه حل پیشنهادی",
      icon: Lightbulb,
      color: "text-blue-500",
      bg: "bg-blue-50",
      border: "border-blue-200"
    },
    {
      key: 'uniqueValue' as const,
      title: "ارزش پیشنهادی",
      icon: Gem,
      color: "text-purple-500",
      bg: "bg-purple-50",
      border: "border-purple-200"
    },
    {
      key: 'revenueStream' as const,
      title: "جریان درآمدی",
      icon: Banknote,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      border: "border-emerald-200"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">بوم کسب‌وکار</h1>
          <p className="text-slate-500">نقشه استراتژیک {plan.projectName}</p>
        </div>
        
        {/* The PDF Export Button */}
        <PdfExportButton plan={plan} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        {cardConfig.map((card, idx) => (
          <div 
            key={idx} 
            className={`p-6 rounded-2xl border ${card.border} ${card.bg} relative group transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 bg-white rounded-lg shadow-sm ${card.color}`}>
                  <card.icon size={24} />
                </div>
                <h3 className={`font-bold text-lg ${card.color.replace('text', 'text-slate')}`}>
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
            
            <p className="text-slate-700 leading-8 whitespace-pre-wrap">
              {plan.leanCanvas[card.key]}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
