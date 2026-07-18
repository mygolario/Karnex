"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useTourStore } from "@/lib/tour/store";
import { getTourWithDynamic } from "@/lib/tour/registry";
import { getCurrentStep, isCenteredStep, getStepRoute } from "@/lib/tour/engine";
import { waitForTarget, watchTarget } from "@/lib/tour/resolver";
import type { ResolvedTarget } from "@/lib/tour/types";
import {
  computeTooltipPosition,
  getSpotlightPadding,
  prefersReducedMotion,
} from "@/lib/tour/positioning";
import { TourTooltip } from "./tour-tooltip";
import {
  trackTourStarted,
  trackTourStep,
  trackTourSkipped,
  trackTourCompleted,
} from "@/lib/tour/analytics";
import { useTourKeyboard } from "./use-tour-keyboard";

export function TourOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isOpen,
    engine,
    nextStep,
    prevStep,
    skipTour,
    endTour,
    jumpToStep,
    setInteractiveWaiting,
    setPaused,
  } = useTourStore();

  const [target, setTarget] = useState<ResolvedTarget | null>(null);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);
  const reducedMotion = prefersReducedMotion();

  const tour = engine ? getTourWithDynamic(engine.tourId) : null;
  const step = getCurrentStep(engine);
  const centered = isCenteredStep(step);

  useEffect(() => setMounted(true), []);

  // Navigate to step route if needed
  useEffect(() => {
    if (!isOpen || !step || !tour) return;
    const route = getStepRoute(step, tour.route);
    if (route && pathname !== route) {
      router.push(route);
    }
  }, [isOpen, step?.id, tour?.id, pathname, router, step, tour]);

  // Resolve target when step changes
  useEffect(() => {
    if (!isOpen || !step) {
      setTarget(null);
      setReady(false);
      return;
    }

    let cancelled = false;
    setReady(false);

    const resolve = async () => {
      try {
        const resolved = await waitForTarget(step.target, centered, 6000);
        if (!cancelled) {
          setTarget(resolved);
          setReady(true);
          if (engine) {
            trackTourStep(engine.tourId, step.id, engine.stepIndex);
          }
        }
      } catch {
        if (!cancelled) {
          const { getCenterRect } = await import("@/lib/tour/resolver");
          setTarget(getCenterRect());
          setReady(true);
        }
      }
    };

    resolve();
    return () => {
      cancelled = true;
    };
  }, [isOpen, step?.id, centered, engine, step]);

  // Watch target rect updates
  useEffect(() => {
    if (!isOpen || !step || !ready) return;
    return watchTarget(step.target, centered, setTarget);
  }, [isOpen, step?.id, centered, ready, step]);

  // Track tour start once
  useEffect(() => {
    if (isOpen && engine && engine.stepIndex === 0) {
      trackTourStarted(engine.tourId, "overlay");
    }
  }, [isOpen, engine?.tourId, engine?.stepIndex, engine]);

  // Interactive step listener
  useEffect(() => {
    if (!isOpen || !step || step.type !== "interactive") return;

    const actionTarget = step.actionTarget ?? step.target;
    if (!actionTarget) return;

    setInteractiveWaiting(true);

    const selector = actionTarget.startsWith("[")
      ? actionTarget
      : `[data-tour-id="${actionTarget}"]`;

    const handler = () => {
      setInteractiveWaiting(false);
      setTimeout(() => nextStep(), 400);
    };

    const attach = () => {
      const el = document.querySelector(selector);
      if (el) {
        el.addEventListener(step.actionEvent ?? "click", handler, { once: true });
        return () => el.removeEventListener(step.actionEvent ?? "click", handler);
      }
      return undefined;
    };

    let cleanup = attach();
    const timer = setInterval(() => {
      cleanup?.();
      cleanup = attach();
    }, 300);

    return () => {
      clearInterval(timer);
      cleanup?.();
    };
  }, [isOpen, step?.id, step, setInteractiveWaiting, nextStep]);

  // Pause on tab blur
  useEffect(() => {
    const onVisibility = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [setPaused]);

  const handleNext = useCallback(() => {
    if (!engine) return;
    if (step?.type === "interactive" && engine.isInteractiveWaiting) {
      setInteractiveWaiting(false);
    }
    if (engine.stepIndex >= engine.steps.length - 1) {
      trackTourCompleted(engine.tourId, engine.steps.length);
      endTour(true);
    } else {
      nextStep();
    }
  }, [engine, step, endTour, nextStep, setInteractiveWaiting]);

  const handleSkipTour = useCallback(() => {
    if (engine) trackTourSkipped(engine.tourId, engine.stepIndex);
    skipTour();
  }, [engine, skipTour]);

  useTourKeyboard({
    enabled: isOpen && ready,
    onNext: handleNext,
    onPrev: prevStep,
    onSkip: handleSkipTour,
  });

  if (!mounted || !isOpen || !engine || !tour || !step || !target || !ready) {
    return null;
  }

  const padding = getSpotlightPadding(step);
  const spotlightRect = centered
    ? null
    : {
        x: target.rect.left - padding,
        y: target.rect.top - padding,
        w: target.rect.width + padding * 2,
        h: target.rect.height + padding * 2,
      };

  const tooltipPos = computeTooltipPosition(
    target.rect,
    step.position ?? "auto",
    step.offset ?? 0,
    !!step.media,
    centered
  );

  const maskId = "karnex-tour-spotlight-mask";
  const clipPathStyle = spotlightRect && step.type === "interactive"
    ? {
        clipPath: `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${spotlightRect.x}px ${spotlightRect.y}px, ${spotlightRect.x + spotlightRect.w}px ${spotlightRect.y}px, ${spotlightRect.x + spotlightRect.w}px ${spotlightRect.y + spotlightRect.h}px, ${spotlightRect.x}px ${spotlightRect.y + spotlightRect.h}px, ${spotlightRect.x}px ${spotlightRect.y}px)`
      }
    : undefined;

  return createPortal(
    <div className="fixed inset-0 z-[10000] pointer-events-none" dir="rtl" aria-hidden={false}>
      {/* SVG overlay with cutout — dark-mode aware dim + subtle blur backdrop */}
      <svg className={`absolute inset-0 w-full h-full backdrop-blur-[2px] ${step.type === "interactive" ? "pointer-events-none" : "pointer-events-auto"}`}>
        <defs>
          <mask id={maskId}>
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {spotlightRect && (
              <rect
                x={spotlightRect.x}
                y={spotlightRect.y}
                width={spotlightRect.w}
                height={spotlightRect.h}
                rx="14"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          className="fill-black/45 dark:fill-black/70"
          mask={`url(#${maskId})`}
        />
      </svg>

      {/* Animated highlight ring */}
      {spotlightRect && (
        <motion.div
          className="absolute pointer-events-none rounded-xl ring-2 ring-primary/70"
          initial={false}
          animate={{
            top: spotlightRect.y,
            left: spotlightRect.x,
            width: spotlightRect.w,
            height: spotlightRect.h,
            boxShadow: "0 0 0 4px rgba(99, 102, 241, 0.12), 0 0 28px 6px rgba(99, 102, 241, 0.35)",
          }}
          transition={
            reducedMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 200, damping: 30 }
          }
        />
      )}

      {/* Click blocker */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={clipPathStyle}
        onClick={(e) => e.stopPropagation()}
      />

      <TourTooltip
        tour={tour}
        step={step}
        stepIndex={engine.stepIndex}
        totalSteps={engine.steps.length}
        position={tooltipPos}
        isInteractiveWaiting={engine.isInteractiveWaiting}
        onNext={handleNext}
        onPrev={prevStep}
        onSkip={handleSkipTour}
        onSkipTour={handleSkipTour}
        onJumpToStep={jumpToStep}
      />
    </div>,
    document.body
  );
}
