"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import {
  X, GripVertical, MoreVertical, Sparkles, Copy, Trash2,
  CheckSquare, Link2, BarChart3, Vote, StickyNote, Square, Circle,
  Plus, Upload, type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import type { CardData, CardColor, CardType, ChecklistItem } from "@/lib/canvas/types";
import { CARD_COLOR_VARIANTS } from "@/lib/canvas/color-variants";
import { useCanvasStore } from "@/lib/canvas/store";
import { useProject } from "@/contexts/project-context";
import { toast } from "sonner";

interface CanvasCardProps {
  card: CardData;
  sectionId: string;
  sectionColor?: string;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isOverlay?: boolean;
  searchQuery?: string;
}

const CARD_TYPE_ICONS: Record<string, LucideIcon> = {
  NOTE: StickyNote,
  CHECKLIST: CheckSquare,
  IMAGE: Link2,
  LINK: Link2,
  METRIC: BarChart3,
  VOTE: Vote,
  SHAPE_RECT: Square,
  SHAPE_CIRCLE: Circle,
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
  const updateCardMetadata = useCanvasStore((s) => s.updateCardMetadata);
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
      data-card-id={card.id}
      ref={(node) => { setNodeRef(node); cardRef.current = node; }}
      style={{
        ...style,
        ...(viewMode === "freeform" && card.width && { width: `${card.width}px` }),
        ...(viewMode === "freeform" && card.height && { height: `${card.height}px` }),
        "--glow-color": GLOW_COLORS[colorKey] || "rgba(14, 165, 233, 0.15)",
      } as React.CSSProperties}
      className={cn(
        "group relative flex flex-col rounded-xl border shadow-sm transition-all duration-200 no-pan",
        "bg-background/80 backdrop-blur-xl",
        "bg-gradient-to-br",
        variant.bg, variant.border, variant.text,
        variant.darkBg, variant.darkText, variant.darkBorder,
        variant.gradient,
        viewMode === "freeform" ? "resize overflow-hidden min-h-[90px] min-w-[160px]" : rotationClass,
        isOverlay
          ? "cursor-grabbing shadow-2xl rotate-2 scale-105 z-50 opacity-95 ring-2 ring-black/10"
          : "hover:shadow-lg hover:-translate-y-0.5 hover:rotate-0",
        isSelected && "ring-2 ring-indigo-500 ring-offset-1 ring-offset-background shadow-[0_0_20px_var(--glow-color)]",
        matchesSearch && "ring-2 ring-amber-400",
        isEditing && "ring-2 ring-primary shadow-lg rotate-0",
        card.isAIGenerated && "ai-glow-card",
        card.cardType === "SHAPE_CIRCLE" && "rounded-full",
        "cyber-pastel-card border-border/50"
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

      <CardBody
        card={card}
        sectionId={sectionId}
        isEditing={isEditing}
        isOverlay={isOverlay}
        textareaRef={textareaRef}
        onUpdate={onUpdate}
        onFocusEdit={() => setIsEditing(true)}
        onBlurEdit={() => setIsEditing(false)}
        updateCardMetadata={updateCardMetadata}
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
            className="connection-handle absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-crosshair no-drag w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-md opacity-80 hover:opacity-100 hover:scale-125 transition-all"
            data-card-id={card.id}
            data-handle-pos="top"
          />
          <div
            className="connection-handle absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-crosshair no-drag w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-md opacity-80 hover:opacity-100 hover:scale-125 transition-all"
            data-card-id={card.id}
            data-handle-pos="bottom"
          />
          <div
            className="connection-handle absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-crosshair no-drag w-3 h-3 rounded-full bg-violet-500 border-2 border-white shadow-md opacity-80 hover:opacity-100 hover:scale-125 transition-all"
            data-card-id={card.id}
            data-handle-pos="left"
          />
          <div
            className="connection-handle absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-crosshair no-drag w-3 h-3 rounded-full bg-violet-500 border-2 border-white shadow-md opacity-80 hover:opacity-100 hover:scale-125 transition-all"
            data-card-id={card.id}
            data-handle-pos="right"
          />
        </>
      )}
    </div>
  );
}

function CardBody({
  card,
  sectionId,
  isEditing,
  isOverlay,
  textareaRef,
  onUpdate,
  onFocusEdit,
  onBlurEdit,
  updateCardMetadata,
}: {
  card: CardData;
  sectionId: string;
  isEditing: boolean;
  isOverlay?: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onUpdate: (id: string, content: string) => void;
  onFocusEdit: () => void;
  onBlurEdit: () => void;
  updateCardMetadata: (sectionId: string, cardId: string, metadata: Record<string, unknown>) => void;
}) {
  const { activeProject: plan } = useProject();
  const items = (card.metadata?.items as ChecklistItem[] | undefined) ?? [];
  const metricCurrent = Number(card.metadata?.current ?? 0);
  const metricTarget = Number(card.metadata?.target ?? 100);
  const metricUnit = String(card.metadata?.unit ?? "%");
  const linkUrl = String(card.metadata?.url ?? card.content ?? "");
  const imageUrl = String(card.metadata?.url ?? "");

  if (card.cardType === "SHAPE_RECT" || card.cardType === "SHAPE_CIRCLE") {
    return (
      <div className="flex-1 flex items-center justify-center p-2 opacity-60">
        {card.cardType === "SHAPE_RECT" ? <Square size={24} /> : <Circle size={24} />}
      </div>
    );
  }

  if (card.cardType === "CHECKLIST") {
    const toggleItem = (itemId: string) => {
      const updated = items.map((it) =>
        it.id === itemId ? { ...it, done: !it.done } : it
      );
      updateCardMetadata(sectionId, card.id, { items: updated });
    };
    const addItem = () => {
      updateCardMetadata(sectionId, card.id, {
        items: [...items, { id: `item-${Date.now()}`, text: "", done: false }],
      });
    };
    return (
      <div className="flex-1 px-2.5 pb-2.5 space-y-1 overflow-y-auto no-scrollbar" onClick={(e) => e.stopPropagation()}>
        {items.map((item) => (
          <label key={item.id} className="flex items-start gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={item.done}
              onChange={() => toggleItem(item.id)}
              className="mt-0.5 rounded"
            />
            <input
              value={item.text}
              onChange={(e) => {
                const updated = items.map((it) =>
                  it.id === item.id ? { ...it, text: e.target.value } : it
                );
                updateCardMetadata(sectionId, card.id, { items: updated });
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm"
              placeholder="آیتم..."
            />
          </label>
        ))}
        <button type="button" onClick={addItem} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
          <Plus size={10} /> افزودن
        </button>
        {items.filter((it) => it.text.trim()).map((item) => (
          <button
            key={`promote-${item.id}`}
            type="button"
            className="text-[10px] text-primary hover:underline block"
            onClick={async () => {
              if (!plan?.id || item.roadmapStepId) return;
              const res = await fetch(`/api/projects/${plan.id}/canvas/promote-task`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  cardId: card.id,
                  sectionId,
                  itemId: item.id,
                  taskTitle: item.text,
                }),
              });
              if (res.ok) {
                const data = await res.json();
                const updated = items.map((it) =>
                  it.id === item.id ? { ...it, roadmapStepId: data.task.id } : it
                );
                updateCardMetadata(sectionId, card.id, { items: updated });
                toast.success("به نقشه راه اضافه شد");
              }
            }}
          >
            {item.roadmapStepId ? "✓ در نقشه راه" : "+ افزودن به نقشه راه"}
          </button>
        ))}
      </div>
    );
  }

  if (card.cardType === "METRIC") {
    const pct = metricTarget > 0 ? Math.min(100, Math.round((metricCurrent / metricTarget) * 100)) : 0;
    return (
      <div className="flex-1 px-2.5 pb-2.5 space-y-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex gap-2">
          <input
            type="number"
            value={metricCurrent}
            onChange={(e) => updateCardMetadata(sectionId, card.id, { current: Number(e.target.value) })}
            className="w-16 text-xs bg-muted/50 rounded px-1 py-0.5 border border-border/50"
          />
          <span className="text-xs text-muted-foreground self-center">/</span>
          <input
            type="number"
            value={metricTarget}
            onChange={(e) => updateCardMetadata(sectionId, card.id, { target: Number(e.target.value) })}
            className="w-16 text-xs bg-muted/50 rounded px-1 py-0.5 border border-border/50"
          />
          <span className="text-xs text-muted-foreground self-center">{metricUnit}</span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <input
          value={card.content}
          onChange={(e) => onUpdate(card.id, e.target.value)}
          placeholder="نام KPI..."
          className="w-full text-xs bg-transparent border-none outline-none"
        />
      </div>
    );
  }

  if (card.cardType === "LINK") {
    return (
      <div className="flex-1 px-2.5 pb-2.5 space-y-2" onClick={(e) => e.stopPropagation()}>
        <input
          value={linkUrl}
          onChange={(e) => {
            updateCardMetadata(sectionId, card.id, { url: e.target.value });
            onUpdate(card.id, e.target.value);
          }}
          placeholder="https://..."
          className="w-full text-xs bg-muted/50 rounded px-2 py-1 border border-border/50"
          dir="ltr"
        />
        {linkUrl.startsWith("http") && (
          <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary truncate block">
            {linkUrl}
          </a>
        )}
      </div>
    );
  }

  if (card.cardType === "IMAGE") {
    const handleUpload = async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "canvas");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        updateCardMetadata(sectionId, card.id, { url: data.url, fileName: data.fileName });
      }
    };
    return (
      <div className="flex-1 px-2.5 pb-2.5" onClick={(e) => e.stopPropagation()}>
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="w-full h-24 object-cover rounded-lg" />
        ) : (
          <label className="flex flex-col items-center justify-center h-24 border border-dashed border-border/50 rounded-lg cursor-pointer hover:bg-muted/30">
            <Upload size={16} className="text-muted-foreground mb-1" />
            <span className="text-[10px] text-muted-foreground">آپلود تصویر</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])} />
          </label>
        )}
      </div>
    );
  }

  return (
    <textarea
      ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
      value={card.content}
      onChange={(e) => onUpdate(card.id, e.target.value)}
      onFocus={onFocusEdit}
      onBlur={onBlurEdit}
      onClick={(e) => e.stopPropagation()}
      placeholder="بنویسید..."
      className={cn(
        "w-full bg-transparent resize-none border-none focus:ring-0 text-sm leading-relaxed px-2.5 pb-2.5 pt-0.5 outline-none flex-1",
        "placeholder:text-black/20 dark:placeholder:text-white/20 font-medium no-scrollbar"
      )}
      spellCheck={false}
    />
  );
}
