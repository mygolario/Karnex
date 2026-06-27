"use client";

import { useEffect, useMemo, useState } from "react";
import { Command as CommandPrimitive } from "cmdk";
import {
  Plus, Search, Sparkles, Undo2, Redo2, Download,
  ZoomIn, ZoomOut, Maximize, LayoutGrid, ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/lib/canvas/store";
import { useCanvasActions } from "./canvas-provider";
import { getTemplate } from "@/lib/canvas/templates";
import type { CanvasType } from "@/lib/canvas/types";

export function CanvasCommandPalette() {
  const open = useCanvasStore((s) => s.commandPaletteOpen);
  const setOpen = useCanvasStore((s) => s.setCommandPaletteOpen);
  const setSearchQuery = useCanvasStore((s) => s.setSearchQuery);
  const setCanvasType = useCanvasStore((s) => s.setCanvasType);
  const addCard = useCanvasStore((s) => s.addCard);
  const zoomIn = useCanvasStore((s) => s.zoomIn);
  const zoomOut = useCanvasStore((s) => s.zoomOut);
  const zoomReset = useCanvasStore((s) => s.zoomReset);
  const setExportDialogOpen = useCanvasStore((s) => s.setExportDialogOpen);
  const setWizardOpen = useCanvasStore((s) => s.setWizardOpen);
  const canvasState = useCanvasStore((s) => s.canvasState);
  const canvasType = useCanvasStore((s) => s.canvasType);

  const { undo, redo } = useCanvasActions();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, setOpen]);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSearchQuery("");
    }
  }, [open, setSearchQuery]);

  const allCards = useMemo(() => {
    const cards: { id: string; content: string; sectionId: string; sectionTitle: string }[] = [];
    const template = getTemplate(canvasType);
    for (const section of template.sections) {
      const sectionCards = canvasState[section.id] || [];
      for (const card of sectionCards) {
        cards.push({
          id: card.id,
          content: card.content,
          sectionId: section.id,
          sectionTitle: section.title,
        });
      }
    }
    return cards;
  }, [canvasState, canvasType]);

  const template = getTemplate(canvasType);
  const filteredCards = search
    ? allCards.filter((c) => c.content.toLowerCase().includes(search.toLowerCase()))
    : allCards.slice(0, 5);

  if (!open) return null;

  const run = (fn: () => void) => {
    fn();
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4" onClick={() => setOpen(false)}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <CommandPrimitive
        className="relative w-full max-w-lg bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
          <Search size={16} className="text-muted-foreground" />
          <CommandPrimitive.Input
            placeholder="جستجو در بوم یا اجرای دستور..."
            value={search}
            onValueChange={(v) => { setSearch(v); setSearchQuery(v); }}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
          <kbd className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">ESC</kbd>
        </div>

        <CommandPrimitive.List className="max-h-[400px] overflow-y-auto p-2">
          <CommandPrimitive.Empty className="py-6 text-center text-sm text-muted-foreground">
            نتیجه‌ای یافت نشد
          </CommandPrimitive.Empty>

          <CommandPrimitive.Group heading="دستورات" className="text-xs">
            <CommandPrimitive.Item onSelect={() => run(() => { const s = template.sections[0]; if (s) addCard(s.id); })} className="cmd-item">
              <Plus size={14} /> افزودن کارت جدید
            </CommandPrimitive.Item>
            <CommandPrimitive.Item onSelect={() => run(() => setWizardOpen(true))} className="cmd-item">
              <Sparkles size={14} /> راهنمای هوشمند
            </CommandPrimitive.Item>
            <CommandPrimitive.Item onSelect={() => run(undo)} className="cmd-item">
              <Undo2 size={14} /> برگشت (Undo)
            </CommandPrimitive.Item>
            <CommandPrimitive.Item onSelect={() => run(redo)} className="cmd-item">
              <Redo2 size={14} /> جلو (Redo)
            </CommandPrimitive.Item>
            <CommandPrimitive.Item onSelect={() => run(() => zoomIn())} className="cmd-item">
              <ZoomIn size={14} /> بزرگنمایی
            </CommandPrimitive.Item>
            <CommandPrimitive.Item onSelect={() => run(() => zoomOut())} className="cmd-item">
              <ZoomOut size={14} /> کوچک‌نمایی
            </CommandPrimitive.Item>
            <CommandPrimitive.Item onSelect={() => run(() => zoomReset())} className="cmd-item">
              <Maximize size={14} /> اندازه اصلی
            </CommandPrimitive.Item>
            <CommandPrimitive.Item onSelect={() => run(() => setExportDialogOpen(true))} className="cmd-item">
              <Download size={14} /> خروجی گرفتن
            </CommandPrimitive.Item>
          </CommandPrimitive.Group>

          <CommandPrimitive.Group heading="تغییر نوع بوم" className="text-xs">
            {Object.values(getTemplate(canvasType).constructor === Object ? {} : {}).length === 0 && null}
            {(["BMC", "LEAN", "BRAND", "SWOT", "EMPATHY", "VPC", "OKR"] as CanvasType[]).map((type) => {
              const t = getTemplate(type);
              return (
                <CommandPrimitive.Item
                  key={type}
                  onSelect={() => run(() => setCanvasType(type))}
                  className={cn("cmd-item", canvasType === type && "bg-primary/10")}
                >
                  <LayoutGrid size={14} />
                  <span>{t.nameFa}</span>
                  {canvasType === type && <ArrowRight size={12} className="ms-auto text-primary" />}
                </CommandPrimitive.Item>
              );
            })}
          </CommandPrimitive.Group>

          {filteredCards.length > 0 && (
            <CommandPrimitive.Group heading="کارت‌ها" className="text-xs">
              {filteredCards.map((card) => (
                <CommandPrimitive.Item
                  key={card.id}
                  onSelect={() => {
                    setSearchQuery(card.content);
                    setOpen(false);
                  }}
                  className="cmd-item"
                >
                  <span className="truncate flex-1">{card.content || "خالی"}</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{card.sectionTitle}</span>
                </CommandPrimitive.Item>
              ))}
            </CommandPrimitive.Group>
          )}
        </CommandPrimitive.List>
      </CommandPrimitive>
    </div>
  );
}
