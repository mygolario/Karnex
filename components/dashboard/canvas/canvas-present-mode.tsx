"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/lib/canvas/store";
import { getTemplate } from "@/lib/canvas/templates";
import { getIcon } from "@/lib/canvas/icon-map";
import { SECTION_COLOR_VARIANTS } from "@/lib/canvas/color-variants";
import { toPersianDigits } from "@/lib/utils";

export function CanvasPresentMode() {
  const canvasState = useCanvasStore((s) => s.canvasState);
  const canvasType = useCanvasStore((s) => s.canvasType);
  const canvasName = useCanvasStore((s) => s.canvasName);
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const template = getTemplate(canvasType);
  const filledSections = template.sections.filter((s) => {
    const cards = canvasState[s.id] || [];
    return cards.some((c) => c.content.trim().length > 0);
  });

  const currentSection = filledSections[currentIndex];
  const currentCards = currentSection ? (canvasState[currentSection.id] || []) : [];

  const startPresentation = useCallback(() => {
    setIsActive(true);
    setCurrentIndex(0);
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    }
  }, []);

  const exitPresentation = useCallback(() => {
    setIsActive(false);
    if (isFullscreen && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  const nextSection = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, filledSections.length - 1));
  }, [filledSections.length]);

  const prevSection = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") exitPresentation();
      if (e.key === "ArrowRight" || e.key === " ") nextSection();
      if (e.key === "ArrowLeft") prevSection();
      if (e.key === "f" || e.key === "F") {
        if (isFullscreen) {
          document.exitFullscreen?.();
          setIsFullscreen(false);
        } else {
          document.documentElement.requestFullscreen?.();
          setIsFullscreen(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, nextSection, prevSection, exitPresentation, isFullscreen]);

  if (!isActive) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5"
        onClick={startPresentation}
        title="Present"
      >
        <Maximize size={14} />
        <span className="hidden md:inline">ارائه</span>
      </Button>
    );
  }

  const variant = currentSection
    ? SECTION_COLOR_VARIANTS[currentSection.color] || SECTION_COLOR_VARIANTS.blue
    : SECTION_COLOR_VARIANTS.blue;
  const Icon = getIcon(currentSection?.icon || "Sparkles");

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-background flex flex-col"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">{canvasName}</h2>
            <span className="text-sm text-muted-foreground">
              {toPersianDigits(currentIndex + 1)} / {toPersianDigits(filledSections.length)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => { if (isFullscreen) { document.exitFullscreen?.(); setIsFullscreen(false); } else { document.documentElement.requestFullscreen?.(); setIsFullscreen(true); } }}>
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={exitPresentation}>
              <X size={18} />
            </Button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8 overflow-hidden">
          {currentSection && (
            <motion.div
              key={currentSection.id}
              initial={{ opacity: 0, scale: 0.95, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="max-w-3xl w-full"
            >
              <div className={cn("inline-flex items-center gap-2 p-2 rounded-xl mb-6", variant.iconBg, variant.iconText)}>
                <Icon size={24} />
                <h1 className="text-3xl font-black">{currentSection.title}</h1>
              </div>

              {currentSection.description && (
                <p className="text-muted-foreground text-lg mb-8">{currentSection.description}</p>
              )}

              <div className="space-y-3">
                {currentCards.map((card, i) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "p-5 rounded-2xl border shadow-md text-lg leading-relaxed",
                      "bg-gradient-to-br",
                    )}
                  >
                    {card.content}
                    {card.isAIGenerated && (
                      <span className="ms-2 text-xs text-purple-500 bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 rounded-full">AI</span>
                    )}
                  </motion.div>
                ))}
                {currentCards.length === 0 && (
                  <p className="text-muted-foreground text-center py-12">این بخش خالی است</p>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <Button variant="outline" onClick={prevSection} disabled={currentIndex === 0}>
            <ChevronRight className="ms-1" size={18} />
            قبلی
          </Button>

          <div className="flex items-center gap-1.5">
            {filledSections.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          <Button variant="outline" onClick={nextSection} disabled={currentIndex >= filledSections.length - 1}>
            بعدی
            <ChevronLeft className="ms-1" size={18} />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
