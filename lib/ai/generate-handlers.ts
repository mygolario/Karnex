import "server-only";
import { resolveAssembledPrompt, SCRIPT_TEMPLATE_INSTRUCTIONS } from "@/lib/ai/prompt-service";
import { callOpenRouter, parseJsonFromAI, TIER_GROUNDED, TIER_GROUNDED_DEEP } from "@/lib/openrouter";
import { multiPassGenerate } from "@/lib/ai/multi-pass";
import { callAIWithValidation } from "@/lib/ai-validation";
import type { PromptKey } from "@/lib/prompts/registry";
import {
  IdeaValidationReportSchema,
  InterviewScriptSchema,
  formatBriefForPrompt,
  formatEvidenceForPrompt,
  formatGroundingForPrompt,
  preprocessValidationPayload,
  type EvidenceEntry,
  type IdeaValidationReport,
  type AssumptionStatus,
  type ValidationBrief,
} from "@/lib/validation/types";

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
  ctx: GenerateContext & {
    businessIdea: string;
    validationBrief?: ValidationBrief;
    businessStage?: string;
  }
) {
  const briefBlock = ctx.validationBrief
    ? formatBriefForPrompt(ctx.validationBrief)
    : formatBriefForPrompt({
        problem: ctx.businessIdea,
        whoSuffers: ctx.projectAudience || "",
        currentSolution: "",
        unfairAdvantage: "",
        evidenceLevel: "none",
        topWorry: "",
      });

  const projectContext = buildProjectContextBlock(ctx);

  const { system, user } = await assembled(
    "validateIdea",
    {
      projectName: ctx.projectName || "پروژه",
      businessIdea: ctx.businessIdea,
      validationBrief: briefBlock,
      businessStage: ctx.businessStage || "idea",
      projectContext,
    },
    ctx
  );

  let report: IdeaValidationReport;
  try {
    const { data } = await multiPassGenerate<Record<string, unknown>>(user, system, {
      maxTokens: 4000,
      temperature: 0.75,
      critiqueInstruction:
        "نقد کن: آیا حکم صریح است، ابعاد کامل‌اند، آزمایش‌ها قابل اجرا در ایران‌اند، comparableها واقعی‌اند، و لحن مربی (صادق + قدم بعدی) رعایت شده؟",
    });
    const parsed = IdeaValidationReportSchema.safeParse(
      preprocessValidationPayload(data)
    );
    if (parsed.success) {
      report = parsed.data;
    } else {
      report = await callAIWithValidation(
        user,
        { systemPrompt: system, maxTokens: 4000, temperature: 0.4 },
        IdeaValidationReportSchema,
        1,
        preprocessValidationPayload
      );
    }
  } catch {
    report = await callAIWithValidation(
      user,
      { systemPrompt: system, maxTokens: 4000, temperature: 0.4 },
      IdeaValidationReportSchema,
      1,
      preprocessValidationPayload
    );
  }

  return { validation: report, reasoning: report.reasoning };
}

function buildProjectContextBlock(ctx: GenerateContext): string {
  const data = ctx.projectData || {};
  const parts: string[] = [];
  if (ctx.projectAudience) parts.push(`مخاطب پروژه: ${ctx.projectAudience}`);
  if (ctx.projectDescription) parts.push(`overview: ${String(ctx.projectDescription).slice(0, 500)}`);
  const canvas = data.leanCanvas;
  if (canvas && typeof canvas === "object") {
    parts.push(`بوم ناب (خلاصه): ${JSON.stringify(canvas).slice(0, 1200)}`);
  }
  const ideaInput = data.ideaInput;
  if (typeof ideaInput === "string" && ideaInput.trim()) {
    parts.push(`ideaInput: ${ideaInput.slice(0, 400)}`);
  }
  return parts.length ? parts.join("\n") : "زمینه اضافی موجود نیست.";
}

export async function handleValidateIdeaRescore(
  ctx: GenerateContext & {
    validationBrief?: ValidationBrief;
    priorReport?: IdeaValidationReport;
    evidenceEntries?: EvidenceEntry[];
    assumptionStatuses?: Record<string, AssumptionStatus>;
    competitorsSummary?: string;
    marketSummary?: string;
  }
) {
  const brief = ctx.validationBrief || {
    problem: "",
    whoSuffers: ctx.projectAudience || "",
    currentSolution: "",
    unfairAdvantage: "",
    evidenceLevel: "none" as const,
    topWorry: "",
  };

  const prior = ctx.priorReport;
  const priorReportSummary = prior
    ? [
        `حکم قبلی: ${prior.verdict} | امتیاز: ${prior.overallScore} | اطمینان: ${prior.confidence}`,
        prior.verdictRationale,
        `خلاصه: ${prior.critique.summary}`,
        `فرض‌ها: ${prior.assumptions.map((a) => `[${a.risk}] ${a.text}`).join("؛ ")}`,
      ].join("\n")
    : "گزارش قبلی موجود نیست.";

  const evidenceBlock = formatEvidenceForPrompt(
    ctx.evidenceEntries || [],
    ctx.assumptionStatuses || {}
  );
  const groundingBlock = formatGroundingForPrompt({
    competitorsSummary: ctx.competitorsSummary,
    marketSummary: ctx.marketSummary,
  });

  const { system, user } = await assembled(
    "validateIdeaRescore",
    {
      projectName: ctx.projectName || "پروژه",
      validationBrief: formatBriefForPrompt(brief),
      priorReportSummary,
      evidenceBlock,
      groundingBlock,
    },
    ctx
  );

  const report = await callAIWithValidation(
    user,
    { systemPrompt: system, maxTokens: 3500, temperature: 0.45 },
    IdeaValidationReportSchema,
    1,
    preprocessValidationPayload
  );

  return { validation: report, reasoning: report.reasoning };
}

export async function handleValidateIdeaScript(
  ctx: GenerateContext & {
    problem?: string;
    whoSuffers?: string;
    assumptionText?: string;
  }
) {
  const { system, user } = await assembled(
    "validateIdeaScript",
    {
      projectName: ctx.projectName || "پروژه",
      problem: ctx.problem || "",
      whoSuffers: ctx.whoSuffers || ctx.projectAudience || "",
      assumptionText: ctx.assumptionText || "فرض اصلی محصول",
    },
    ctx
  );

  const script = await callAIWithValidation(
    user,
    { systemPrompt: system, maxTokens: 1500, temperature: 0.5 },
    InterviewScriptSchema,
    1
  );

  return { script };
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
  ctx: GenerateContext & {
    slideContent: string;
    mode:
      | "rewrite"
      | "lengthen"
      | "shorten"
      | "strengthen"
      | "suggest_bullets"
      | "regenerate_slide"
      | "translate_fa"
      | "translate_en"
      | "scorecard";
    slideType?: string;
  }
) {
  const structuredHint =
    'فقط JSON معتبر فارسی برگردان: { "title": string, "bullets": string[], "notes"?: string, "metadata"?: object }';

  const modePrompts: Record<string, string> = {
    rewrite: `بازنویسی حرفه‌ای و سرمایه‌گذارپسند اسلاید پیچ‌دک به فارسی. ${structuredHint}`,
    lengthen: `محتوای اسلاید را با جزئیات بیشتر به فارسی گسترش بده. ${structuredHint}`,
    shorten: `اسلاید را کوتاه‌تر کن ولی نکات کلیدی را نگه دار. ${structuredHint}`,
    strengthen: `پیام اسلاید را قوی‌تر، قانع‌کننده‌تر و مناسب سرمایه‌گذار ایرانی کن. ${structuredHint}`,
    suggest_bullets: `۳ تا ۵ بولت قوی برای این اسلاید پیشنهاد بده. ${structuredHint}`,
    regenerate_slide: `این اسلاید را از نو برای پیچ‌دک استارتاپ ایرانی بازنویسی کن. نوع اسلاید: ${ctx.slideType || "generic"}. ${structuredHint}`,
    translate_fa: `به فارسی روان ترجمه کن. ${structuredHint}`,
    translate_en: `Translate to English. Return JSON: { "title": string, "bullets": string[] }`,
    scorecard:
      'امتیاز آمادگی سرمایه‌گذاری به فارسی. JSON: { "score": number, "tips": string[], "summary": string }',
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
    responseFormat: { type: "json_object" },
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

export async function handleHealthDiagnosis(
  ctx: GenerateContext & { report: Record<string, unknown> }
) {
  const system = `تو تحلیل‌گر سلامت کسب‌وکار Karnex هستی. بر اساس گزارش امتیاز سلامت و ابعاد آن، یک تشخیص کوتاه و عملی به فارسی بده.
خروجی JSON:
{ "diagnosis": string (۲-۳ جمله), "topRisks": string[] (حداکثر ۳), "recommendations": string[] (۳ اقدام عملی با اولویت) }`;
  const user = `پروفایل پروژه: ${ctx.projectName || "—"} (${ctx.projectType || "—"})
گزارش سلامت:
${JSON.stringify(ctx.report, null, 0).slice(0, 4000)}`;
  const result = await callOpenRouter(user, {
    systemPrompt: system,
    maxTokens: 1000,
    temperature: 0.4,
    responseFormat: { type: "json_object" },
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!) as Record<string, unknown>;
}

export async function handlePnLNarrative(
  ctx: GenerateContext & { pnl: Record<string, unknown> }
) {
  const system = `تو تحلیل‌گر مالی Karnex هستی. بر اساس گزارش سود و زیان ماهانه، یک خلاصه فارسی و کوتاه بده.
خروجی JSON:
{ "summary": string (۲-۳ جمله), "anomalies": string[] (نکات غیرعادی یا هشدار، حداکثر ۳), "tip": string (یک پیشنهاد عملی) }`;
  const user = `پروفایل پروژه: ${ctx.projectName || "—"}
گزارش سود و زیان:
${JSON.stringify(ctx.pnl, null, 0).slice(0, 4000)}`;
  const result = await callOpenRouter(user, {
    systemPrompt: system,
    maxTokens: 900,
    temperature: 0.4,
    responseFormat: { type: "json_object" },
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!) as Record<string, unknown>;
}

export async function handleMonthlyReview(
  ctx: GenerateContext & { report: Record<string, unknown> }
) {
  const system = `تو مشاور کسب‌وکار سنتی Karnex هستی. بر اساس گزارش ماهانه (سلامت، سود و زیان، موجودی) یک مرور فارسی عملی بنویس.
خروجی JSON:
{ "summary": string (۳-۵ جمله), "highlights": string[] (حداکثر ۴ نکته مثبت), "risks": string[] (حداکثر ۳ ریسک), "nextMonthFocus": string[] (۳ اولویت ماه بعد) }`;
  const user = `پروفایل پروژه: ${ctx.projectName || "—"} (${ctx.projectType || "startup"})
گزارش ماهانه:
${JSON.stringify(ctx.report, null, 0).slice(0, 6000)}`;
  const result = await callOpenRouter(user, {
    systemPrompt: system,
    maxTokens: 1200,
    temperature: 0.45,
    responseFormat: { type: "json_object" },
  });
  if (!result.success) throw new Error(result.error);
  return parseJsonFromAI(result.content!) as Record<string, unknown>;
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
