import "server-only";
import { resolveAssembledPrompt, SCRIPT_TEMPLATE_INSTRUCTIONS } from "@/lib/ai/prompt-service";
import { callOpenRouter, parseJsonFromAI, TIER_LOCATION, TIER_GROUNDED, TIER_GROUNDED_DEEP, MODEL_GEMINI_25_FLASH_LITE } from "@/lib/openrouter";
import { normalizeLocationAnalysis } from "@/lib/location/normalize-analysis";
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
    storefrontPhoto?: string;
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

  let enhancedUser = `${user}

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
12. hourlyFootfall 24 عنصر
13. alternatives: هر کدام شامل name, estimatedScore, reason, distance, coordinates (شامل lat, lon در فاصله ۱ تا ۳ کیلومتری) باشند.
14. متن‌ها را مختصر نگه دار — JSON باید کامل و معتبر باشد.`;

  if (ctx.storefrontPhoto) {
    enhancedUser += `

توجه ویژه: کاربر تصویری از ویترین/نمای بیرونی این مکان ارسال کرده است. تصویر پیوست‌شده را تحلیل کن و بخش storefront را به صورت زیر پر کن:
- storefront.photoDataUrl را دقیقاً برابر همان رشته base64 ورودی قرار بده.
- storefront.visibilityAssessment را بر اساس دید تابلو، وضعیت نما، موانع عابران پیاده و سطح دسترسی فیزیکی تصویر تحلیل فنی کن (۲-۳ جمله فارسی).
- فیلد fitScoreBreakdown برای accessibility و همچنین امتیاز کل را بر اساس موانع دیده شده در تصویر (پله، سطح ناصاف، نبود رمپ و...) به‌روزرسانی کن.`;
  }

  const callOpts = {
    systemPrompt: system,
    maxTokens: 8192,
    temperature: 0.3,
    timeoutMs: 52000,
    maxAttempts: 1,
    responseFormat: { type: "json_object" as const },
    modelOverride: modelOverride || TIER_LOCATION,
    imageUrl: ctx.storefrontPhoto,
  };

  const modelsToTry = [
    callOpts.modelOverride!,
    MODEL_GEMINI_25_FLASH_LITE,
  ].filter((m, i, arr) => arr.indexOf(m) === i);

  let lastError = "Location analysis generation failed";
  for (const model of modelsToTry) {
    const result = await callOpenRouter(enhancedUser, { ...callOpts, modelOverride: model });

    if (!result.success || !result.content) {
      lastError = result.error || lastError;
      console.warn("[analyze-location] model failed", { model, error: result.error });
      continue;
    }

    if (result.finishReason === "length") {
      console.warn("[analyze-location] response truncated", { model, finishReason: result.finishReason });
    }

    try {
      const parsed = parseJsonFromAI(result.content) as Record<string, unknown>;
      return normalizeLocationAnalysis(parsed, {
        city: ctx.city,
        address: ctx.address,
        businessDescription: ctx.businessDescription,
        radius: ctx.radius,
      });
    } catch (parseErr) {
      lastError = `JSON parse failed (${model}): ${String(parseErr)}`;
      console.error("[analyze-location] parse failed", {
        model,
        finishReason: result.finishReason,
        preview: result.content.slice(0, 240),
        error: String(parseErr),
      });
    }
  }

  throw new Error(lastError);
}

export async function handleCanvasCritique(
  ctx: GenerateContext & { canvasSummary: string }
) {
  const system = `You are a business strategy expert. Analyze the canvas and respond in Persian JSON:
{ "score": number 0-100, "summary": string, "strengths": string[], "weaknesses": string[], "recommendations": string[] }`;
  const user = `Analyze this business canvas for project "${ctx.projectName}":\n${ctx.canvasSummary}`;
  const result = await callOpenRouter(user, {
    systemPrompt: system,
    maxTokens: 1500,
    temperature: 0.4,
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!);
}

export async function handlePitchSlideAI(
  ctx: GenerateContext & { slideContent: string; mode: "rewrite" | "lengthen" | "shorten" | "translate_fa" | "translate_en" | "scorecard" }
) {
  const modePrompts: Record<string, string> = {
    rewrite: "Rewrite professionally in Persian. Return JSON: { \"text\": string }",
    lengthen: "Expand with more detail in Persian. Return JSON: { \"text\": string }",
    shorten: "Shorten while keeping key points in Persian. Return JSON: { \"text\": string }",
    translate_fa: "Translate to Persian. Return JSON: { \"text\": string }",
    translate_en: "Translate to English. Return JSON: { \"text\": string }",
    scorecard: "Investor readiness scorecard in Persian. Return JSON: { \"score\": number, \"tips\": string[], \"summary\": string }",
  };
  const system = modePrompts[ctx.mode] || modePrompts.rewrite;
  // Investor Readiness Scorecard benefits from live-web grounding (citations,
  // market benchmarks) — route to Perplexity Sonar for that mode only.
  const isScorecard = ctx.mode === "scorecard";
  const result = await callOpenRouter(ctx.slideContent, {
    systemPrompt: system,
    maxTokens: 1200,
    temperature: 0.5,
    modelOverride: isScorecard ? TIER_GROUNDED : undefined,
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!);
}

/**
 * Grounded market research (TAM/SAM/SOM, competitors, trends, scorecard) via
 * Perplexity Sonar — uses live web data with citations. The `deep` variant
 * uses sonar-deep-research for higher-effort TAM/SAM/SOM dives.
 */
export async function handleMarketResearch(
  ctx: GenerateContext & {
    businessIdea: string;
    geography?: string;
    researchType: "tam" | "competitors" | "trends" | "scorecard";
    deep?: boolean;
  }
) {
  const model = ctx.deep ? TIER_GROUNDED_DEEP : TIER_GROUNDED;
  const geo = ctx.geography || "ایران";

  const typeInstruction: Record<typeof ctx.researchType, string> = {
    tam: `TAM/SAM/SOM را بر اساس داده‌های زنده بازار ${geo} برآورد کن. JSON: { tam, sam, som, currency, assumptions[], sources[] }`,
    competitors: `۳-۵ رقیب واقعی در بازار ${geo} با نام، وب‌سایت، نقاط قوت/ضعف و بخش بازار تحلیل کن. JSON: { competitors[{name,url,strength,weakness,marketShare}], sources[] }`,
    trends: `۳-۵ روند فعلی بازار ${geo} مرتبط با ایده را با زمان‌بندی و منبع بیان کن. JSON: { trends[{title,direction,horizon,evidence}], sources[] }`,
    scorecard: `آمادگی سرمایه‌گذاری ایده را با امتیاز ۰-۱۰۰ و توصیه‌های مبتنی بر داده بده. JSON: { score, dimensions[{name,score,note}], recommendations[], sources[] }`,
  };

  const system = `تو یک تحلیل‌گر بازار هستی که با داده‌های زنده وب و ارجاع (citation) پاسخ می‌دهی. فقط به فارسی و در قالب JSON معتبر پاسخ بده. هر ادعا را با منبع همراه کن.`;
  const user = `پروژه: ${ctx.projectName || "پروژه جدید"}
ایده کسب‌وکار: ${ctx.businessIdea}
مخاطب: ${ctx.projectAudience || "نامشخص"}
جغرافیا: ${geo}

${typeInstruction[ctx.researchType]}`;

  const result = await callOpenRouter(user, {
    systemPrompt: system,
    maxTokens: 4000,
    temperature: 0.3,
    timeoutMs: 60000,
    modelOverride: model,
    responseFormat: { type: "json_object" },
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!);
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
