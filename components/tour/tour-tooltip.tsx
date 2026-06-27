"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn, toPersianDigits } from "@/lib/utils";
import { ArrowLeft, ArrowRight, X, Check, List, Lightbulb } from "lucide-react";
import type { TourDefinition, TourStep } from "@/lib/tour/types";
import { ACCENT_CLASSES } from "@/lib/tour/registry";
import { tourI18n } from "@/lib/tour/i18n";
import { TourMascot } from "./tour-mascot";
import type { TooltipPosition } from "@/lib/tour/positioning";
import { prefersReducedMotion } from "@/lib/tour/positioning";

interface TourTooltipProps {
  tour: TourDefinition;
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  position: TooltipPosition;
  isInteractiveWaiting?: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onSkipTour: () => void;
  onJumpToStep: (index: number) => void;
}

export function TourTooltip({
  tour,
  step,
  stepIndex,
  totalSteps,
  position,
  isInteractiveWaiting,
  onNext,
  onPrev,
  onSkip,
  onSkipTour,
  onJumpToStep,
}: TourTooltipProps) {
  const accent = ACCENT_CLASSES[tour.accent] ?? ACCENT_CLASSES.primary;
  const isLast = stepIndex === totalSteps - 1;
  const isInteractive = step.type === "interactive";
  const hasMedia = !!step.media;
  const [showStepMap, setShowStepMap] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const focusable = el.querySelector<HTMLElement>(
      'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();
  }, [step.id]);

  const cardWidth = position.isMobileSheet
    ? "w-[calc(100vw-2rem)]"
    : hasMedia
      ? "w-[420px]"
      : "w-[360px]";

  return (
    <AnimatePresence mode="wait">
      <motion.div
        ref={cardRef}
        key={step.id}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`tour-step-title-${step.id}`}
        aria-describedby={`tour-step-desc-${step.id}`}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.96 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
        transition={{ duration: reducedMotion ? 0.1 : 0.25 }}
        className={cn(
          "fixed pointer-events-auto z-[10001] rounded-3xl overflow-hidden",
          "bg-card/95 backdrop-blur-xl border border-white/10 shadow-2xl",
          cardWidth,
          position.isMobileSheet && "start-4 end-4 mx-auto"
        )}
        style={
          position.isMobileSheet
            ? { top: position.top, transform: position.transform }
            : { top: position.top, left: position.left, transform: position.transform }
        }
        dir="rtl"
      >
        {/* Accent strip */}
        <div className={cn("h-1 w-full bg-gradient-to-l", accent.gradient)} />

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-start gap-3 min-w-0">
              <TourMascot mood={step.mood ?? "tip"} size="sm" />
              <div className="min-w-0">
                <p className={cn("text-[10px] font-bold mb-0.5", accent.text)}>
                  {tour.title}
                </p>
                <h3
                  id={`tour-step-title-${step.id}`}
                  className="text-lg font-bold text-foreground leading-snug"
                >
                  {step.title}
                </h3>
              </div>
            </div>
            <button
              onClick={onSkipTour}
              className="text-muted-foreground hover:text-foreground shrink-0 p-1 rounded-lg hover:bg-muted/50"
              aria-label={tourI18n.skipTour}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Media */}
          {step.media && (
            <div className="mb-3 rounded-xl overflow-hidden border border-border/50 bg-muted/30">
              {step.media.type === "video" ? (
                <video
                  src={step.media.src}
                  className="w-full h-36 object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={step.media.src}
                  alt={step.media.alt ?? step.title}
                  className="w-full h-36 object-cover"
                />
              )}
            </div>
          )}

          <p
            id={`tour-step-desc-${step.id}`}
            className="text-sm text-muted-foreground leading-relaxed mb-3"
          >
            {step.description}
          </p>

          {step.proTip && (
            <div className="flex gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-3">
              <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
                {step.proTip}
              </p>
            </div>
          )}

          {isInteractive && isInteractiveWaiting && (
            <div className={cn("text-xs font-medium px-3 py-2 rounded-lg mb-3", accent.bg, accent.text)}>
              {tourI18n.waitingAction}
            </div>
          )}

          {/* Segmented progress */}
          <div className="flex gap-1 mb-4">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onJumpToStep(i)}
                className={cn(
                  "h-1 flex-1 rounded-full transition-all",
                  i <= stepIndex ? "bg-primary" : "bg-muted",
                  i === stepIndex && "ring-1 ring-primary/40"
                )}
                aria-label={`${tourI18n.stepOf(i + 1, totalSteps)}`}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {toPersianDigits(tourI18n.stepOf(stepIndex + 1, totalSteps))}
              </span>
              <button
                type="button"
                onClick={() => setShowStepMap((v) => !v)}
                className="p-1 rounded-md hover:bg-muted/50 text-muted-foreground"
                title="مسیر کامل"
              >
                <List size={14} />
              </button>
              <span className="hidden sm:inline text-[10px] text-muted-foreground/70">
                {tourI18n.keyboardHint}
              </span>
            </div>

            <div className="flex gap-2">
              {stepIndex > 0 && (
                <Button size="sm" variant="ghost" onClick={onPrev}>
                  <ArrowRight className="w-3 h-3 ms-1" />
                  {tourI18n.prev}
                </Button>
              )}
              {!isInteractive && (
                <Button size="sm" variant="ghost" onClick={onSkip}>
                  {tourI18n.skip}
                </Button>
              )}
              <Button
                size="sm"
                onClick={onNext}
                disabled={isInteractive && isInteractiveWaiting}
                className={cn("text-white shadow-glow bg-gradient-to-l", accent.gradient)}
              >
                {isLast ? (
                  <>
                    {tourI18n.finish}
                    <Check className="w-3 h-3 me-1" />
                  </>
                ) : isInteractive ? (
                  tourI18n.tryIt
                ) : (
                  <>
                    {tourI18n.next}
                    <ArrowLeft className="w-3 h-3 me-1" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {showStepMap && (
            <div className="mt-3 pt-3 border-t border-border/50 space-y-1 max-h-32 overflow-y-auto">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onJumpToStep(i);
                    setShowStepMap(false);
                  }}
                  className={cn(
                    "w-full text-start text-xs px-2 py-1.5 rounded-lg hover:bg-muted/50",
                    i === stepIndex && accent.bg
                  )}
                >
                  {toPersianDigits(i + 1)}. {/* step titles would need passing - skip for now */}
                  {i === stepIndex ? " (فعلی)" : ""}
                </button>
              ))}
            </div>
          )}

          {isLast && tour.helpCenterHref && (
            <Link
              href={tour.helpCenterHref}
              className={cn("block text-center text-xs mt-3 hover:underline", accent.text)}
            >
              {tourI18n.readMoreHelp} →
            </Link>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
