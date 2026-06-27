"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import {
  X, GripVertical, MoreVertical, Sparkles, Copy, Trash2,
  CheckSquare, Link2, BarChart3, Vote, StickyNote, type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { CardData, CardColor, CardType } from "@/lib/canvas/types";
import { CARD_COLOR_VARIANTS } from "@/lib/canvas/color-variants";
import { useCanvasStore } from "@/lib/canvas/store";

interface CanvasCardProps {
  card: CardData;
  sectionId: string;
  sectionColor?: string;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isOverlay?: boolean;
  searchQuery?: string;
}

const CARD_TYPE_ICONS: Record<CardType, LucideIcon> = {
  NOTE: StickyNote,
  CHECKLIST: CheckSquare,
  IMAGE: Link2,
  LINK: Link2,
  METRIC: BarChart3,
  VOTE: Vote,
};

const COLOR_OPTIONS: CardColor[] = [
  "yellow", "blue", "green", "pink", "purple", "cyan", "red", "orange", "indigo", "rose",
];

const GLOW_COLORS: Record<CardColor, string> = {
  yellow: "rgba(245, 158, 11, 0.18)",
  blue: "rgba(14, 165, 233, 0.18)",
  green: "rgba(16, 185, 129, 0.18)",
  pink: "rgba(236, 72, 153, 0.18)",
  purple: "rgba(168, 85, 247, 0.18)",
  cyan: "rgba(6, 182, 212, 0.18)",
  red: "rgba(239, 68, 68, 0.18)",
  orange: "rgba(249, 115, 22, 0.18)",
  indigo: "rgba(99, 102, 241, 0.18)",
  rose: "rgba(244, 63, 94, 0.18)",
  violet: "rgba(139, 92, 246, 0.18)",
  emerald: "rgba(16, 185, 129, 0.18)",
  amber: "rgba(245, 158, 11, 0.18)",
};

export function CanvasCard({
  card,
  sectionId,
  sectionColor,
  onUpdate,
  onDelete,
  isOverlay,
  searchQuery,
}: CanvasCardProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "Card", card, sectionId },
  });

  const updateCardColor = useCanvasStore((s) => s.updateCardColor);
  const updateCardType = useCanvasStore((s) => s.updateCardType);
  const duplicateCard = useCanvasStore((s) => s.duplicateCard);
  const selectedCardIds = useCanvasStore((s) => s.selectedCardIds);
  const toggleCardSelection = useCanvasStore((s) => s.toggleCardSelection);
  const setRightPanelTab = useCanvasStore((s) => s.setRightPanelTab);
  
  // Reworked States & Actions
  const viewMode = useCanvasStore((s) => s.viewMode);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const updateCardSize = useCanvasStore((s) => s.updateCardSize);

  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const colorKey = (card.color || sectionColor || "blue") as CardColor;
  const variant = CARD_COLOR_VARIANTS[colorKey] || CARD_COLOR_VARIANTS.blue;
  const TypeIcon = CARD_TYPE_ICONS[card.cardType] || StickyNote;
  const isSelected = selectedCardIds.includes(card.id);
  const matchesSearch = searchQuery && searchQuery.trim() && card.content.toLowerCase().includes(searchQuery.toLowerCase());

  // Listen to resized dimensions in Freeform mode and update store
  useEffect(() => {
    if (viewMode !== "freeform" || !cardRef.current) return;
    
    // Resize observer to track dimensions
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);

      // Only update if difference is meaningful
      if (Math.abs(width - (card.width || 0)) > 6 || Math.abs(height - (card.height || 0)) > 6) {
        updateCardSize(sectionId, card.id, width, height);
      }
    });

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [viewMode, card.id, card.width, card.height, sectionId, updateCardSize]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "h-[88px] w-full rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 animate-pulse"
        )}
      />
    );
  }

  const rotationClass = !isOverlay && !isEditing
    ? card.order % 2 === 0 ? "rotate-[-0.5deg]" : "rotate-[0.5deg]"
    : "";

  return (
    <div
      ref={(node) => { setNodeRef(node); cardRef.current = node; }}
      style={{
        ...style,
        ...(viewMode === "freeform" && card.width && { width: `${card.width}px` }),
        ...(viewMode === "freeform" && card.height && { height: `${card.height}px` }),
        "--glow-color": GLOW_COLORS[colorKey] || "rgba(14, 165, 233, 0.15)",
      } as React.CSSProperties}
      className={cn(
        "group relative flex flex-col rounded-xl border shadow-sm transition-all duration-200 no-pan",
        "bg-gradient-to-br",
        variant.bg, variant.border, variant.text,
        variant.darkBg, variant.darkText, variant.darkBorder,
        variant.gradient,
        viewMode === "freeform" ? "resize overflow-hidden min-h-[90px] min-w-[160px]" : rotationClass,
        isOverlay
          ? "cursor-grabbing shadow-2xl rotate-2 scale-105 z-50 opacity-95 ring-2 ring-black/10"
          : "hover:shadow-lg hover:-translate-y-0.5 hover:rotate-0",
        isSelected && "ring-2 ring-primary ring-offset-1 ring-offset-background",
        matchesSearch && "ring-2 ring-amber-400",
        isEditing && "ring-2 ring-primary shadow-lg rotate-0",
        card.isAIGenerated && "ai-glow-card",
        "cyber-pastel-card"
      )}
      onClick={(e) => {
        if (e.shiftKey) {
          e.stopPropagation();
          toggleCardSelection(card.id);
        }
      }}
    >
      <div className={cn("h-1 rounded-t-xl shrink-0", variant.dot)} />

      <div className="flex items-center justify-between px-2.5 pt-1.5 pb-0.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 active:cursor-grabbing touch-none"
          >
            <GripVertical size={11} className="text-black/30 dark:text-white/30" />
          </div>

          <TypeIcon size={11} className="text-black/30 dark:text-white/30" />

          {card.isAIGenerated && (
            <span className="flex items-center gap-0.5 text-[9px] font-bold text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-500/10 px-1 py-0.5 rounded">
              <Sparkles size={8} />
              AI
            </span>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-all text-black/40 dark:text-white/40"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical size={12} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-[10px]">رنگ کارت</DropdownMenuLabel>
            <div className="grid grid-cols-5 gap-1 p-1">
              {COLOR_OPTIONS.map((c) => {
                const cv = CARD_COLOR_VARIANTS[c];
                return (
                  <button
                    key={c}
                    className={cn("w-5 h-5 rounded-md border", cv.bg, cv.border, cv.darkBg, cv.darkBorder, card.color === c && "ring-2 ring-primary ring-offset-1")}
                    onClick={() => updateCardColor(sectionId, card.id, c)}
                  />
                );
              })}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-[10px]">نوع کارت</DropdownMenuLabel>
            {(["NOTE", "CHECKLIST", "METRIC", "VOTE"] as CardType[]).map((t) => {
              const Icon = CARD_TYPE_ICONS[t];
              return (
                <DropdownMenuItem
                  key={t}
                  onClick={() => updateCardType(sectionId, card.id, t)}
                  className="text-xs gap-2"
                >
                  <Icon size={12} />
                  {t === "NOTE" ? "یادداشت" : t === "CHECKLIST" ? "چک‌لیست" : t === "METRIC" ? "معیار" : "رأی‌گیری"}
                </DropdownMenuItem>
              );
            })}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => duplicateCard(sectionId, card.id)} className="text-xs gap-2">
              <Copy size={12} /> تکثیر
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => { setRightPanelTab("comments"); }}
              className="text-xs gap-2"
            >
              <MoreVertical size={12} /> نظرات
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(card.id)}
              className="text-xs gap-2 text-red-600 dark:text-red-400"
            >
              <Trash2 size={12} /> حذف
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <textarea
        ref={textareaRef}
        value={card.content}
        onChange={(e) => onUpdate(card.id, e.target.value)}
        onFocus={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        onClick={(e) => e.stopPropagation()}
        placeholder="بنویسید..."
        className={cn(
          "w-full bg-transparent resize-none border-none focus:ring-0 text-sm leading-relaxed px-2.5 pb-2.5 pt-0.5 outline-none flex-1",
          "placeholder:text-black/20 dark:placeholder:text-white/20 font-medium no-scrollbar"
        )}
        spellCheck={false}
      />

      {isEditing && !isOverlay && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(card.id); }}
          className="absolute -top-2 -end-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
        >
          <X size={11} />
        </button>
      )}

      {/* Reworked Connection Handles (visible only when in freeform view and arrow/connect tool is selected) */}
      {viewMode === "freeform" && activeTool === "arrow" && (
        <>
          <div
            className="connection-handle absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-crosshair no-drag"
            data-card-id={card.id}
            data-handle-pos="top"
          />
          <div
            className="connection-handle absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-crosshair no-drag"
            data-card-id={card.id}
            data-handle-pos="bottom"
          />
          <div
            className="connection-handle absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-crosshair no-drag"
            data-card-id={card.id}
            data-handle-pos="left"
          />
          <div
            className="connection-handle absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-crosshair no-drag"
            data-card-id={card.id}
            data-handle-pos="right"
          />
        </>
      )}
    </div>
  );
}
