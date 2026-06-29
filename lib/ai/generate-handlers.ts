import "server-only";
import { resolveAssembledPrompt, SCRIPT_TEMPLATE_INSTRUCTIONS } from "@/lib/ai/prompt-service";
import { callOpenRouter, parseJsonFromAI } from "@/lib/openrouter";
import { multiPassGenerate } from "@/lib/ai/multi-pass";
import type { PromptKey } from "@/lib/prompts/registry";

export interface GenerateContext {
  userId?: string;
  projectId?: string;
  projectType?: string;
  projectName?: string;
  projectDescription?: string;
  projectAudience?: string;
  projectData?: Record<string, unknown>;
  modifier?: string;
}

async function assembled(
  featureKey: PromptKey,
  variables: Record<string, string | number | boolean>,
  ctx: GenerateContext
) {
  return resolveAssembledPrompt({
    featureKey,
    variables,
    projectType: ctx.projectType,
    projectName: ctx.projectName,
    projectDescription: ctx.projectDescription,
    projectAudience: ctx.projectAudience,
    projectData: ctx.projectData,
    userId: ctx.userId,
    projectId: ctx.projectId,
    modifier: ctx.modifier as any,
  });
}

export async function handleValidateIdea(
  ctx: GenerateContext & { businessIdea: string }
) {
  const { system, user } = await assembled(
    "validateIdea",
    {
      projectName: ctx.projectName || "پروژه",
      businessIdea: ctx.businessIdea,
    },
    ctx
  );

  const { data } = await multiPassGenerate<Record<string, unknown>>(user, system, {
    maxTokens: 2500,
    temperature: 0.8,
  });
  return { validation: data, reasoning: data.reasoning };
}

export async function handleGrowthPlan(
  ctx: GenerateContext & { planType: string; stage?: string; businessIdea: string }
) {
  let growthUserPrompt = "";
  if (ctx.planType === "north-star") {
    growthUserPrompt = `North Star Metric برای:\nپروژه: ${ctx.projectName}\nتوضیح: ${ctx.businessIdea}\n\nJSON: northStarMetric, why, inputMetrics[]`;
  } else {
    growthUserPrompt = `۳ آزمایش Growth برای مرحله "${ctx.stage || "Acquisition"}" AAARRR:\nپروژه: ${ctx.projectName}\n\nJSON آرایه: title, description, ice_score, difficulty, timeline30_60_90`;
  }

  const { system, user } = await assembled(
    "generateGrowthPlan",
    { growthUserPrompt },
    ctx
  );

  const result = await callOpenRouter(user, {
    systemPrompt: system,
    maxTokens: 2000,
    temperature: 0.8,
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!);
}

export async function handleFullCanvas(
  ctx: GenerateContext & { businessIdea: string }
) {
  const { system, user } = await assembled(
    "generateFullCanvas",
    {
      businessIdea: ctx.businessIdea,
      projectName: ctx.projectName || "پروژه جدید",
    },
    ctx
  );
  const result = await callOpenRouter(user, {
    systemPrompt: system,
    maxTokens: 2000,
    temperature: 0.5,
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!);
}

export async function handleSectionCards(
  ctx: GenerateContext & { sectionTitle: string }
) {
  const { system, user } = await assembled(
    "generateSectionCards",
    {
      sectionTitle: ctx.sectionTitle,
      projectName: ctx.projectName || "",
    },
    ctx
  );
  const result = await callOpenRouter(user, {
    systemPrompt: system,
    maxTokens: 500,
    temperature: 0.7,
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!);
}

export async function handleContentIdeas(
  ctx: GenerateContext & { topic: string }
) {
  const { system, user } = await assembled(
    "generateContentIdeas",
    { topic: ctx.topic, projectName: ctx.projectName || "" },
    ctx
  );
  const result = await callOpenRouter(user, {
    systemPrompt: system,
    maxTokens: 2000,
    temperature: 0.8,
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!);
}

export async function handleRepurpose(
  ctx: GenerateContext & { topic: string; url: string; tone: string }
) {
  const { system, user } = await assembled(
    "repurposeContent",
    { topic: ctx.topic, url: ctx.url, tone: ctx.tone },
    ctx
  );
  const result = await callOpenRouter(user, {
    systemPrompt: system,
    maxTokens: 3000,
    temperature: 0.7,
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!);
}

export async function handleScriptWriter(
  ctx: GenerateContext & {
    title: string;
    audience: string;
    duration: string;
    tone: string;
    template: string;
  }
) {
  const { system, user } = await assembled(
    "scriptWriter",
    {
      title: ctx.title,
      audience: ctx.audience,
      duration: ctx.duration,
      tone: ctx.tone,
      templateInstructions:
        SCRIPT_TEMPLATE_INSTRUCTIONS[ctx.template] ||
        SCRIPT_TEMPLATE_INSTRUCTIONS["viral-hook"],
    },
    ctx
  );
  const result = await callOpenRouter(user, {
    systemPrompt: system,
    maxTokens: 3000,
    temperature: 0.7,
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!);
}

export async function handleContentBrief(
  ctx: GenerateContext & {
    requestType: string;
    context: string;
    requestInstructions: string;
  }
) {
  const { system, user } = await assembled(
    "contentBrief",
    {
      requestType: ctx.requestType,
      context: ctx.context,
      requestInstructions: ctx.requestInstructions,
    },
    ctx
  );
  const result = await callOpenRouter(user, {
    systemPrompt: system,
    maxTokens: 1500,
    temperature: 0.6,
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!);
}

export async function handleContentStrategy(
  ctx: GenerateContext & { platforms: string; weeks: number }
) {
  const { system, user } = await assembled(
    "contentStrategy",
    {
      projectName: ctx.projectName || "",
      platforms: ctx.platforms,
      weeks: ctx.weeks,
    },
    ctx
  );
  const result = await callOpenRouter(user, {
    systemPrompt: system,
    maxTokens: 4000,
    temperature: 0.7,
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!);
}

export async function handleAnalyzeLocation(
  ctx: GenerateContext & {
    city: string;
    address: string;
    radius: number;
    priceTier: string;
    footfallDependency: string;
    rentBudget: number;
    businessCategory: string;
    businessDescription?: string;
    osmDataBlock: string;
    projectContextBlock?: string;
    osmMeta?: Record<string, unknown>;
  },
  modelOverride?: string
) {
  const priceLabel =
    ctx.priceTier === "budget"
      ? "اقتصادی"
      : ctx.priceTier === "premium"
        ? "لوکس"
        : "متوسط";
  const footfallLabel =
    ctx.footfallDependency === "high" ? "پاخورمحور" : "مقصدمحور";

  const { system, user } = await assembled(
    "analyzeLocation",
    {
      city: ctx.city,
      address: ctx.address,
      projectName: ctx.projectName || "",
      businessCategory: ctx.businessCategory || "other",
      businessDescription: ctx.businessDescription || ctx.businessCategory || "کسب‌وکار سنتی",
      priceTier: priceLabel,
      footfallDependency: footfallLabel,
      rentBudget: ctx.rentBudget
        ? `${ctx.rentBudget.toLocaleString("fa-IR")} تومان`
        : "استنتاج از پروژه",
      radius: ctx.radius,
      osmDataBlock: ctx.osmDataBlock,
      projectContextBlock: ctx.projectContextBlock || "",
    },
    ctx
  );

  const enhancedUser = `${user}

دستورالعمل‌های تکمیلی v3:
1. aiCategory از businessDescription
2. executiveSummary.narrative ۴-۶ جمله با ارجاع به پروفایل پروژه
3. verdictDetails: دقیقاً ۳ dealBreaker و ۳ topReason
4. fitScoreBreakdown: footfall, rent, competition, customerMatch, accessibility — هر کدام score 0-10 + confidence + reason
5. competitorAnalysis.directCompetitors از OSM
6. catchment با radiusM=${ctx.radius}
7. cohortFit با توجه به مخاطب پروژه
8. seasonality ۱۲ ماه ایران
9. rentBenchmark + negotiationTips
10. financialLab با monthlyPnL 12 ماه
11. footfallTier: real|inferred|ai
12. hourlyFootfall 24 عنصر`;

  // Single-pass, single-model — default 20s timeout + 3 retries burned the full 120s Vercel budget
  const result = await callOpenRouter(enhancedUser, {
    systemPrompt: system,
    maxTokens: 4500,
    temperature: 0.3,
    timeoutMs: 85000,
    maxAttempts: 1,
    singleModel: true,
    responseFormat: { type: "json_object" },
    modelOverride: modelOverride || "google/gemini-2.5-flash",
  });

  if (!result.success || !result.content) {
    throw new Error(result.error || "Location analysis generation failed");
  }

  return parseJsonFromAI(result.content) as Record<string, unknown>;
}

export function buildGenerateContext(
  activeProject: Record<string, unknown> | undefined,
  userId?: string,
  modifier?: string
): GenerateContext {
  if (!activeProject) {
    return { userId, modifier };
  }
  return {
    userId,
    projectId: activeProject.id as string | undefined,
    projectType: (activeProject.projectType as string) || "startup",
    projectName: (activeProject.projectName as string) || "",
    projectDescription:
      (activeProject.overview as string) ||
      (activeProject.tagline as string) ||
      "",
    projectAudience: (activeProject.audience as string) || "",
    projectData: activeProject as Record<string, unknown>,
    modifier,
  };
}
