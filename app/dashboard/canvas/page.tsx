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

import { useCanvas } from "@/components/dashboard/canvas/canvas-context";
import { useCanvasWizard } from "@/hooks/use-canvas-wizard";
import { CanvasWizard } from "@/components/dashboard/canvas/canvas-wizard";

import { PageTourHelp } from "@/components/features/onboarding/page-tour-help";

function CanvasHeader({ plan, onOpenWizard }: { plan: any, onOpenWizard: () => void }) {
    const { autoFillCanvas, isSaving } = useCanvas();

    return (
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4" data-tour-id="canvas-header">
        <div className="flex items-center gap-4">
          <PageTourHelp tourId="canvas" />
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <LayoutGrid size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground">
              تحلیل کسب و کار
            </h1>
            <p className="text-muted-foreground text-sm">
              نقشه‌ای یک‌صفحه‌ای که در یک نگاه نشان می‌دهد ایده شما چطور کار می‌کند و چگونه به درآمد می‌رسد.
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <Button 
                variant="default" // Primary action
                size="sm" 
                onClick={onOpenWizard}
                className="shadow-lg shadow-primary/20"
            >
                <Sparkles size={16} className="ml-2" />
                راهنمای هوشمند
            </Button>
            
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={autoFillCanvas} 
                disabled={isSaving}
                className="text-muted-foreground"
                data-tour-id="ai-auto-fill"
            >
                {isSaving ? <Loader2 size={16} className="ml-2 animate-spin" /> : <Eye size={16} className="ml-2" />}
                نمونه خودکار
            </Button>
        </div>
      </div>
    );
}

function CanvasPageContent({ plan }: { plan: any }) {
    const wizard = useCanvasWizard();

    // Mapping for Focus Mode:
    // The wizard steps rely on IDs like "customer_segments"
    // The Board uses IDs like "customerSegments" (camelCase)
    // We need to map them if they differ.
    // Checking `dnd-board.tsx`: 
    // BMC_LAYOUT uses camelCase: customerSegments, valueProposition, etc.
    // Checking `use-canvas-wizard.ts`:
    // It uses snake_case: customer_segments, value_propositions.
    // We need a mapper.

    const activeSectionId = wizard.isOpen ? wizard.currentStep.id : undefined;

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <CanvasHeader plan={plan} onOpenWizard={wizard.openWizard} />
            
            <div id="bmc-canvas" className="bg-card border border-border rounded-3xl p-4 md:p-6 overflow-x-auto min-h-[800px]" data-tour-id="canvas-board">
                <CanvasBoard highlightedSectionId={activeSectionId} />
            </div>

            <CanvasWizard 
                isOpen={wizard.isOpen}
                currentStep={wizard.currentStep}
                currentStepIndex={wizard.currentStepIndex}
                totalSteps={wizard.totalSteps}
                currentInput={wizard.currentInput}
                onInputChange={wizard.setCurrentInput}
                onNext={wizard.nextStep}
                onSkip={wizard.skipStep}
                onPrev={wizard.prevStep}
                onClose={wizard.closeWizard}
            />
        </div>
    )
}


