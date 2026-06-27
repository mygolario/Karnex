"use client";

import { useEffect } from "react";

interface UseTourKeyboardOptions {
  enabled: boolean;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onToggleBeacons?: () => void;
}

export function useTourKeyboard({
  enabled,
  onNext,
  onPrev,
  onSkip,
  onToggleBeacons,
}: UseTourKeyboardOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          onNext();
          break;
        case "ArrowRight":
          e.preventDefault();
          onPrev();
          break;
        case "Escape":
          e.preventDefault();
          onSkip();
          break;
        case "?":
          if (onToggleBeacons) {
            e.preventDefault();
            onToggleBeacons();
          }
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onNext, onPrev, onSkip, onToggleBeacons]);
}
