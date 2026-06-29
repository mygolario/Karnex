import type { BusinessPlan } from "@/lib/db";

export function buildLocationProjectContextBlock(
  project: Record<string, unknown> | undefined
): string {
  if (!project) return "[پروفایل پروژه: ثبت نشده]";

  const lines: string[] = ["[پروفایل کامل پروژه Karnex]"];

  if (project.projectName) lines.push(`- نام: ${project.projectName}`);
  if (project.overview) lines.push(`- توضیح: ${String(project.overview).slice(0, 400)}`);
  if (project.audience) lines.push(`- مخاطب هدف: ${project.audience}`);
  if (project.budget) lines.push(`- بودجه: ${project.budget}`);

  const swot = project.swotAnalysis as Record<string, string[]> | undefined;
  if (swot) {
    if (swot.strengths?.length)
      lines.push(`- نقاط قوت SWOT: ${swot.strengths.slice(0, 3).join("؛ ")}`);
    if (swot.weaknesses?.length)
      lines.push(`- نقاط ضعف SWOT: ${swot.weaknesses.slice(0, 3).join("؛ ")}`);
  }

  const fin = project.financials as Record<string, unknown> | undefined;
  if (fin?.breakEven) {
    const be = fin.breakEven as Record<string, number>;
    if (be.fixedCosts) lines.push(`- هزینه ثابت (پروژه): ${be.fixedCosts}`);
  }

  const competitors = project.competitors as Array<{ name?: string }> | undefined;
  if (competitors?.length) {
    lines.push(
      `- رقبای ثبت‌شده در پروژه: ${competitors.map((c) => c.name).filter(Boolean).slice(0, 5).join("، ")}`
    );
  }

  const marketing = project.marketingStrategy as string[] | undefined;
  if (marketing?.length) {
    lines.push(`- استراتژی بازاریابی: ${marketing.slice(0, 3).join("؛ ")}`);
  }

  const history = project.locationHistory as Array<{ address?: string; score?: number }> | undefined;
  if (history?.length) {
    lines.push(
      `- تحلیل‌های قبلی: ${history.slice(0, 3).map((h) => `${h.address} (${h.score}/10)`).join(" | ")}`
    );
  }

  return lines.join("\n");
}

export function computeCannibalization(
  lat: number,
  lon: number,
  history: BusinessPlan["locationHistory"]
): { hasOverlap: boolean; distanceM?: number; summary: string } {
  if (!history?.length) {
    return { hasOverlap: false, summary: "شعبه یا تحلیل قبلی ثبت نشده — همپوشانی بررسی نشد." };
  }

  let minDist = Infinity;
  for (const item of history) {
    const c = item.coordinates;
    if (!c) continue;
    const d = haversineM(lat, lon, c.lat, c.lon);
    if (d < minDist) minDist = d;
  }

  if (minDist === Infinity) {
    return { hasOverlap: false, summary: "تحلیل قبلی بدون مختصات — همپوشانی نامشخص." };
  }

  const hasOverlap = minDist < 1500;
  return {
    hasOverlap,
    distanceM: Math.round(minDist),
    summary: hasOverlap
      ? `فاصله ${Math.round(minDist)}m از یک تحلیل قبلی — ریسک کانibalization.`
      : `نزدیک‌ترین تحلیل قبلی ${Math.round(minDist)}m فاصله دارد — همپوشانی کم.`,
  };
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
