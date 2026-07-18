import type { CanvasState, CanvasType } from "./types";
import { getTemplate } from "./templates";

export function getCompletenessScore(
  canvasState: CanvasState,
  canvasType: string
): {
  total: number;
  filled: number;
  percentage: number;
  perSection: { sectionId: string; filled: boolean; count: number }[];
} {
  const template = getTemplate(canvasType as CanvasType);
  const total = template.sections.length;
  let filled = 0;
  const perSection = template.sections.map((s) => {
    const cards = canvasState[s.id] || [];
    const hasContent = cards.some((c) => c.content.trim().length > 0);
    if (hasContent) filled++;
    return { sectionId: s.id, filled: hasContent, count: cards.length };
  });

  return {
    total,
    filled,
    percentage: Math.round((filled / total) * 100),
    perSection,
  };
}
