"use client";

import { Button } from "@/components/ui/button";
import { useLocation } from "./location-context";
import { useProject } from "@/contexts/project-context";
import {
  GitCompare,
  Download,
  MessageSquare,
  ListPlus,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";
import { exportLocationPdf } from "@/lib/location/pdf-export";
import {
  syncLocationFinancialsToProject,
  syncLocationSwotToCanvas,
  buildOpeningContentPrompt,
} from "@/lib/location/integrations";
import { useRouter } from "next/navigation";

interface QuickActionStripProps {
  onOpenChat?: () => void;
}

export function QuickActionStrip({ onOpenChat }: QuickActionStripProps) {
  const {
    analysis,
    addToComparison,
    comparisonItems,
  } = useLocation();
  const { activeProject, updateActiveProject } = useProject();
  const router = useRouter();

  if (!analysis) return null;

  const inCompare = comparisonItems.some((c) => c.createdAt === analysis.createdAt);

  const handleExport = async () => {
    try {
      await exportLocationPdf(analysis, activeProject?.projectName || "Karnex");
      toast.success("PDF دانلود شد");
    } catch {
      toast.error("خطا در ساخت PDF");
    }
  };

  const pushTopRecommendation = async () => {
    const top = analysis.prioritizedRecommendations?.[0];
    if (!top || !activeProject) {
      toast.error("توصیه‌ای برای افزودن نیست");
      return;
    }
    const roadmap = activeProject.roadmap || [];
    const phase = roadmap[0];
    if (!phase) {
      toast.error("نقشه راه خالی است");
      return;
    }
    const newStep = {
      id: `loc-${Date.now()}`,
      title: top.title,
      description: top.desc,
      status: "pending" as const,
    };
    const updated = [...roadmap];
    updated[0] = { ...phase, steps: [...(phase.steps || []), newStep] };
    await updateActiveProject({ roadmap: updated });
    toast.success("به نقشه راه اضافه شد");
  };

  const syncFinancials = async () => {
    if (!activeProject) return;
    const patch = syncLocationFinancialsToProject(activeProject, analysis);
    await updateActiveProject(patch);
    toast.success("سناریوی مالی به پروژه اعمال شد");
  };

  const syncCanvas = async () => {
    if (!activeProject) return;
    const patch = syncLocationSwotToCanvas(activeProject, analysis);
    await updateActiveProject(patch);
    toast.success("SWOT با بوم همگام شد");
  };

  const openContent = () => {
    const prompt = buildOpeningContentPrompt(analysis);
    router.push(`/dashboard/growth?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <div className="flex flex-wrap gap-2 dir-rtl">
      <Button
        variant="outline"
        size="sm"
        className="h-8 text-xs gap-1.5"
        disabled={inCompare}
        onClick={() => addToComparison(analysis)}
      >
        <GitCompare size={14} />
        مقایسه ({comparisonItems.length}/3)
      </Button>
      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={handleExport}>
        <Download size={14} />
        PDF
      </Button>
      {onOpenChat && (
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={onOpenChat}>
          <MessageSquare size={14} />
          پرسش از AI
        </Button>
      )}
      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={pushTopRecommendation}>
        <ListPlus size={14} />
        نقشه راه
      </Button>
      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={syncCanvas}>
        <Bookmark size={14} />
        همگام SWOT
      </Button>
      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={syncFinancials}>
        همگام مالی
      </Button>
      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={openContent}>
        محتوای افتتاح
      </Button>
    </div>
  );
}
