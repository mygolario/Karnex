"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CanvasCard } from "./canvas-card";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTION_COLOR_VARIANTS } from "@/lib/canvas/color-variants";
import { getIcon } from "@/lib/canvas/icon-map";
import { useCanvasStore } from "@/lib/canvas/store";
import type { CardData } from "@/lib/canvas/types";
import { toPersianDigits } from "@/lib/utils";

interface CanvasSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  id: string;
  title: string;
  icon?: string;
  color: string;
  description?: string;
  cards: CardData[];
  onAddCard: () => void;
  onUpdateCard: (id: string, content: string) => void;
  onDeleteCard: (id: string) => void;
  onAISuggest?: () => void;
  searchQuery?: string;
}

export function CanvasSection({
  id,
  title,
  icon: iconName,
  color,
  description,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onAISuggest,
  searchQuery,
  className,
  ...props
}: CanvasSectionProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
    data: { type: "Section", sectionId: id },
  });

  const highlightedSectionId = useCanvasStore((s) => s.highlightedSectionId);
  const focusMode = useCanvasStore((s) => s.focusMode);

  const variant = SECTION_COLOR_VARIANTS[color] || SECTION_COLOR_VARIANTS.blue;
  const Icon = getIcon(iconName || "Sparkles");
  const isDimmed = focusMode && highlightedSectionId && highlightedSectionId !== id;
  const isHighlighted = highlightedSectionId === id;

  const uniqueCards = Array.from(
    new Map(cards.filter((c) => c && c.id).map((c) => [c.id, c])).values()
  );

  return (
    <div
      ref={setNodeRef}
      {...props}
      className={cn(
        "flex flex-col rounded-2xl border bg-gradient-to-b shadow-sm transition-all duration-300 h-full min-h-[240px] overflow-hidden group/section",
        variant.gradient, variant.border,
        variant.darkGradient, variant.darkBorder,
        "bg-white/60 dark:bg-black/20 backdrop-blur-sm",
        isOver && "ring-2 ring-primary ring-inset bg-white/90 dark:bg-black/40 scale-[1.01] shadow-lg",
        isHighlighted && "ring-2 ring-primary shadow-lg",
        isDimmed && "opacity-20 pointer-events-none grayscale",
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-black/5 dark:border-white/5 bg-gradient-to-r from-transparent to-transparent">
        <div className="flex items-center gap-2">
          <div className={cn("p-1.5 rounded-lg transition-transform group-hover/section:scale-110", variant.iconBg, variant.iconText)}>
            <Icon size={14} className="stroke-[2.5px]" />
          </div>

          <div className="flex flex-col gap-0.5">
            <h3 className="font-bold text-xs text-foreground/90 tracking-tight leading-none">{title}</h3>
            {description && (
              <p className="text-[9px] text-muted-foreground/60 leading-tight max-w-[140px] truncate">{description}</p>
            )}
          </div>

          <span className={cn(
            "ms-1 text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full transition-all",
            cards.length > 0
              ? "bg-black/5 text-foreground/70 dark:bg-white/10"
              : "bg-transparent text-muted-foreground/40 group-hover/section:bg-black/5 dark:group-hover/section:bg-white/10"
          )}>
            {toPersianDigits(cards.length)}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {onAISuggest && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-500/60 hover:text-purple-600 transition-all opacity-0 group-hover/section:opacity-100"
              onClick={onAISuggest}
              title="پیشنهاد هوش مصنوعی"
            >
              <Sparkles size={12} />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground/50 hover:text-primary transition-all opacity-0 group-hover/section:opacity-100"
            onClick={onAddCard}
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>

      <div className="flex-1 p-2 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 scrollbar-track-transparent">
        <SortableContext items={uniqueCards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {uniqueCards.map((card) => (
            <CanvasCard
              key={card.id}
              card={card}
              sectionId={id}
              sectionColor={color}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
              searchQuery={searchQuery}
            />
          ))}
        </SortableContext>

        {cards.length === 0 && !isOver && (
          <div
            className="h-full min-h-[120px] flex flex-col items-center justify-center gap-2.5 cursor-pointer transition-all group/empty"
            onClick={onAddCard}
          >
            <div className="p-3 rounded-full border-2 border-dashed border-current text-muted-foreground/20 group-hover/empty:text-muted-foreground/40 group-hover/empty:border-primary/30 transition-all">
              <Plus size={18} />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-[11px] font-medium text-muted-foreground/50 group-hover/empty:text-muted-foreground/70">افزودن کارت</span>
              {onAISuggest && (
                <button
                  onClick={(e) => { e.stopPropagation(); onAISuggest(); }}
                  className="text-[10px] text-purple-500/60 hover:text-purple-600 flex items-center gap-1 transition-colors"
                >
                  <Sparkles size={10} />
                  پیشنهاد هوش مصنوعی
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
