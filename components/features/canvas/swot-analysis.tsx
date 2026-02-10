"use client";

import { useState } from "react";
import { SWOTAnalysis, saveSWOT } from "@/lib/db";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { Card, CardIcon } from "@/components/ui/card";
import { SectionRegenerator } from "@/components/shared/section-regenerator";
import { HoverExplainer } from "@/components/ui/explainer";
import { ArrowUp, ArrowDown, Zap, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useOfflineStorage } from "@/hooks/use-offline-storage";

export function SWOTAnalysisCanvas() {
  const { user } = useAuth();
  const { activeProject: plan, updateActiveProject } = useProject();

  // Offline Storage Hook
  const { data, setData, isDirty, isSyncing, syncManual } = useOfflineStorage<SWOTAnalysis>(
    `swot-${plan?.id || 'default'}`, 
    plan?.swotAnalysis || {
      strengths: "نقات قوت کسب‌وکار خود را بنویسید...",
      weaknesses: "نقاط ضعف داخلی را بنویسید...",
      opportunities: "فرصت‌های بازار را بنویسید...",
      threats: "تهدیدهای خارجی را بنویسید..."
    },
    async (newData) => {
        if (!user) return;
        await saveSWOT(user.id, newData, plan?.id || 'current');
        updateActiveProject({ swotAnalysis: newData });
    }
  );

  const handleUpdate = (field: keyof SWOTAnalysis, content: string) => {
    setData(prev => ({ ...prev, [field]: content }));
  };

  const sections = [
    {
       key: 'strengths' as const,
       title: "نقاط قوت (Strengths)",
       icon: ArrowUp,
       desc: "ویژگی‌های مثبت داخلی کسب‌وکار شما",
       color: "text-emerald-500",
       bg: "bg-emerald-500/10",
       variant: "success",
       gradient: "from-emerald-500 to-teal-500"
    },
    {
       key: 'weaknesses' as const,
       title: "نقاط ضعف (Weaknesses)",
       icon: ArrowDown,
       desc: "ویژگی‌های منفی داخلی که نیاز به بهبود دارند",
       color: "text-rose-500",
       bg: "bg-rose-500/10",
       variant: "danger",
       gradient: "from-rose-500 to-red-500"
    },
    {
       key: 'opportunities' as const,
       title: "فرصت‌ها (Opportunities)",
       icon: Zap,
       desc: "عوامل بیرونی که می‌توانید از آنها بهره ببرید",
       color: "text-amber-500",
       bg: "bg-amber-500/10",
       variant: "accent",
       gradient: "from-amber-500 to-orange-500"
    },
    {
       key: 'threats' as const,
       title: "تهدیدها (Threats)",
       icon: ShieldAlert,
       desc: "عوامل بیرونی که ممکن است به شما آسیب بزنند",
       color: "text-slate-500",
       bg: "bg-slate-500/10",
       variant: "secondary",
       gradient: "from-slate-500 to-gray-600"
    }
  ];

  return (
    <div className="space-y-6">
        <div className="bg-card border border-border p-6 rounded-3xl flex justify-between items-center">
            <div>
                <h2 className="text-2xl font-black mb-2 flex items-center gap-2">
                    <span className="text-primary">SWOT</span>
                    <span>تحلیل استراتژیک</span>
                </h2>
                <p className="text-muted-foreground">
                    برای کسب‌وکارهای سنتی و فیزیکی، شناخت محیط داخلی و خارجی حیاتی است.
                </p>
            </div>
            {isSyncing && <span className="text-xs text-muted-foreground animate-pulse">در حال ذخیره...</span>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section) => (
                <Card 
                    key={section.key} 
                    variant="default"
                    className="group border-2 border-transparent hover:border-primary/10 transition-all overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${section.bg} ${section.color} flex items-center justify-center`}>
                                <section.icon size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">{section.title}</h3>
                                <p className="text-xs text-muted-foreground">{section.desc}</p>
                            </div>
                        </div>
                         <SectionRegenerator 
                            sectionTitle={section.title}
                            currentContent={data[section.key]}
                            onUpdate={(val) => handleUpdate(section.key, val)}
                        />
                    </div>
                    
                    <div className="bg-muted/30 rounded-xl min-h-[150px] relative">
                        <textarea
                            className="w-full h-full min-h-[150px] bg-transparent border-none focus:ring-0 p-4 resize-none leading-relaxed text-sm"
                            value={data[section.key]}
                            onChange={(e) => handleUpdate(section.key, e.target.value)}
                            placeholder="اینجا بنویسید..."
                        />
                    </div>
                </Card>
            ))}
        </div>
    </div>
  );
}
