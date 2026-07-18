"use client";

import { useRef, useEffect } from "react";
import { useProject } from "@/contexts/project-context";
import { CanvasProvider } from "@/components/dashboard/canvas/canvas-provider";
import { CanvasTopBar } from "@/components/dashboard/canvas/canvas-topbar";
import { CanvasToolbar } from "@/components/dashboard/canvas/canvas-toolbar";
import { CanvasBoard } from "@/components/dashboard/canvas/canvas-board";
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
import { cn } from "@/lib/utils";
import { EmptyProjectState } from "@/components/dashboard/empty-project-state";

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

function ZoomControls({ mobile }: { mobile?: boolean }) {
  const { zoomIn, zoomOut, zoomReset } = useCanvasViewport();
  const viewport = useCanvasStore((s) => s.viewport);
  const scrollZoomEnabled = useCanvasStore((s) => s.scrollZoomEnabled);
  const setScrollZoomEnabled = useCanvasStore((s) => s.setScrollZoomEnabled);

  return (
    <div className={cn(
      "absolute z-20 flex gap-1 bg-background/90 backdrop-blur-xl border border-border rounded-xl p-1 shadow-lg canvas-export-exclude",
      mobile ? "bottom-3 end-3 flex-row items-center" : "bottom-3 start-3 flex-col"
    )}>
      <Button
        variant={scrollZoomEnabled ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8 mobile-touch-target"
        onClick={() => setScrollZoomEnabled(!scrollZoomEnabled)}
        title={scrollZoomEnabled ? "غیرفعال کردن زوم با اسکرول" : "فعال کردن زوم با اسکرول"}
      >
        <Mouse size={15} />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 mobile-touch-target" onClick={zoomIn} title="بزرگ‌نمایی (+)">
        <ZoomIn size={15} />
      </Button>
      <div className="text-center text-[10px] font-bold text-muted-foreground tabular-nums py-0.5 px-1">
        {Math.round(viewport.zoom * 100)}%
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 mobile-touch-target" onClick={zoomOut} title="کوچک‌نمایی (-)">
        <ZoomOut size={15} />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8 mobile-touch-target" onClick={zoomReset} title="بازنشانی نما (0)">
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
      className="absolute bottom-3 start-3 z-20 shadow-lg mobile-touch-target"
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
  useImmersivePage(isMobile);

  useEffect(() => {
    if (viewMode === "freeform") {
      useCanvasStore.setState({ viewMode: "grid" });
    }
  }, [viewMode]);

  return (
    <div
      className={cn(
        "flex flex-col mobile-immersive -mx-4 -mt-3",
        isMobile ? "h-[calc(100dvh-3.5rem)]" : "h-[calc(100vh-3.5rem)]"
      )}
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
          <ZoomControls mobile={isMobile} />
          {isMobile && <MobilePanelToggle />}

          <div className="absolute top-3 end-3 z-10 canvas-export-exclude">
            <PageTourHelp tourId="canvas" />
          </div>
        </div>

        <CanvasRightPanel />
      </div>

      {isMobile && (
        <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl px-2 py-1.5 safe-bottom">
          <CanvasToolbar mobile />
        </div>
      )}

      <CanvasCommandPalette />
      <CanvasExportDialog />
      <CanvasWizard />
    </div>
  );
}
