/** Export helpers for AI-generated content */

export function exportAsMarkdown(title: string, sections: Record<string, string>) {
  const body = Object.entries(sections)
    .map(([k, v]) => `## ${k}\n\n${v}`)
    .join("\n\n");
  const md = `# ${title}\n\n${body}`;
  downloadText(md, `${title}.md`, "text/markdown");
}

export function exportAsJson(filename: string, data: unknown) {
  downloadText(JSON.stringify(data, null, 2), `${filename}.json`, "application/json");
}

export function exportAsCsv(filename: string, rows: Record<string, string>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(",")
    ),
  ];
  downloadText(lines.join("\n"), `${filename}.csv`, "text/csv");
}

function downloadText(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function locationReportToMarkdown(analysis: Record<string, unknown>): string {
  const verdict = analysis.verdict as { headline?: string; decision?: string } | undefined;
  const lines = [
    `# گزارش تحلیل مکان`,
    ``,
    `## حکم نهایی: ${verdict?.decision ?? "—"}`,
    verdict?.headline ?? "",
    ``,
    `## امتیاز: ${analysis.score ?? "—"}/10`,
    String(analysis.scoreReason ?? ""),
  ];
  return lines.filter(Boolean).join("\n");
}
