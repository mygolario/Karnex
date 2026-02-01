"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { savePlanToCloud, CanvasCard, CanvasSectionContent, LeanCanvas } from "@/lib/db";
import {
  AlertTriangle, Lightbulb, Gem, Banknote, Users, Activity,
  Package, Handshake, PiggyBank, LayoutGrid,
  Sparkles, Loader2, Info, ArrowUpRight, Plus, Rocket
} from "lucide-react";
import { PdfExportButton } from "@/components/dashboard/pdf-export-button";
import { AnalyzerButton } from "@/components/dashboard/analyzer-button";
import { SectionRegenerator } from "@/components/shared/section-regenerator";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverExplainer } from "@/components/ui/explainer";
import { canvasExplanations } from "@/lib/knowledge-base";
import { SWOTAnalysisCanvas } from "@/components/features/canvas/swot-analysis";
import { PersonalBrandCanvas } from "@/components/features/canvas/brand-canvas";
import { Button } from "@/components/ui/button";

// ID generator
const generateId = () => `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

type CanvasState = Record<keyof LeanCanvas, CanvasCard[]>;

const sectionColors: Record<string, CanvasCard['color']> = {
  keyPartners: 'cyan',
  keyActivities: 'blue',
  keyResources: 'purple',
  uniqueValue: 'pink',
  problem: 'yellow',
  solution: 'green',
  customerSegments: 'purple',
  revenueStream: 'green',
  costStructure: 'pink',
};

const mapContentToCards = (content: CanvasSectionContent | undefined, color: CanvasCard['color']): CanvasCard[] => {
  if (!content) return [];
  if (Array.isArray(content)) return content;
  if (typeof content === 'string' && content.trim()) {
    return content.split(/\n|•|- /).map(l => l.trim()).filter(l => l).map(text => ({
      id: generateId(),
      content: text,
      color
    }));
  }
  return [];
};

type CanvasBlockKey = keyof LeanCanvas;

const CANVAS_FIELDS: CanvasBlockKey[] = [
  'problem', 'solution', 'uniqueValue', 'unfairAdvantage', 
  'customerSegments', 'keyMetrics', 'channels', 
  'costStructure', 'revenueStream'
];

// Extended sections meta-data
const SECTIONS: Record<string, { title: string; icon: React.ElementType; iconColor: string; description: string; gridClass: string }> = {
  keyPartners: { title: "شرکای کلیدی", icon: Handshake, iconColor: "text-cyan-500", description: "چه کسانی به شما کمک می‌کنند؟", gridClass: "col-span-1" },
  keyActivities: { title: "فعالیت‌های کلیدی", icon: Activity, iconColor: "text-blue-500", description: "چه کارهایی باید انجام دهید؟", gridClass: "col-span-1" },
  keyResources: { title: "منابع کلیدی", icon: Package, iconColor: "text-indigo-500", description: "چه دارایی‌هایی نیاز دارید؟", gridClass: "col-span-1" },
  uniqueValue: { title: "ارزش پیشنهادی", icon: Gem, iconColor: "text-pink-500", description: "چرا شما خاص هستید؟", gridClass: "md:col-span-2 row-span-2" },
  problem: { title: "مشکلات", icon: AlertTriangle, iconColor: "text-amber-500", description: "مشتریان چه دردی دارند؟", gridClass: "md:col-span-2" },
  solution: { title: "راه‌حل‌ها", icon: Lightbulb, iconColor: "text-emerald-500", description: "چطور مشکل را حل می‌کنید؟", gridClass: "md:col-span-2" },
  customerSegments: { title: "بخش‌های مشتریان", icon: Users, iconColor: "text-purple-500", description: "برای چه کسانی ارزش خلق می‌کنید؟", gridClass: "md:col-span-2" },
  channels: { title: "کانال‌ها", icon: ArrowUpRight, iconColor: "text-orange-500", description: "چطور به مشتری می‌رسید؟", gridClass: "col-span-1" },
  keyMetrics: { title: "سنجش‌های کلیدی", icon: Activity, iconColor: "text-teal-500", description: "چطور پیشرفت را اندازه می‌گیرید؟", gridClass: "col-span-1" },
  costStructure: { title: "ساختار هزینه‌ها", icon: PiggyBank, iconColor: "text-rose-500", description: "هزینه‌های اصلی شما چیست؟", gridClass: "md:col-span-3" },
  revenueStream: { title: "جریان‌های درآمدی", icon: Banknote, iconColor: "text-green-600", description: "از چه راه‌هایی پول در می‌آورید؟", gridClass: "md:col-span-3" },
  unfairAdvantage: { title: "مزیت رقابتی", icon: Sparkles, iconColor: "text-yellow-500", description: "چه چیزی دارید که دیگران ندارند؟", gridClass: "col-span-1" }
};

export default function CanvasPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading, updateActiveProject } = useProject();
  const [items, setItems] = useState<CanvasState>({} as CanvasState);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize from plan
  useEffect(() => {
    if (plan?.leanCanvas) {
      const state = {} as CanvasState;
      // Map all possible fields
      Object.keys(SECTIONS).forEach(key => {
        const k = key as CanvasBlockKey;
        state[k] = mapContentToCards(plan.leanCanvas[k], sectionColors[k] || 'yellow');
      });
      setItems(state);
    }
  }, [plan?.id]);

  // Persist changes
  const save = async (data: CanvasState) => {
    if (!plan || !user) return;
    const canvas: any = { ...plan.leanCanvas };
    (Object.keys(data) as CanvasBlockKey[]).forEach(k => { canvas[k] = data[k]; });
    updateActiveProject({ leanCanvas: canvas });
    await savePlanToCloud(user.uid, { leanCanvas: canvas }, true, plan.id || 'current');
  };

  const addCard = (field: CanvasBlockKey) => {
    const card: CanvasCard = {
      id: generateId(),
      content: "یادداشت جدید",
      color: sectionColors[field] || 'yellow'
    };
    const updatedItems = {
      ...items,
      [field]: [...(items[field] || []), card]
    };
    setItems(updatedItems);
    save(updatedItems);
  };

  const updateCard = (id: string, content: string) => {
    // Helper to find container
    const findContainer = (id: string) => (Object.keys(items) as CanvasBlockKey[]).find(k => items[k]?.some(item => item.id === id));
    
    const container = findContainer(id);
    if (!container) return;
    const updatedItems = {
      ...items,
      [container]: items[container].map(i => i.id === id ? { ...i, content } : i)
    };
    setItems(updatedItems);
    save(updatedItems);
  };

  const deleteCard = (id: string) => {
     const findContainer = (id: string) => (Object.keys(items) as CanvasBlockKey[]).find(k => items[k]?.some(item => item.id === id));
     
    const container = findContainer(id);
    if (!container) return;
    const updatedItems = {
      ...items,
      [container]: items[container].filter(i => i.id !== id)
    };
    setItems(updatedItems);
    save(updatedItems);
  };
  
  const handleSectionUpdate = (key: string, newContent: string) => {
      // For regeneration update
      const cards = mapContentToCards(newContent, sectionColors[key] || 'yellow');
      const updatedItems = { ...items, [key]: cards };
      setItems(updatedItems);
      save(updatedItems);
  };

  if (loading || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // --- Specialized Renders ---
  if (plan.projectType === 'traditional') return <SWOTAnalysisCanvas />;
  if (plan.projectType === 'creator') return <PersonalBrandCanvas />;

  // --- Default: Lean Canvas ---
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
               <LayoutGrid size={28} />
             </div>
             <div>
               <h1 className="text-3xl font-black text-foreground">بوم مدل کسب‌وکار</h1>
               <p className="text-muted-foreground mt-1">طراحی بیزینس مدل {plan.projectName}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <AnalyzerButton plan={plan} />
             <PdfExportButton plan={plan} />
          </div>
        </div>
      </div>

      {/* Canvas Grid */}
      <div id="lean-canvas" className="grid grid-cols-1 md:grid-cols-6 gap-6">
         {/* Define the Layout manually for Lean Canvas Structure */}
         
         {/* Row 1: Problem (2) | Solution (2) | Key Metrics (1) | Unique Value (2, RowSpan 2) ?? No, Lean Canvas layout is tricky. */}
         {/* Standard Lean Canvas: 
             Left: Problem (Top), Existing Alt (Bottom)
             Left-Mid: Solution (Top), Key Metrics (Bottom)
             Center: Value Prop (Full Height)
             Right-Mid: Unfair Advantage (Top), Channels (Bottom)
             Right: Customer Segments (Top), Early Adopters (Bottom)
             Bottom: Cost (Half), Revenue (Half)
         */}
         
         {/* Simplified Grid Flow for now based on SECTIONS */}
         {Object.entries(SECTIONS).map(([key, config]) => {
           const sectionKey = key as CanvasBlockKey;
           const cards = items[sectionKey] || [];
           
           // map gridClass to tailwind
           // We'll just use a smart grid layout
           
           return (
             <Card key={key} className={`p-5 flex flex-col gap-4 relative group hover:border-primary/30 transition-all ${config.gridClass}`}>
                <div className="flex items-start justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted/50 ${config.iconColor}`}>
                         <config.icon size={18} />
                      </div>
                      <div>
                         <h3 className="font-bold text-foreground">{config.title}</h3>
                         <p className="text-xs text-muted-foreground line-clamp-1">{config.description}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <HoverExplainer title={config.title} description={(canvasExplanations as any)[key] || config.description}>
                         <Button variant="ghost" size="icon" className="h-7 w-7"><Info size={14} /></Button>
                      </HoverExplainer>
                      <SectionRegenerator 
                         sectionTitle={config.title}
                         currentContent={cards.map(c => c.content).join('\n')} 
                         onUpdate={(c) => handleSectionUpdate(key, c)} 
                      />
                   </div>
                </div>
                
                <div className="space-y-3 min-h-[120px]">
                   {cards.map((card) => (
                      <div key={card.id} className="bg-muted/30 p-3 rounded-xl text-sm border border-transparent hover:border-border group/card relative">
                         <textarea
                            className="bg-transparent w-full resize-none outline-none text-foreground"
                            value={card.content}
                            onChange={(e) => updateCard(card.id, e.target.value)}
                            rows={Math.max(2, Math.ceil(card.content.length / 40))}
                         />
                         <button 
                            onClick={() => deleteCard(card.id)}
                            className="absolute top-2 left-2 text-destructive opacity-0 group-hover/card:opacity-100 transition-opacity text-xs"
                         >
                            حذف
                         </button>
                      </div>
                   ))}
                   
                   <Button variant="ghost" className="w-full border-dashed border-2 border-muted hover:border-primary/50 text-muted-foreground" onClick={() => addCard(sectionKey)}>
                      <Plus size={16} className="mr-2" /> افزودن
                   </Button>
                </div>
             </Card>
           )
         })}
      </div>
    </div>
  );
}
