"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CanvasCard as ICanvasCard } from "@/lib/db";
import { CanvasCard } from "./canvas-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CanvasSectionProps {
  id: string;
  title: string;
  icon?: any;
  color: string;
  cards: ICanvasCard[];
  onAddCard: () => void;
  onUpdateCard: (id: string, content: string) => void;
  onDeleteCard: (id: string) => void;
  className?: string; // For Grid Area
}

export function CanvasSection({
  id,
  title,
  icon: Icon,
  color,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  className
}: CanvasSectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: {
      type: "Section",
      sectionId: id,
    },
  });

  const variants: Record<string, string> = {
    blue: "bg-blue-50/50 border-blue-200 scrollbar-thumb-blue-200",
    green: "bg-green-50/50 border-green-200 scrollbar-thumb-green-200",
    red: "bg-red-50/50 border-red-200 scrollbar-thumb-red-200",
    yellow: "bg-yellow-50/50 border-yellow-200 scrollbar-thumb-yellow-200",
    purple: "bg-purple-50/50 border-purple-200 scrollbar-thumb-purple-200",
    pink: "bg-pink-50/50 border-pink-200 scrollbar-thumb-pink-200",
    orange: "bg-orange-50/50 border-orange-200 scrollbar-thumb-orange-200",
    cyan: "bg-cyan-50/50 border-cyan-200 scrollbar-thumb-cyan-200",
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex flex-col rounded-xl border transition-colors h-full min-h-[200px] overflow-hidden group",
        variants[color] || variants.blue,
        isOver && "ring-2 ring-primary ring-inset bg-primary/5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-2 px-3 border-b border-black/5 bg-white/40 backdrop-blur-sm">
        <div className="flex items-center gap-2">
           {Icon && <Icon size={14} className={cn("opacity-70", `text-${color}-600`)} />}
           <h3 className="font-bold text-xs text-foreground/80">{title}</h3>
           <span className="text-[10px] bg-black/5 px-1.5 rounded-full text-muted-foreground">{cards.length}</span>
        </div>
        <Button 
           variant="ghost" 
           size="icon" 
           className="h-6 w-6 hover:bg-black/5 text-muted-foreground"
           onClick={onAddCard}
        >
            <Plus size={14} />
        </Button>
      </div>

      {/* Cards Area */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto scrollbar-thin">
        <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
           {cards.map(card => (
             <CanvasCard 
               key={card.id} 
               card={card} 
               sectionId={id} 
               onUpdate={onUpdateCard} 
               onDelete={onDeleteCard}
             />
           ))}
        </SortableContext>
        
        {cards.length === 0 && !isOver && (
            <div 
               className="h-full min-h-[100px] flex items-center justify-center text-muted-foreground/30 text-xs cursor-pointer hover:text-muted-foreground/60 transition-colors"
               onClick={onAddCard}
            >
                + افزودن
            </div>
        )}
      </div>
    </div>
  );
}
