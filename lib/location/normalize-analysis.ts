import type { LocationAnalysis } from "@/lib/db";

/** Ensure AI output has minimum fields the UI expects so partial/truncated JSON still renders. */
export function normalizeLocationAnalysis(
  raw: Record<string, unknown>,
  ctx: { city: string; address: string; businessDescription?: string; radius: number }
): Record<string, unknown> {
  const score =
    typeof raw.score === "number"
      ? raw.score
      : typeof raw.score === "string"
        ? parseFloat(raw.score) || 5
        : 5;

  const verdict = (raw.verdict as LocationAnalysis["verdict"]) || {
    decision: score >= 6.5 ? "go" : score >= 5 ? "caution" : "no-go",
    headline: String(raw.scoreReason || "تحلیل مکان تکمیل شد — جزئیات را در تب‌ها ببینید."),
    confidence: 65,
  };

  return {
    demographics: [],
    rentEstimate: "",
    successMatch: { label: "متوسط", color: "#888" },
    swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    aiInsight: "",
    ...raw,
    city: ctx.city,
    address: ctx.address,
    businessDescription: ctx.businessDescription || raw.businessDescription,
    score,
    scoreReason: String(raw.scoreReason || "تحلیل بر اساس داده OSM و پروفایل پروژه."),
    verdict,
    catchment: raw.catchment || {
      radiusM: ctx.radius,
      poiDensity: 0,
      transitStops: 0,
      confidence: "inferred",
    },
    competitorAnalysis: raw.competitorAnalysis || {
      directCompetitors: [],
      saturationLevel: "Medium",
    },
    metrics: raw.metrics || {
      footfallIndex: "Medium",
      spendPower: "Medium",
      riskRewardRatio: 1,
      competitionDensity: "Medium",
    },
  };
}
