import type { BusinessPlan, LocationAnalysis } from "@/lib/db";

export function syncLocationSwotToCanvas(
  plan: BusinessPlan,
  analysis: LocationAnalysis
): Partial<BusinessPlan> {
  const swot = plan.swotAnalysis || {
    strengths: "",
    weaknesses: "",
    opportunities: "",
    threats: "",
  };

  const appendLines = (existing: string, incoming: string[]) => {
    const block = incoming.filter(Boolean).join("\n");
    if (!block) return existing;
    return existing ? `${existing}\n${block}` : block;
  };

  return {
    swotAnalysis: {
      strengths: appendLines(swot.strengths || "", analysis.swot?.strengths || []),
      weaknesses: appendLines(swot.weaknesses || "", analysis.swot?.weaknesses || []),
      opportunities: appendLines(
        swot.opportunities || "",
        analysis.swot?.opportunities || []
      ),
      threats: appendLines(swot.threats || "", analysis.swot?.threats || []),
    },
  };
}

export function syncLocationFinancialsToProject(
  plan: BusinessPlan,
  analysis: LocationAnalysis
): Partial<BusinessPlan> {
  const lab = analysis.financialLab;
  const baseRev =
    lab?.monthlyPnL?.[0]?.revenue ||
    parseInt(String(analysis.financialSim?.estimatedMonthlyRevenue || "0").replace(/\D/g, ""), 10) ||
    0;

  return {
    financials: {
      ...plan.financials,
      breakEven: {
        fixedCosts:
          lab?.monthlyPnL?.[0]?.rent ||
          plan.financials?.breakEven?.fixedCosts ||
          analysis.inputs?.rentBudget ||
          0,
        variableCostPerUnit: plan.financials?.breakEven?.variableCostPerUnit || 0,
        pricePerUnit:
          baseRev > 0
            ? Math.round(baseRev / 30)
            : plan.financials?.breakEven?.pricePerUnit || 0,
        breakEvenUnits: plan.financials?.breakEven?.breakEvenUnits || 0,
        breakEvenRevenue: plan.financials?.breakEven?.breakEvenRevenue || 0,
        lastUpdated: new Date().toISOString(),
      },
    },
  };
}

export function buildOpeningContentPrompt(analysis: LocationAnalysis): string {
  return `یک پست افتتاحیه برای ${analysis.businessDescription || analysis.businessCategory || "کسب‌وکار"} در ${analysis.address}، ${analysis.city} بنویس. از این بینش استفاده کن: ${analysis.neighborhoodProfile || analysis.aiInsight}`;
}
