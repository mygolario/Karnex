import type { CanvasState } from "./types";
import { getTemplate } from "./templates";
import type { CanvasType } from "./types";

export async function exportCanvasAsImage(
  element: HTMLElement,
  format: "png" | "jpeg" | "svg",
  fileName: string = "canvas"
): Promise<void> {
  const { toPng, toSvg, toJpeg } = await import("html-to-image");

  const options = {
    quality: 0.95,
    backgroundColor:
      getComputedStyle(document.body).colorScheme === "dark" ? "#0a0a0a" : "#ffffff",
    pixelRatio: 2,
    filter: (node: HTMLElement) => {
      return !node?.classList?.contains("canvas-export-exclude");
    },
  };

  let dataUrl: string;
  if (format === "svg") {
    dataUrl = await toSvg(element, options);
  } else if (format === "jpeg") {
    dataUrl = await toJpeg(element, { ...options, quality: 0.95 });
  } else {
    dataUrl = await toPng(element, options);
  }

  const link = document.createElement("a");
  link.download = `${fileName}.${format}`;
  link.href = dataUrl;
  link.click();
}

export async function exportCanvasAsPDF(
  element: HTMLElement,
  fileName: string = "canvas"
): Promise<void> {
  const { toPng } = await import("html-to-image");
  const { default: jsPDF } = await import("jspdf");

  const dataUrl = await toPng(element, {
    quality: 0.95,
    pixelRatio: 2,
    filter: (node: HTMLElement) => {
      return !node?.classList?.contains("canvas-export-exclude");
    },
  });

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [element.scrollWidth, element.scrollHeight],
  });

  pdf.addImage(dataUrl, "PNG", 0, 0, element.scrollWidth, element.scrollHeight);
  pdf.save(`${fileName}.pdf`);
}

export function exportCanvasAsJSON(
  canvasState: CanvasState,
  canvasType: string,
  canvasName: string
): void {
  const data = {
    name: canvasName,
    type: canvasType,
    exportedAt: new Date().toISOString(),
    sections: Object.entries(canvasState).map(([sectionId, cards]) => ({
      sectionId,
      cards: cards.map((c) => ({
        content: c.content,
        color: c.color,
        cardType: c.cardType,
        tags: c.tags,
        isAIGenerated: c.isAIGenerated,
      })),
    })),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = `${canvasName || "canvas"}.json`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

export function exportCanvasAsMarkdown(
  canvasState: CanvasState,
  canvasType: string,
  canvasName: string
): void {
  const template = getTemplate(canvasType as CanvasType);
  let md = `# ${canvasName}\n\n`;
  md += `**نوع:** ${template.nameFa}\n\n`;
  md += `**تاریخ:** ${new Date().toLocaleDateString("fa-IR")}\n\n---\n\n`;

  for (const section of template.sections) {
    const cards = canvasState[section.id] || [];
    if (cards.length === 0) continue;
    md += `## ${section.title}\n\n`;
    for (const card of cards) {
      const prefix = card.isAIGenerated ? "[AI] " : "- ";
      md += `${prefix}${card.content}\n`;
    }
    md += `\n`;
  }

  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = `${canvasName || "canvas"}.md`;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Re-export for backward compatibility
export { getCompletenessScore } from "./completeness";
