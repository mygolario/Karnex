import { BusinessPlan, RoadmapPhase, RoadmapStep } from "@/lib/db";
import { downloadFile, createPersianPDF, reshapePersian } from "@/lib/export-utils";
import { toPersianDigits } from "@/lib/utils";

export function exportRoadmapAsMarkdown(plan: BusinessPlan): string {
  let md = `# نقشه راه — ${plan.projectName}\n\n`;
  md += `> ${plan.tagline || ""}\n\n`;
  md += `**پیشرفت کلی:** ${plan.completedSteps?.length || 0} از ${countSteps(plan.roadmap)} گام\n\n`;
  md += `---\n\n`;

  plan.roadmap.forEach((phase, i) => {
    md += `## فاز ${toPersianDigits(i + 1)}: ${phase.phase}\n\n`;
    if (phase.theme) md += `*موضوع: ${phase.theme}*\n\n`;

    phase.steps.forEach((s) => {
      const step = typeof s === "string" ? { title: s } : (s as RoadmapStep);
      const isDone = plan.completedSteps?.includes(step.title);
      const check = isDone ? "[x]" : "[ ]";
      md += `- ${check} **${step.title}**\n`;
      if (step.description) md += `  ${step.description}\n`;
      if (step.estimatedHours) md += `  ⏱ زمان تخمینی: ${toPersianDigits(step.estimatedHours)} ساعت\n`;
      if (step.priority) md += `  🚩 اولویت: ${step.priority}\n`;
      if (step.category) md += `  🏷 دسته: ${step.category}\n`;
      if (step.checklist && step.checklist.length > 0) {
        md += `  \n  **چک‌لیست:**\n`;
        step.checklist.forEach((item) => {
          md += `  - ${item}\n`;
        });
      }
      if (step.tips && step.tips.length > 0) {
        md += `  \n  **نکات:**\n`;
        step.tips.forEach((tip) => {
          md += `  - ${tip}\n`;
        });
      }
      md += `\n`;
    });
  });

  return md;
}

export async function exportRoadmapAsPDF(plan: BusinessPlan) {
  const doc = await createPersianPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let y = 20;

  const addLine = (text: string, size = 12, _bold = false) => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(size);
    doc.setFont("Vazirmatn", "normal");
    doc.text(reshapePersian(text), pageWidth - margin, y, { align: "right" });
    y += size * 0.5 + 2;
  };

  const addDivider = () => {
    if (y > pageHeight - 20) {
      doc.addPage();
      y = 20;
    }
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 5;
  };

  // Title
  addLine(plan.projectName, 20, true);
  addLine("نقشه راه", 14);
  const total = countSteps(plan.roadmap);
  const done = plan.completedSteps?.length || 0;
  addLine(`پیشرفت: ${done} از ${total} گام`, 11);
  y += 5;
  addDivider();

  plan.roadmap.forEach((phase, i) => {
    addLine(`فاز ${i + 1}: ${phase.phase}`, 14, true);
    if (phase.theme) addLine(`موضوع: ${phase.theme}`, 10);
    y += 2;

    phase.steps.forEach((s) => {
      const step = typeof s === "string" ? { title: s } : (s as RoadmapStep);
      const isDone = plan.completedSteps?.includes(step.title);
      const prefix = isDone ? "[✓]" : "[ ]";
      addLine(`${prefix} ${step.title}`, 11);
      if (step.description) addLine(step.description, 9);
      if (step.estimatedHours)
        addLine(`زمان: ${step.estimatedHours} ساعت`, 9);
    });
    y += 3;
    addDivider();
  });

  doc.save(`roadmap-${plan.projectName || "project"}.pdf`);
}

export function exportRoadmapAsCSV(plan: BusinessPlan): string {
  let csv = "فاز,گام,توضیحات,دسته,اولویت,زمان تخمینی,وضعیت\n";
  plan.roadmap.forEach((phase) => {
    phase.steps.forEach((s) => {
      const step = typeof s === "string" ? { title: s } : (s as RoadmapStep);
      const isDone = plan.completedSteps?.includes(step.title);
      const status = isDone ? "تکمیل شده" : "در صف";
      const esc = (t: string) => `"${(t || "").replace(/"/g, '""')}"`;
      csv += [
        esc(phase.phase),
        esc(step.title),
        esc(step.description || ""),
        esc(step.category || ""),
        esc(step.priority || ""),
        esc(String(step.estimatedHours || "")),
        esc(status),
      ].join(",") + "\n";
    });
  });
  return csv;
}

function countSteps(roadmap: RoadmapPhase[]): number {
  return roadmap.reduce((acc, p) => acc + p.steps.length, 0);
}

export function downloadRoadmapMarkdown(plan: BusinessPlan) {
  downloadFile(
    exportRoadmapAsMarkdown(plan),
    `roadmap-${plan.projectName || "project"}.md`,
    "text/markdown;charset=utf-8"
  );
}

export function downloadRoadmapCSV(plan: BusinessPlan) {
  downloadFile(
    exportRoadmapAsCSV(plan),
    `roadmap-${plan.projectName || "project"}.csv`,
    "text/csv;charset=utf-8"
  );
}
