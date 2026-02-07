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
  sectionColor?: string;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isOverlay?: boolean;
}

export function CanvasCard({ card, sectionId, sectionColor, onUpdate, onDelete, isOverlay }: CanvasCardProps) {
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

  // Visually pleasing sticky note colors (more pastel/modern)
  const colorVariants: Record<string, string> = {
    yellow: "bg-[#fef9c3] text-yellow-900 border-l-4 border-l-yellow-400 dark:bg-yellow-900/40 dark:text-yellow-100 dark:border-l-yellow-500",
    blue: "bg-[#e0f2fe] text-blue-900 border-l-4 border-l-blue-400 dark:bg-blue-900/40 dark:text-blue-100 dark:border-l-blue-500",
    green: "bg-[#dcfce7] text-green-900 border-l-4 border-l-green-400 dark:bg-green-900/40 dark:text-green-100 dark:border-l-green-500",
    pink: "bg-[#fce7f3] text-pink-900 border-l-4 border-l-pink-400 dark:bg-pink-900/40 dark:text-pink-100 dark:border-l-pink-500",
    purple: "bg-[#f3e8ff] text-purple-900 border-l-4 border-l-purple-400 dark:bg-purple-900/40 dark:text-purple-100 dark:border-l-purple-500",
    red: "bg-[#fee2e2] text-red-900 border-l-4 border-l-red-400 dark:bg-red-900/40 dark:text-red-100 dark:border-l-red-500",
    orange: "bg-[#ffedd5] text-orange-900 border-l-4 border-l-orange-400 dark:bg-orange-900/40 dark:text-orange-100 dark:border-l-orange-500",
    cyan: "bg-[#cffafe] text-cyan-900 border-l-4 border-l-cyan-400 dark:bg-cyan-900/40 dark:text-cyan-100 dark:border-l-cyan-500",
    indigo: "bg-[#e0e7ff] text-indigo-900 border-l-4 border-l-indigo-400 dark:bg-indigo-900/40 dark:text-indigo-100 dark:border-l-indigo-500",
    rose: "bg-[#ffe4e6] text-rose-900 border-l-4 border-l-rose-400 dark:bg-rose-900/40 dark:text-rose-100 dark:border-l-rose-500",
  };

  if (isDragging) {
    return (
      <div 
        ref={setNodeRef} 
        style={style}
        className={cn(
           "h-[80px] w-full rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 opacity-50",
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
        "group relative flex flex-col gap-1 rounded-r-lg rounded-l-[2px] p-3 shadow-sm transition-all duration-200",
        // Base styling for sticky note feel
        colorVariants[sectionColor || card.color || 'blue'],
        isOverlay 
            ? "cursor-grabbing shadow-2xl rotate-2 scale-105 z-50 opacity-95 ring-2 ring-black/5" 
            : "hover:shadow-md hover:-translate-y-0.5 hover:rotate-1"
      )}
    >
      {/* Drag Handle & Delete overlay */}
      <div className="flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute top-0.5 right-0.5 left-0.5">
        <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded active:cursor-grabbing">
             <GripVertical size={13} className="text-black/30 dark:text-white/30" />
        </div>
        <button 
           onClick={() => onDelete(card.id)}
           className="text-red-500/50 hover:text-red-600 hover:bg-white/40 dark:hover:bg-black/20 rounded p-0.5 transition-colors"
        >
            <X size={13} />
        </button>
      </div>

      {/* Content */}
      <textarea
        value={card.content}
        onChange={(e) => onUpdate(card.id, e.target.value)}
        placeholder="بنویسید..."
        className="w-full bg-transparent resize-none border-none focus:ring-0 text-sm leading-relaxed p-0 pt-2 min-h-[60px] outline-none placeholder:text-black/20 dark:placeholder:text-white/20 font-medium"
        spellCheck={false}
      />
    </div>
  );
}
