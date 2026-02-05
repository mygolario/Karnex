"use client";

import { useState } from "react";
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCanvas } from "./canvas-context";
import { CanvasSection } from "./canvas-section";
import { CanvasCard } from "./canvas-card";
import { CanvasCard as ICanvasCard } from "@/lib/db";
import { 
    // BMC Icons
    Handshake, Activity, Package, Gem, Heart, Megaphone, Users, PiggyBank, Banknote,
    // Brand Icons
    Star, LayoutGrid, Share2, Sparkles, AlertCircle, Lightbulb, AlertTriangle
} from "lucide-react";
import { useProject } from "@/contexts/project-context";

// 1. Definition of Blocks (Re-using what was in page.tsx but cleaned up)

const BMC_LAYOUT = [
    { id: 'keyPartners', title: 'شرکای کلیدی', icon: Handshake, color: 'cyan', area: 'partners' },
    { id: 'keyActivities', title: 'فعالیت‌های کلیدی', icon: Activity, color: 'blue', area: 'activities' },
    { id: 'keyResources', title: 'منابع کلیدی', icon: Package, color: 'indigo', area: 'resources' },
    { id: 'uniqueValue', title: 'ارزش پیشنهادی', icon: Gem, color: 'pink', area: 'value' },
    { id: 'customerRelations', title: 'روابط مشتری', icon: Heart, color: 'rose', area: 'relations' },
    { id: 'channels', title: 'کانال‌ها', icon: Megaphone, color: 'orange', area: 'channels' },
    { id: 'customerSegments', title: 'بخش‌های مشتری', icon: Users, color: 'purple', area: 'segments' },
    { id: 'costStructure', title: 'ساختار هزینه', icon: PiggyBank, color: 'red', area: 'cost' },
    { id: 'revenueStream', title: 'جریان درآمد', icon: Banknote, color: 'green', area: 'revenue' },
];

const BRAND_LAYOUT = [
    { id: 'identity', title: 'هویت', icon: Gem, color: 'purple' },
    { id: 'promise', title: 'وعده برند', icon: Star, color: 'amber' },
    { id: 'audience', title: 'مخاطب', icon: Users, color: 'blue' },
    { id: 'contentStrategy', title: 'استراتژی محتوا', icon: LayoutGrid, color: 'pink' },
    { id: 'channels', title: 'کانال‌ها', icon: Share2, color: 'violet' },
    { id: 'monetization', title: 'درآمد', icon: Banknote, color: 'emerald' },
    { id: 'resources', title: 'منابع', icon: Package, color: 'cyan' },
    { id: 'collaborators', title: 'همکاران', icon: Handshake, color: 'rose' },
    { id: 'investment', title: 'سرمایه', icon: PiggyBank, color: 'red' },
];

export function CanvasBoard() {
  const { canvasState, moveCard, addCard, updateCard, deleteCard } = useCanvas();
  const { activeProject } = useProject();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<ICanvasCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const isBrand = activeProject?.projectType === 'creator';
  const layout = isBrand ? BRAND_LAYOUT : BMC_LAYOUT;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const { card } = active.data.current || {};
    setActiveId(active.id as string);
    setActiveCard(card || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
      // Optional: Visual feedback handling
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveCard(null);

    if (!over) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (!activeData || !overData) return;

    const activeSection = activeData.sortable?.containerId || activeData.sectionId;
    const overSection = overData.sortable?.containerId || overData.sectionId || overIdStr; // If over section directly

    if (activeSection && overSection) {
        moveCard(activeIdStr, overIdStr, activeSection, overSection);
    }
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {/* Layout Render */}
      {isBrand ? (
          /* Grid for Brand Canvas */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
              {layout.map(section => (
                  <CanvasSection 
                     key={section.id}
                     id={section.id}
                     title={section.title}
                     icon={section.icon}
                     color={section.color}
                     cards={canvasState[section.id] || []}
                     onAddCard={() => addCard(section.id)}
                     onUpdateCard={(cardId, content) => updateCard(section.id, cardId, content)}
                     onDeleteCard={(cardId) => deleteCard(section.id, cardId)}
                  />
              ))}
          </div>
      ) : (
          /* Complex Grid for BMC */
          <div 
            dir="ltr" 
            className="grid gap-4 min-h-[800px]"
            style={{
              gridTemplateColumns: 'repeat(5, 1fr)',
              gridTemplateRows: 'repeat(2, 400px) 200px', // Fixed heights for stability or min-content
              gridTemplateAreas: `
                "partners activities value relations segments"
                "partners resources  value channels  segments"
                "cost     cost       cost  revenue   revenue"
              `
            }}
          >
              {layout.map(section => (
                  <CanvasSection 
                     key={section.id}
                     id={section.id}
                     title={section.title}
                     icon={section.icon}
                     color={section.color}
                     cards={canvasState[section.id] || []}
                     onAddCard={() => addCard(section.id)}
                     onUpdateCard={(cardId, content) => updateCard(section.id, cardId, content)}
                     onDeleteCard={(cardId) => deleteCard(section.id, cardId)}
                     className="min-h-0" // override
                     // @ts-ignore
                     style={{ gridArea: section.area }}
                  />
              ))}
          </div>
      )}

      {/* Drag Overlay */}
      <DragOverlay>
         {activeId && activeCard ? (
             <CanvasCard 
               card={activeCard} 
               sectionId="overlay" 
               onUpdate={() => {}} 
               onDelete={() => {}} 
               isOverlay 
             />
         ) : null}
      </DragOverlay>
    </DndContext>
  );
}
