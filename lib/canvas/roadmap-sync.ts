import type { RoadmapPhase, RoadmapStep } from "@/lib/db";
import type { ChecklistItem } from "./types";

export function getStepTitle(step: string | RoadmapStep): string {
  return typeof step === "string" ? step : step.title;
}

export function promoteCanvasCardToRoadmapTask(
  roadmap: RoadmapPhase[],
  taskTitle: string,
  phaseIndex = 0,
  options?: { description?: string; priority?: string; canvasCardId?: string; checklistItemId?: string }
): { roadmap: RoadmapPhase[]; stepId: string } {
  const updated = roadmap.map((p) => ({
    ...p,
    steps: [...p.steps],
  }));

  if (updated.length === 0) {
    updated.push({ phase: "فاز ۱", steps: [] });
  }

  const idx = Math.min(phaseIndex, updated.length - 1);
  const stepId = `canvas-${options?.canvasCardId ?? "card"}-${Date.now()}`;

  const newStep: RoadmapStep = {
    id: stepId,
    title: taskTitle,
    description: options?.description,
    priority: (options?.priority as RoadmapStep["priority"]) || "medium",
    status: "todo",
    tags: ["canvas"],
    notes: options?.checklistItemId ? `canvasItem:${options.checklistItemId}` : undefined,
  };

  updated[idx].steps.push(newStep);
  return { roadmap: updated, stepId };
}

export function syncChecklistItemFromRoadmapStep(
  items: ChecklistItem[],
  stepId: string,
  done: boolean
): ChecklistItem[] {
  return items.map((item) =>
    item.roadmapStepId === stepId ? { ...item, done } : item
  );
}

export function findChecklistItemByRoadmapStepId(
  canvasState: Record<string, Array<{ id: string; metadata?: Record<string, unknown> }>>,
  stepId: string
): { sectionId: string; cardId: string; itemId: string } | null {
  for (const [sectionId, cards] of Object.entries(canvasState)) {
    for (const card of cards) {
      const items = (card.metadata?.items as ChecklistItem[] | undefined) ?? [];
      const match = items.find((it) => it.roadmapStepId === stepId);
      if (match) return { sectionId, cardId: card.id, itemId: match.id };
    }
  }
  return null;
}
