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
  const verdict = analysis.verdict as { headline?: string; decision?: string; confidence?: number } | undefined;
  const vd = analysis.verdictDetails as { dealBreakers?: string[]; topReasons?: string[] } | undefined;
  const exec = analysis.executiveSummary as { narrative?: string } | undefined;
  const lines = [
    `# گزارش تحلیل مکان — Karnex`,
    ``,
    `**شهر:** ${analysis.city ?? "—"} | **آدرس:** ${analysis.address ?? "—"}`,
    ``,
    `## حکم نهایی: ${verdict?.decision ?? "—"} (${verdict?.confidence ?? "—"}٪ اطمینان)`,
    verdict?.headline ?? "",
    ``,
    `## امتیاز: ${analysis.score ?? "—"}/10`,
    String(analysis.scoreReason ?? ""),
    ``,
  ];

  if (exec?.narrative) {
    lines.push(`## خلاصه مدیریتی`, exec.narrative, ``);
  }

  if (vd?.topReasons?.length) {
    lines.push(`### دلایل موافقت`, ...vd.topReasons.map((r) => `- ${r}`), ``);
  }
  if (vd?.dealBreakers?.length) {
    lines.push(`### ریسک‌های جدی`, ...vd.dealBreakers.map((r) => `- ${r}`), ``);
  }

  const rb = analysis.rentBenchmark as { min?: number; max?: number; median?: number } | undefined;
  if (rb?.median) {
    lines.push(
      `## بنچمارک اجاره`,
      `محدوده: ${rb.min?.toLocaleString("fa-IR")} — ${rb.max?.toLocaleString("fa-IR")} تومان (میانه: ${rb.median?.toLocaleString("fa-IR")})`,
      ``
    );
  }

  return lines.filter(Boolean).join("\n");
}
