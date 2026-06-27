"use client";

import { useState, useEffect } from "react";
import {
  Loader2, LayoutGrid, Sparkles, Download, Share2, Undo2, Redo2,
  ChevronDown, Check, CloudOff, AlertCircle, Search, Network, type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/lib/canvas/store";
import { useCanvasActions } from "./canvas-provider";
import { CANVAS_TEMPLATES } from "@/lib/canvas/templates";
import { getCompletenessScore } from "@/lib/canvas/completeness";
import type { CanvasType } from "@/lib/canvas/types";
import { toPersianDigits } from "@/lib/utils";
import { CanvasPresentMode } from "./canvas-present-mode";

export function CanvasTopBar() {
  const { saveStatus, undo, redo, canUndo, canRedo } = useCanvasActions();
  const canvasState = useCanvasStore((s) => s.canvasState);
  const canvasType = useCanvasStore((s) => s.canvasType);
  const canvasName = useCanvasStore((s) => s.canvasName);
  const viewMode = useCanvasStore((s) => s.viewMode);
  const setViewMode = useCanvasStore((s) => s.setViewMode);
  const setCanvasName = useCanvasStore((s) => s.setCanvasName);
  const setCanvasType = useCanvasStore((s) => s.setCanvasType);
  const setExportDialogOpen = useCanvasStore((s) => s.setExportDialogOpen);
  const setCommandPaletteOpen = useCanvasStore((s) => s.setCommandPaletteOpen);
  const setWizardOpen = useCanvasStore((s) => s.setWizardOpen);
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(canvasName);

  useEffect(() => {
    setTempName(canvasName);
  }, [canvasName]);

  const completeness = getCompletenessScore(canvasState, canvasType);
  const currentTemplate = CANVAS_TEMPLATES[canvasType];

  const saveStatusDisplay: Record<string, { icon: LucideIcon; text: string; color: string }> = {
    idle: { icon: Check, text: "ذخیره شد", color: "text-muted-foreground" },
    saving: { icon: Loader2, text: "در حال ذخیره...", color: "text-blue-500" },
    saved: { icon: Check, text: "ذخیره شد", color: "text-green-500" },
    error: { icon: AlertCircle, text: "خطا در ذخیره", color: "text-red-500" },
    offline: { icon: CloudOff, text: "آفلاین - تغییرات صف شد", color: "text-amber-500" },
  };

  const status = saveStatusDisplay[saveStatus] || saveStatusDisplay.idle;
  const StatusIcon = status.icon;

  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-background/80 backdrop-blur-xl canvas-export-exclude" data-tour-id="canvas-header">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
          <LayoutGrid size={18} />
        </div>

        <div className="flex flex-col min-w-0">
          {editingName ? (
            <input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={() => { setCanvasName(tempName || "بوم کسب‌وکار"); setEditingName(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") { setCanvasName(tempName || "بوم کسب‌وکار"); setEditingName(false); } if (e.key === "Escape") { setTempName(canvasName); setEditingName(false); } }}
              autoFocus
              className="text-sm font-bold bg-transparent border-b border-primary outline-none px-0 py-0 max-w-[200px]"
            />
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-sm font-bold text-foreground hover:text-primary transition-colors truncate text-start"
            >
              {canvasName}
            </button>
          )}

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
                  {currentTemplate.nameFa}
                  <ChevronDown size={11} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>نوع بوم</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.values(CANVAS_TEMPLATES).map((t) => (
                  <DropdownMenuItem
                    key={t.type}
                    onClick={() => setCanvasType(t.type as CanvasType)}
                    className={cn("flex items-center justify-between", canvasType === t.type && "bg-primary/10")}
                  >
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{t.nameFa}</span>
                      <span className="text-[10px] text-muted-foreground">{t.description}</span>
                    </div>
                    {canvasType === t.type && <Check size={14} className="text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <span className="text-[10px] text-muted-foreground/50">•</span>

            <div className="flex items-center gap-1">
              <div className="w-16 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
                  style={{ width: `${completeness.percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground tabular-nums">
                {toPersianDigits(completeness.percentage)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* View mode toggle */}
      <div className="flex items-center bg-muted/75 p-0.5 rounded-lg border border-border/80 shadow-sm canvas-export-exclude">
        <button
          onClick={() => setViewMode("grid")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all duration-200",
            viewMode === "grid"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <LayoutGrid size={13} />
          نمای شبکه‌ای
        </button>
        <button
          onClick={() => setViewMode("freeform")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all duration-200",
            viewMode === "freeform"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Network size={13} />
          نمای آزاد
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <div className={cn("flex items-center gap-1.5 text-[11px] font-medium px-2 py-1 rounded-md transition-all", status.color)}>
          <StatusIcon size={12} className={cn(saveStatus === "saving" && "animate-spin")} />
          <span className="hidden sm:inline">{status.text}</span>
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">
          <Undo2 size={15} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">
          <Redo2 size={15} />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setCommandPaletteOpen(true)}
          title="Search (Ctrl+K)"
        >
          <Search size={15} />
        </Button>

        <div className="w-px h-5 bg-border mx-1" />

        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 shadow-sm"
          onClick={() => setWizardOpen(true)}
          data-tour-id="ai-auto-fill"
        >
          <Sparkles size={14} />
          <span className="hidden md:inline">راهنمای هوشمند</span>
        </Button>

        <CanvasPresentMode />

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => setExportDialogOpen(true)}
          title="Export"
        >
          <Download size={15} />
        </Button>

        <Button variant="ghost" size="icon" className="h-8 w-8" title="Share">
          <Share2 size={15} />
        </Button>
      </div>
    </div>
  );
}
