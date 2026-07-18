"use client";

import { createContext, useCallback, useContext, useRef } from "react";
import type { ReactZoomPanPinchRef } from "react-zoom-pan-pinch";

export const CANVAS_ZOOM = {
  MIN: 0.1,
  MAX: 4,
  BUTTON_STEP: 0.1,
  WHEEL_STEP: 0.035,
  ANIMATION_MS: 280,
} as const;

interface CanvasViewportController {
  registerTransform: (ref: ReactZoomPanPinchRef | null) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomReset: () => void;
}

const CanvasViewportContext = createContext<CanvasViewportController | null>(null);

export function CanvasViewportProvider({ children }: { children: React.ReactNode }) {
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  const registerTransform = useCallback((ref: ReactZoomPanPinchRef | null) => {
    transformRef.current = ref;
  }, []);

  const zoomIn = useCallback(() => {
    transformRef.current?.zoomIn(CANVAS_ZOOM.BUTTON_STEP, CANVAS_ZOOM.ANIMATION_MS);
  }, []);

  const zoomOut = useCallback(() => {
    transformRef.current?.zoomOut(CANVAS_ZOOM.BUTTON_STEP, CANVAS_ZOOM.ANIMATION_MS);
  }, []);

  const zoomReset = useCallback(() => {
    transformRef.current?.centerView(1, CANVAS_ZOOM.ANIMATION_MS);
  }, []);

  return (
    <CanvasViewportContext.Provider value={{ registerTransform, zoomIn, zoomOut, zoomReset }}>
      {children}
    </CanvasViewportContext.Provider>
  );
}

export function useCanvasViewport() {
  const ctx = useContext(CanvasViewportContext);
  if (!ctx) throw new Error("useCanvasViewport must be used within CanvasViewportProvider");
  return ctx;
}
