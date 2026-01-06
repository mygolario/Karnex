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
import { CanvasColumn } from "@/components/canvas/canvas-column";
import { NoteCard } from "@/components/canvas/note-card";
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

    setItems(prev => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIdx = activeItems.findIndex(i => i.id === active.id);
      const overIdx = overItems.findIndex(i => i.id === over.id);

      const newIndex = over.id in prev 
        ? overItems.length 
        : (overIdx >= 0 ? overIdx : overItems.length);

      return {
        ...prev,
        [activeContainer]: activeItems.filter(i => i.id !== active.id),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          activeItems[activeIdx],
          ...overItems.slice(newIndex)
        ]
      };
    });
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
          setItems(prev => {
            const updated = {
              ...prev,
              [activeContainer]: arrayMove(prev[activeContainer], activeIdx, overIdx)
            };
            save(updated);
            return updated;
          });
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
    setItems(prev => {
      const updated = { ...prev, [field]: [...(prev[field] || []), card] };
      save(updated);
      return updated;
    });
  };

  const updateCard = (id: string, content: string, color: CanvasCard['color']) => {
    const container = findContainer(id);
    if (!container) return;
    setItems(prev => {
      const updated = {
        ...prev,
        [container]: prev[container].map(i => i.id === id ? { ...i, content, color } : i)
      };
      save(updated);
      return updated;
    });
  };

  const deleteCard = (id: string) => {
    const container = findContainer(id);
    if (!container) return;
    setItems(prev => {
      const updated = { ...prev, [container]: prev[container].filter(i => i.id !== id) };
      save(updated);
      return updated;
    });
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
              {isGenerating ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Sparkles />
              )}
              <span>{isGenerating ? 'در حال تولید...' : 'تولید خودکار'}</span>
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

      <DragOverlay>
        {activeCard && (
          <div className="drag-overlay w-[260px]">
            <NoteCard card={activeCard} onUpdate={() => {}} onDelete={() => {}} disabled />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
