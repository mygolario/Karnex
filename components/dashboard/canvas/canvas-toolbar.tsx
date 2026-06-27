"use client";

import {
  MousePointer2, StickyNote, Type, Pen, ArrowRight, Eraser,
  Image, Sparkles, ChevronRight, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/lib/canvas/store";
import type { ToolType } from "@/lib/canvas/types";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

const TOOLS: { id: ToolType; icon: LucideIcon; label: string; shortcut?: string; freeformOnly?: boolean }[] = [
  { id: "select", icon: MousePointer2, label: "انتخاب", shortcut: "V" },
  { id: "sticky", icon: StickyNote, label: "یادداشت", shortcut: "N" },
  { id: "text", icon: Type, label: "متن", shortcut: "T", freeformOnly: true },
  { id: "pen", icon: Pen, label: "قلم", shortcut: "P", freeformOnly: true },
  { id: "arrow", icon: ArrowRight, label: "اتصال", shortcut: "A", freeformOnly: true },
  { id: "eraser", icon: Eraser, label: "پاک‌کن", shortcut: "E", freeformOnly: true },
  { id: "image", icon: Image, label: "تصویر", shortcut: "I", freeformOnly: true },
  { id: "ai", icon: Sparkles, label: "هوش مصنوعی", shortcut: "AI" },
];

export function CanvasToolbar({ mobile = false }: { mobile?: boolean }) {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const setActiveTool = useCanvasStore((s) => s.setActiveTool);
  const leftToolbarOpen = useCanvasStore((s) => s.leftToolbarOpen);
  const setLeftToolbarOpen = useCanvasStore((s) => s.setLeftToolbarOpen);
  const viewMode = useCanvasStore((s) => s.viewMode);
  const [hoveredTool, setHoveredTool] = useState<string | null>(null);

  if (mobile) {
    return (
      <div className="flex items-center gap-1 overflow-x-auto mobile-scroll-x py-1 canvas-export-exclude">
        {TOOLS.map((tool) => {
          if (tool.freeformOnly && viewMode === "grid") return null;
          const Icon = tool.icon;
          const isActive = activeTool === tool.id;
          return (
            <Button
              key={tool.id}
              variant="ghost"
              size="icon"
              className={cn(
                "h-10 w-10 shrink-0 rounded-xl mobile-touch-target",
                isActive && "bg-primary text-primary-foreground",
                !isActive && "text-muted-foreground"
              )}
              onClick={() => setActiveTool(tool.id)}
              title={tool.label}
            >
              <Icon size={18} />
            </Button>
          );
        })}
      </div>
    );
  }

  if (!leftToolbarOpen) {
    return (
      <div className="flex flex-col items-center gap-1 py-2 px-1.5 border-e border-border bg-background/80 backdrop-blur-xl canvas-export-exclude">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setLeftToolbarOpen(true)}
        >
          <ChevronLeft size={16} />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1 py-2 px-1.5 border-e border-border bg-background/80 backdrop-blur-xl canvas-export-exclude w-12 shrink-0">
      {TOOLS.map((tool) => {
        if (tool.freeformOnly && viewMode === "grid") return null;

        const Icon = tool.icon;
        const isActive = activeTool === tool.id;
        const isHovered = hoveredTool === tool.id;

        return (
          <div
            key={tool.id}
            className="relative"
            onMouseEnter={() => setHoveredTool(tool.id)}
            onMouseLeave={() => setHoveredTool(null)}
          >
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-lg transition-all relative group",
                isActive && "bg-primary text-primary-foreground shadow-sm",
                !isActive && "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              onClick={() => setActiveTool(tool.id)}
            >
              <Icon size={17} />
              {tool.id === "ai" && (
                <span className="absolute -top-0.5 -end-0.5 w-2 h-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 animate-pulse" />
              )}
            </Button>

            {isHovered && (
              <div className="absolute start-full top-1/2 -translate-y-1/2 ms-2 z-50 pointer-events-none">
                <div className="bg-popover text-popover-foreground text-xs font-medium px-2.5 py-1.5 rounded-md shadow-lg border border-border whitespace-nowrap flex items-center gap-2">
                  {tool.label}
                  {tool.shortcut && (
                    <kbd className="text-[9px] text-muted-foreground bg-muted px-1 py-0.5 rounded font-mono">
                      {tool.shortcut}
                    </kbd>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        onClick={() => setLeftToolbarOpen(false)}
      >
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
