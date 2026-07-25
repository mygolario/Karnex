"use client";

import { useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { useProject } from "@/contexts/project-context";
import { CanvasProvider } from "@/components/dashboard/canvas/canvas-provider";
import { CanvasTopBar } from "@/components/dashboard/canvas/canvas-topbar";
import { CanvasToolbar } from "@/components/dashboard/canvas/canvas-toolbar";
import { CanvasRightPanel } from "@/components/dashboard/canvas/canvas-right-panel";
import { CanvasMinimap } from "@/components/dashboard/canvas/canvas-minimap";
import { CanvasCommandPalette } from "@/components/dashboard/canvas/canvas-command-palette";
import { CanvasExportDialog } from "@/components/dashboard/canvas/canvas-export-dialog";
import { CanvasWizard } from "@/components/dashboard/canvas/canvas-wizard";
import { Loader2, ZoomIn, ZoomOut, Maximize2, PanelRightOpen, Mouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/lib/canvas/store";
import { CanvasViewportProvider, useCanvasViewport } from "@/components/dashboard/canvas/canvas-viewport-context";
import { PageTourHelp } from "@/components/tour/page-tour-help";
import { useImmersivePage } from "@/hooks/use-immersive-page";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { EmptyProjectState } from "@/components/dashboard/empty-project-state";

// The board pulls in dnd-kit and react-zoom-pan-pinch — a large chunk that
// nothing else on the route needs before the canvas itself is on screen.
const CanvasBoard = dynamic(
  () =>
    import("@/components/dashboard/canvas/canvas-board").then((m) => m.CanvasBoard),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    ),
  }
);

export default function CanvasPage() {
  const { activeProject: plan, loading } = useProject();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan) {
    return (
      <EmptyProjectState
        title="برای بوم کسب‌وکار به پروژه نیاز داری"
        description="اول یک پروژه بساز تا بوم، بلوک‌ها و تحلیل کسب‌وکارت اینجا باز شود."
      />
    );
  }

  return (
    <CanvasProvider>
      <CanvasViewportProvider>
        <CanvasPageContent />
      </CanvasViewportProvider>
    </CanvasProvider>
  );
}

function ZoomControls() {
  const { zoomIn, zoomOut, zoomReset, zoomToFit } = useCanvasViewport();
  const viewport = useCanvasStore((s) => s.viewport);
  const scrollZoomEnabled = useCanvasStore((s) => s.scrollZoomEnabled);
  const setScrollZoomEnabled = useCanvasStore((s) => s.setScrollZoomEnabled);

  return (
    <div className="absolute z-20 flex gap-1 bg-background/90 backdrop-blur-xl border border-border rounded-xl p-1 shadow-lg canvas-export-exclude bottom-3 end-3 flex-row items-center md:start-3 md:end-auto md:flex-col md:items-stretch">
      <Button
        variant={scrollZoomEnabled ? "secondary" : "ghost"}
        size="icon"
        className="h-11 w-11 hidden md:inline-flex"
        onClick={() => setScrollZoomEnabled(!scrollZoomEnabled)}
        title={scrollZoomEnabled ? "غیرفعال کردن زوم با اسکرول" : "فعال کردن زوم با اسکرول"}
      >
        <Mouse size={15} />
      </Button>
      <Button variant="ghost" size="icon" className="h-11 w-11" onClick={zoomIn} title="بزرگ‌نمایی (+)">
        <ZoomIn size={15} />
      </Button>
      <div className="text-center text-[10px] font-bold text-muted-foreground tabular-nums py-0.5 px-1 min-w-[2.5rem]">
        {Math.round(viewport.zoom * 100)}%
      </div>
      <Button variant="ghost" size="icon" className="h-11 w-11" onClick={zoomOut} title="کوچک‌نمایی (-)">
        <ZoomOut size={15} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 md:hidden"
        onClick={zoomToFit}
        title="نمایش کل بوم"
      >
        <Maximize2 size={15} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-11 w-11 hidden md:inline-flex"
        onClick={zoomReset}
        title="بازنشانی نما (0)"
      >
        <Maximize2 size={15} />
      </Button>
    </div>
  );
}

function MobilePanelToggle() {
  const setRightPanelOpen = useCanvasStore((s) => s.setRightPanelOpen);
  const rightPanelOpen = useCanvasStore((s) => s.rightPanelOpen);
  const selectedCardIds = useCanvasStore((s) => s.selectedCardIds);

  if (selectedCardIds.length === 0 && !rightPanelOpen) return null;

  return (
    <Button
      variant="default"
      size="sm"
      className="md:hidden absolute bottom-3 start-3 z-20 shadow-lg mobile-touch-target"
      onClick={() => setRightPanelOpen(true)}
    >
      <PanelRightOpen size={16} className="me-1" />
      جزئیات
    </Button>
  );
}

function CanvasPageContent() {
  const boardRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const viewMode = useCanvasStore((s) => s.viewMode);
  const { zoomToFit } = useCanvasViewport();
  useImmersivePage(isMobile);

  useEffect(() => {
    if (viewMode === "freeform") {
      useCanvasStore.setState({ viewMode: "grid" });
    }
  }, [viewMode]);

  // Land on the whole board rather than the top-right corner of a 1250px grid.
  useEffect(() => {
    if (!isMobile) return;
    const timer = window.setTimeout(zoomToFit, 350);
    return () => window.clearTimeout(timer);
  }, [isMobile, zoomToFit]);

  return (
    <div
      className="flex flex-col h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-4rem)]"
      data-tour-id="canvas-page"
    >
      <CanvasTopBar />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="hidden md:flex">
          <CanvasToolbar />
        </div>

        <div className="relative flex-1 overflow-hidden">
          <CanvasBoard boardRef={boardRef} />
          <div className="hidden md:block">
            <CanvasMinimap />
          </div>
          <ZoomControls />
          <MobilePanelToggle />

          <div className="absolute top-3 end-3 z-10 canvas-export-exclude">
            <PageTourHelp tourId="canvas" />
          </div>
        </div>

        <CanvasRightPanel />
      </div>

      <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl px-2 py-1.5 safe-bottom">
        <CanvasToolbar mobile />
      </div>

      <CanvasCommandPalette />
      <CanvasExportDialog />
      <CanvasWizard />
    </div>
  );
}
