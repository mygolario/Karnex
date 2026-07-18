"use client";

import { Button } from "@/components/ui/button";
import {
  Plus,
  ChevronUp,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import type { PitchDeckSlide } from "@/lib/db";
import { getSlideTypeLabel } from "@/lib/pitch-deck";
import { cn } from "@/lib/utils";

interface FilmstripProps {
  slides: PitchDeckSlide[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onAdd: () => void;
  onMove: (index: number, direction: "up" | "down") => void;
  onDuplicate: (index: number) => void;
  onToggleHide: (index: number) => void;
  onDelete: (index: number) => void;
  className?: string;
}

export function Filmstrip({
  slides,
  currentIndex,
  onSelect,
  onAdd,
  onMove,
  onDuplicate,
  onToggleHide,
  onDelete,
  className,
}: FilmstripProps) {
  return (
    <aside
      className={cn(
        "flex flex-col gap-3 overflow-hidden rounded-2xl border border-border/60 bg-card/80 p-3 backdrop-blur-xl",
        className
      )}
      dir="rtl"
    >
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-muted-foreground">ساختار اسلایدها</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary hover:text-primary"
          onClick={onAdd}
          aria-label="افزودن اسلاید"
        >
          <Plus size={16} />
        </Button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto pe-1">
        {slides.map((s, idx) => (
          <div
            key={s.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(idx)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onSelect(idx);
            }}
            className={cn(
              "group relative flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all",
              idx === currentIndex
                ? "border-primary/40 bg-primary/5 shadow-sm shadow-primary/10"
                : "border-border/50 bg-background/40 hover:bg-muted/40",
              s.isHidden && "opacity-50"
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="w-4 font-mono text-[10px] text-muted-foreground">{idx + 1}</span>
              <div className="flex min-w-0 flex-col text-right">
                <span className="truncate text-xs font-bold">{s.title || "بدون عنوان"}</span>
                <span className="text-[9px] font-semibold text-primary">
                  {getSlideTypeLabel(s.type)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(idx, "up");
                }}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                disabled={idx === 0}
                aria-label="جابجایی به بالا"
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onMove(idx, "down");
                }}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                disabled={idx === slides.length - 1}
                aria-label="جابجایی به پایین"
              >
                <ChevronDown size={12} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(idx);
                }}
                className="rounded p-1 text-muted-foreground hover:text-primary"
                aria-label="تکثیر"
              >
                <Copy size={12} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHide(idx);
                }}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
                aria-label={s.isHidden ? "نمایش" : "پنهان"}
              >
                {s.isHidden ? <EyeOff size={12} className="text-rose-500" /> : <Eye size={12} />}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(idx);
                }}
                className="rounded p-1 text-muted-foreground hover:text-rose-500"
                aria-label="حذف"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
