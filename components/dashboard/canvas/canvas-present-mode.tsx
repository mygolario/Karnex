"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCanvasStore } from "@/lib/canvas/store";
import { getTemplate } from "@/lib/canvas/templates";
import { getIcon } from "@/lib/canvas/icon-map";
import { SECTION_COLOR_VARIANTS, CARD_COLOR_VARIANTS } from "@/lib/canvas/color-variants";
import { toPersianDigits } from "@/lib/utils";
import { toast } from "sonner";
import type { CardData, ChecklistItem } from "@/lib/canvas/types";

function getPresentableCards(cards: CardData[]): CardData[] {
  return cards.filter((c) => {
    if (c.content.trim().length > 0) return true;
    if (c.cardType === "CHECKLIST") {
      const items = (c.metadata?.items as ChecklistItem[] | undefined) ?? [];
      return items.some((item) => item.text.trim().length > 0);
    }
    return false;
  });
}

function PresentCard({ card }: { card: CardData }) {
  const variant = CARD_COLOR_VARIANTS[card.color] || CARD_COLOR_VARIANTS.blue;

  if (card.cardType === "CHECKLIST") {
    const items = (card.metadata?.items as ChecklistItem[] | undefined) ?? [];
    const visibleItems = items.filter((item) => item.text.trim().length > 0);
    if (visibleItems.length === 0) return null;

    return (
      <div
        className={cn(
          "p-5 rounded-2xl border shadow-md text-base leading-relaxed bg-gradient-to-br",
          variant.bg, variant.border, variant.text,
          variant.darkBg, variant.darkBorder, variant.darkText,
          variant.gradient,
        )}
      >
        <ul className="space-y-2">
          {visibleItems.map((item) => (
            <li key={item.id} className="flex items-start gap-2">
              <span className={cn("mt-1.5 h-2 w-2 rounded-full shrink-0", variant.dot)} />
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (!card.content.trim()) return null;

  return (
    <div
      className={cn(
        "p-5 rounded-2xl border shadow-md text-lg leading-relaxed bg-gradient-to-br whitespace-pre-wrap",
        variant.bg, variant.border, variant.text,
        variant.darkBg, variant.darkBorder, variant.darkText,
        variant.gradient,
      )}
    >
      {card.content}
      {card.isAIGenerated && (
        <span className="ms-2 text-xs text-purple-500 bg-purple-100 dark:bg-purple-500/20 px-2 py-0.5 rounded-full">
          AI
        </span>
      )}
    </div>
  );
}

export function CanvasPresentMode() {
  const canvasState = useCanvasStore((s) => s.canvasState);
  const canvasType = useCanvasStore((s) => s.canvasType);
  const canvasName = useCanvasStore((s) => s.canvasName);
  const [isActive, setIsActive] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const template = getTemplate(canvasType);

  const sectionsWithContent = useMemo(() => {
    return template.sections.filter((section) => {
      const cards = canvasState[section.id] || [];
      return getPresentableCards(cards).length > 0;
    });
  }, [template.sections, canvasState]);

  const currentSection = sectionsWithContent[currentIndex];
  const currentCards = currentSection
    ? getPresentableCards(canvasState[currentSection.id] || [])
    : [];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isActive]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const exitPresentation = useCallback(() => {
    setIsActive(false);
    setCurrentIndex(0);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
    setIsFullscreen(false);
  }, []);

  const startPresentation = useCallback(() => {
    if (sectionsWithContent.length === 0) {
      toast.error("حداقل یک بخش با محتوا لازم است تا ارائه شروع شود");
      return;
    }
    setCurrentIndex(0);
    setIsActive(true);
  }, [sectionsWithContent.length]);

  const nextSection = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, sectionsWithContent.length - 1));
  }, [sectionsWithContent.length]);

  const prevSection = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
      return;
    }
    document.documentElement.requestFullscreen?.().catch(() => {
      toast.error("تمام‌صفحه در این مرورگر در دسترس نیست");
    });
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "TEXTAREA" || target.tagName === "INPUT") return;

      if (e.key === "Escape") {
        e.preventDefault();
        exitPresentation();
        return;
      }

      if (e.key === " " || e.key === "ArrowLeft") {
        e.preventDefault();
        nextSection();
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        prevSection();
        return;
      }

      if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, nextSection, prevSection, exitPresentation, toggleFullscreen]);

  const overlay = isActive && mounted ? (
    <AnimatePresence>
      <motion.div
        key="canvas-presentation"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-background flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="حالت ارائه بوم"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <h2 className="text-lg font-bold truncate">{canvasName}</h2>
            <span className="text-sm text-muted-foreground tabular-nums shrink-0">
              {toPersianDigits(currentIndex + 1)} / {toPersianDigits(sectionsWithContent.length)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} title="تمام‌صفحه (F)">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={exitPresentation} title="خروج (Esc)">
              <X size={18} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex items-start justify-center p-8">
          <AnimatePresence mode="wait">
            {currentSection ? (
              <motion.div
                key={currentSection.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.25 }}
                className="max-w-3xl w-full py-4"
              >
                {(() => {
                  const variant = SECTION_COLOR_VARIANTS[currentSection.color] || SECTION_COLOR_VARIANTS.blue;
                  const Icon = getIcon(currentSection.icon);
                  return (
                    <div className="mb-6">
                      <div className={cn("inline-flex items-center gap-2 p-2 rounded-xl", variant.iconBg, variant.iconText)}>
                        <Icon size={24} />
                        <h1 className="text-3xl font-black">{currentSection.title}</h1>
                      </div>

                      {currentSection.description && (
                        <p className="text-muted-foreground text-lg mt-4">{currentSection.description}</p>
                      )}
                    </div>
                  );
                })()}

                <div className="space-y-3">
                  {currentCards.map((card, i) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                    >
                      <PresentCard card={card} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-muted-foreground py-20"
              >
                محتوایی برای نمایش وجود ندارد
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-border shrink-0">
          <Button variant="outline" onClick={prevSection} disabled={currentIndex === 0}>
            <ChevronRight className="ms-1" size={18} />
            قبلی
          </Button>

          <div className="flex items-center gap-1.5 max-w-[40vw] overflow-x-auto">
            {sectionsWithContent.map((section, i) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all shrink-0",
                  i === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted hover:bg-muted-foreground/50",
                )}
                title={section.title}
              />
            ))}
          </div>

          <Button
            variant="outline"
            onClick={nextSection}
            disabled={currentIndex >= sectionsWithContent.length - 1}
          >
            بعدی
            <ChevronLeft className="ms-1" size={18} />
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  ) : null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-8 gap-1.5"
        onClick={startPresentation}
        title="ارائه بوم"
        disabled={sectionsWithContent.length === 0}
      >
        <Maximize size={14} />
        <span className="hidden md:inline">ارائه</span>
      </Button>
      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
