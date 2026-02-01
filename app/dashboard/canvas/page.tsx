"use client";

import { useState, useEffect } from "react";
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  MeasuringStrategy
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { savePlanToCloud, CanvasCard, CanvasSectionContent, LeanCanvas } from "@/lib/db";
import {
  AlertTriangle, Lightbulb, Gem, Banknote, Users, Activity,
  Package, Handshake, PiggyBank, LayoutGrid,
  Sparkles, Loader2, FileDown
} from "lucide-react";
import { PdfExportButton } from "@/components/dashboard/pdf-export-button";
<<<<<<< HEAD
import { CanvasColumn } from "@/components/canvas/canvas-column";
import { NoteCard } from "@/components/canvas/note-card";
import { GenerationLoader } from "@/components/shared/generation-loader";
import "./canvas.css";

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
  'keyPartners', 'keyActivities', 'keyResources', 'uniqueValue',
  'customerSegments', 'problem', 'solution', 'revenueStream', 'costStructure'
];

const SECTIONS: Record<CanvasBlockKey, { title: string; icon: React.ElementType; iconColor: string; gridClass: string }> = {
  keyPartners: { title: "شرکای کلیدی", icon: Handshake, iconColor: "icon-slate", gridClass: "grid-partners" },
  keyActivities: { title: "فعالیت‌های کلیدی", icon: Activity, iconColor: "icon-blue", gridClass: "grid-activities" },
  keyResources: { title: "منابع کلیدی", icon: Package, iconColor: "icon-indigo", gridClass: "grid-resources" },
  uniqueValue: { title: "ارزش پیشنهادی", icon: Gem, iconColor: "icon-rose", gridClass: "grid-value" },
  problem: { title: "مشکلات", icon: AlertTriangle, iconColor: "icon-amber", gridClass: "grid-problems" },
  solution: { title: "راه‌حل‌ها", icon: Lightbulb, iconColor: "icon-emerald", gridClass: "grid-solutions" },
  customerSegments: { title: "بخش‌های مشتریان", icon: Users, iconColor: "icon-violet", gridClass: "grid-customers" },
  costStructure: { title: "ساختار هزینه‌ها", icon: PiggyBank, iconColor: "icon-red", gridClass: "grid-costs" },
  revenueStream: { title: "جریان‌های درآمدی", icon: Banknote, iconColor: "icon-green", gridClass: "grid-revenue" }
};
=======
import { AnalyzerButton } from "@/components/dashboard/analyzer-button";
import { SectionRegenerator } from "@/components/shared/section-regenerator";
import { Card, CardIcon } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverExplainer } from "@/components/ui/explainer";
import { LearnMore } from "@/components/ui/learn-more";
import { canvasExplanations, featureExplanations } from "@/lib/knowledge-base";
import { SWOTAnalysisCanvas } from "@/components/features/canvas/swot-analysis";
import { PersonalBrandCanvas } from "@/components/features/canvas/brand-canvas";
>>>>>>> Karnex-Completion

export default function CanvasPage() {
  const { user } = useAuth();
  const { activeProject: plan, loading, updateActiveProject } = useProject();
  const [items, setItems] = useState<CanvasState>({} as CanvasState);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize from plan
  useEffect(() => {
    if (plan?.leanCanvas) {
      const state = {} as CanvasState;
      CANVAS_FIELDS.forEach(f => {
        state[f] = mapContentToCards(plan.leanCanvas[f], sectionColors[f] || 'yellow');
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

  // Sensors with better activation
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const findContainer = (id: string): CanvasBlockKey | undefined => {
    if (id in items) return id as CanvasBlockKey;
    return (Object.keys(items) as CanvasBlockKey[]).find(k =>
      items[k]?.some(item => item.id === id)
    );
  };

  const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e;
    if (!over) return;

    const activeContainer = findContainer(active.id as string);
    const overContainer = findContainer(over.id as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    const activeItems = items[activeContainer];
    const overItems = items[overContainer];
    const activeIdx = activeItems.findIndex(i => i.id === active.id);
    const overIdx = overItems.findIndex(i => i.id === over.id);

    const newIndex = over.id in items
      ? overItems.length
      : (overIdx >= 0 ? overIdx : overItems.length);

    const newActiveItems = activeItems.filter(i => i.id !== active.id);
    const newOverItems = [
      ...overItems.slice(0, newIndex),
      activeItems[activeIdx],
      ...overItems.slice(newIndex)
    ];

    const updatedItems = {
      ...items,
      [activeContainer]: newActiveItems,
      [overContainer]: newOverItems
    };

    setItems(updatedItems);
    // No save logic was present here in original, keeping it consistent or adding if needed.
    // Assuming dragOver is transient and dragEnd handles save.
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (over) {
      const activeContainer = findContainer(active.id as string);
      const overContainer = findContainer(over.id as string);

      if (activeContainer && overContainer && activeContainer === overContainer) {
        const activeIdx = items[activeContainer].findIndex(i => i.id === active.id);
        const overIdx = items[overContainer].findIndex(i => i.id === over.id);

        if (activeIdx !== overIdx) {
          const activeItems = items[activeContainer];
          const updatedItems = {
            ...items,
            [activeContainer]: arrayMove(activeItems, activeIdx, overIdx)
          };
          setItems(updatedItems);
          save(updatedItems);
        }
      } else {
        save(items);
      }
    }

    setActiveId(null);
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

  const updateCard = (id: string, content: string, color: CanvasCard['color']) => {
    const container = findContainer(id);
    if (!container) return;
    const updatedItems = {
      ...items,
      [container]: items[container].map(i => i.id === id ? { ...i, content, color } : i)
    };
    setItems(updatedItems);
    save(updatedItems);
  };

  const deleteCard = (id: string) => {
    const container = findContainer(id);
    if (!container) return;
    const updatedItems = {
      ...items,
      [container]: items[container].filter(i => i.id !== id)
    };
    setItems(updatedItems);
    save(updatedItems);
  };

  // AI Generation
  const generateCanvas = async () => {
    if (!plan || isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await fetch('/api/ai-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate-full-canvas',
          businessIdea: plan.ideaInput || plan.overview,
          projectName: plan.projectName
        })
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();

      if (data.canvas) {
        const state = {} as CanvasState;
        CANVAS_FIELDS.forEach(f => {
          state[f] = data.canvas[f]
            ? mapContentToCards(data.canvas[f], sectionColors[f] || 'yellow')
            : items[f] || [];
        });
        setItems(state);
        save(state);
      }
    } catch (err) {
      console.error('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Stats
  const totalCards = Object.values(items).flat().length;
  const filledSections = CANVAS_FIELDS.filter(f => items[f]?.length > 0).length;
  const progress = Math.round((filledSections / CANVAS_FIELDS.length) * 100);

  if (loading || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

<<<<<<< HEAD
  const activeCard = activeId ? Object.values(items).flat().find(i => i.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
    >
      <div className="canvas-wrapper">
        <GenerationLoader isLoading={isGenerating} />
        {/* Header */}
        <div className="canvas-header">
          <div className="header-left">
            <div className="header-icon">
              <LayoutGrid />
            </div>
            <div>
              <h1 className="header-title">بوم مدل کسب‌وکار</h1>
              <p className="header-subtitle">{plan.projectName}</p>
            </div>
=======
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
>>>>>>> Karnex-Completion
          </div>

          <div className="header-right">
            <div className="stat-badge">
              <span className="stat-value">{progress}%</span>
              <span>تکمیل</span>
            </div>

            <div className="stat-badge">
              <span className="stat-value">{totalCards}</span>
              <span>یادداشت</span>
            </div>

            <button
              onClick={generateCanvas}
              disabled={isGenerating}
              className="btn-primary"
            >
              <Sparkles />
              <span>تولید خودکار</span>
            </button>

            <PdfExportButton plan={plan} />
          </div>
        </div>

        {/* Grid */}
        <div className="canvas-grid">
          {CANVAS_FIELDS.map(field => (
            <CanvasColumn
              key={field}
              id={field}
              title={SECTIONS[field].title}
              icon={SECTIONS[field].icon}
              iconColor={SECTIONS[field].iconColor}
              cards={items[field] || []}
              className={SECTIONS[field].gridClass}
              onAddCard={() => addCard(field)}
              onUpdateCard={updateCard}
              onDeleteCard={deleteCard}
            />
          ))}
        </div>
      </div>

<<<<<<< HEAD
      <DragOverlay>
        {activeCard && (
          <div className="drag-overlay w-[260px]">
            <NoteCard card={activeCard} onUpdate={() => { }} onDelete={() => { }} disabled />
          </div>
        )}
      </DragOverlay>
    </DndContext>
=======
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
>>>>>>> Karnex-Completion
  );
}
