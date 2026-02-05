"use client";

import { useProject } from "@/contexts/project-context";
import { CanvasProvider } from "@/components/dashboard/canvas/canvas-context";
import { CanvasBoard } from "@/components/dashboard/canvas/dnd-board";
import { 
  Loader2, LayoutGrid, Sparkles, Search, Eye, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useState } from "react";
// We need to keep some AI logic or move it to context. For now, let's keep it minimal and assume futurerefactor moves it.
// Actually, the AI logic (autoFillCanvas etc) depends on state which is now in Context.
// So we should ideally move that logic to the Context or a hook.
// But for this step, let's just render the Provider and Board, and maybe add the Header back.
// Wait, the Header buttons need access to the context to add cards (Auto Fill). 
// So the Header should be inside the Provider.

export default function CanvasPage() {
  const { activeProject: plan, loading } = useProject();

  if (loading || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // We wrap everything in CanvasProvider so children can access state
  return (
    <CanvasProvider>
        <CanvasPageContent plan={plan} />
    </CanvasProvider>
  );
}

function CanvasPageContent({ plan }: { plan: any }) {
    // This component is inside the provider, so it can access context if needed, 
    // or we can just let the Board handle everything.
    // However, the "Auto Fill" buttons were in the header.
    // To properly implement "Auto Fill", we need access to `addCard` or `setCanvasState` from context.

    // For this redesign, let's keep the layout simple: Header + Board.
    // We will re-implement the header actions later or assuming they are part of the Board component 
    // or we can move the Header into a separate component that uses `useCanvas`.

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <CanvasHeader plan={plan} />
            <div id="bmc-canvas" className="bg-card border border-border rounded-3xl p-4 md:p-6 overflow-hidden">
                <CanvasBoard />
            </div>
        </div>
    )
}


import { useCanvas } from "@/components/dashboard/canvas/canvas-context";

function CanvasHeader({ plan }: { plan: any }) {
    const { autoFillCanvas, isSaving } = useCanvas();

    return (
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <LayoutGrid size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">
              {plan.projectType === 'creator' ? 'بوم برند شخصی' :
               'بوم مدل کسب‌وکار'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {plan.projectType === 'creator' ? 'استراتژی برند و مخاطب' :
               'طراحی و اعتبارسنجی مدل کسب‌وکار (استاندارد ۹ بلوک)'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <Button 
                variant="shimmer" 
                size="sm" 
                onClick={autoFillCanvas} 
                disabled={isSaving}
            >
                {isSaving ? <Loader2 size={16} className="ml-2 animate-spin" /> : <Sparkles size={16} className="ml-2" />}
                پر کردن خودکار
            </Button>
        </div>
      </div>
    );
}


