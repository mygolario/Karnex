"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CanvasCard as ICanvasCard } from "@/lib/db";
import { cn } from "@/lib/utils";
import { X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasCardProps {
  card: ICanvasCard;
  sectionId: string;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isOverlay?: boolean;
}

export function CanvasCard({ card, sectionId, onUpdate, onDelete, isOverlay }: CanvasCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: "Card",
      card,
      sectionId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const colorVariants: Record<string, string> = {
    yellow: "bg-yellow-100 border-yellow-200 text-yellow-900 group-hover:border-yellow-300",
    blue: "bg-blue-100 border-blue-200 text-blue-900 group-hover:border-blue-300",
    green: "bg-green-100 border-green-200 text-green-900 group-hover:border-green-300",
    pink: "bg-pink-100 border-pink-200 text-pink-900 group-hover:border-pink-300",
    purple: "bg-purple-100 border-purple-200 text-purple-900 group-hover:border-purple-300",
    red: "bg-red-100 border-red-200 text-red-900 group-hover:border-red-300",
    orange: "bg-orange-100 border-orange-200 text-orange-900 group-hover:border-orange-300",
    cyan: "bg-cyan-100 border-cyan-200 text-cyan-900 group-hover:border-cyan-300",
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style}
        className={cn(
           "h-[80px] w-full rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 opacity-50",
           "animate-pulse"
        )}
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col gap-1 rounded-lg border p-2 shadow-sm transition-all hover:shadow-md",
        colorVariants[card.color || 'blue'],
        isOverlay && "cursor-grabbing shadow-xl rotate-2 scale-105 z-50 opacity-90",
        !isOverlay && "hover:-translate-y-0.5"
      )}
    >
      {/* Drag Handle & Delete */}
      <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity absolute top-1 right-1 left-1">
        <div {...attributes} {...listeners} className="cursor-grab p-0.5 hover:bg-black/5 rounded">
             <GripVertical size={12} className="text-black/40" />
        </div>
        <button 
           onClick={() => onDelete(card.id)}
           className="text-red-500/60 hover:text-red-600 hover:bg-red-100/50 rounded p-0.5 transition-colors"
        >
            <X size={12} />
        </button>
      </div>

      {/* Content */}
      <textarea
        value={card.content}
        onChange={(e) => onUpdate(card.id, e.target.value)}
        placeholder="بنویسید..."
        className="w-full bg-transparent resize-none border-none focus:ring-0 text-xs leading-relaxed p-0 pt-3 min-h-[50px] outline-none"
        spellCheck={false}
      />
    </div>
  );
}
