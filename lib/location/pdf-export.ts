import type { LocationAnalysis } from "@/lib/db";
import { locationReportToMarkdown } from "@/lib/ai/export-suite";

export async function exportLocationPdf(
  analysis: LocationAnalysis,
  projectName: string
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const md = locationReportToMarkdown(analysis as unknown as Record<string, unknown>);
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Karnex Location Report", 20, 20);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const lines = md.split("\n");
  let y = 35;
  const lineHeight = 6;
  const maxWidth = 170;

  for (const line of lines) {
    const wrapped = doc.splitTextToSize(line || " ", maxWidth);
    for (const w of wrapped) {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
      doc.text(w, 20, y);
      y += lineHeight;
    }
  }

  doc.setFontSize(9);
  doc.text(`Project: ${projectName}`, 20, y + 10);
  doc.text(`Generated: ${new Date().toISOString().slice(0, 10)}`, 20, y + 16);

  doc.save(`location-${analysis.city}-${Date.now()}.pdf`);
}
