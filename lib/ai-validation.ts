import { z } from 'zod';
import { callOpenRouter, parseJsonFromAI } from './openrouter';

export {
  normalizeRoadmapOnly,
  normalizeRoadmapChunk1to8,
  normalizeRoadmapChunk9to16,
} from './roadmap-normalize';
export type { NormalizeRoadmapOptions } from './roadmap-normalize';

// ============================================
// 1. Zod Schemas for AI Shapes
// ============================================

// --- Onboarding Wizard Entity Extraction Schema ---
export const WizardExtractionSchema = z.object({
  idea: z.string().optional().nullable(),
  problem: z.string().optional().nullable(),
  audience: z.string().optional().nullable(),
  budget: z.string().optional().nullable(),
  isComplete: z.boolean().optional().nullable(),
});

export const SuggestAudienceSchema = z.object({
  audiences: z.array(z.string()).default([]),
  revenueModels: z.array(z.string()).default([]),
});

export const SuggestNameSchema = z.object({
  reasoning: z.string().optional(),
  names: z.array(z.string().min(1)).min(3),
});

export const BreakTaskSchema = z.object({
  subTasks: z.array(z.string()).default([]),
});

// --- Pitch Deck Slide Schema ---
export const PitchDeckSlideSchema = z.object({
  id: z.string().optional(),
  type: z.string().optional().default('generic'),
  title: z.string().default('بدون عنوان'),
  bullets: z.array(z.string()).default([]),
  isHidden: z.boolean().optional().default(false),
  metadata: z.any().optional(),
});

export const PitchDeckSchema = z.object({
  slides: z.array(PitchDeckSlideSchema).default([]),
});

// --- SWOT & Competitors Schema ---
export const CompetitorCitationSchema = z.object({
  title: z.string().optional().default(''),
  url: z.string().min(1),
});

export const CompetitorSchema = z.object({
  name: z.string(),
  channel: z.string().optional().default('وب‌سایت'),
  strength: z.string().optional().default(''),
  weakness: z.string().optional().default(''),
  isIranian: z.boolean().optional().default(true),
  scope: z.enum(['local', 'national', 'regional', 'global']).optional(),
  competitorType: z.enum(['direct', 'indirect', 'substitute']).optional().default('direct'),
  url: z.string().optional().default(''),
  tagline: z.string().optional().default(''),
  productSummary: z.string().optional().default(''),
  pricingSignal: z.string().optional().default(''),
  targetSegment: z.string().optional().default(''),
  entryPoints: z.array(z.string()).optional().default([]),
  citations: z.array(CompetitorCitationSchema).optional().default([]),
  threatScore: z.number().min(1).max(5).optional(),
  confidence: z.enum(['high', 'medium', 'low']).optional().default('medium'),
  ratings: z.record(z.string(), z.number().min(1).max(5)).optional(),
  position: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
  }).optional(),
});

export const SwotSchema = z.object({
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  opportunities: z.array(z.string()).default([]),
  threats: z.array(z.string()).default([]),
});

export const SwotCompetitorsSchema = z.object({
  competitors: z.array(CompetitorSchema).default([]),
  swot: SwotSchema,
  brief: z.string().optional().default(''),
  wedge: z.string().optional().default(''),
  nextMoves: z.array(z.string()).optional().default([]),
  whiteSpace: z.array(z.string()).optional().default([]),
  matrixDimensions: z.array(z.string()).optional().default([]),
  yourPosition: z.object({
    x: z.number().min(0).max(1),
    y: z.number().min(0).max(1),
    xAxis: z.string(),
    yAxis: z.string(),
  }).optional(),
  yourRatings: z.record(z.string(), z.number().min(1).max(5)).optional(),
  reasoning: z.string().optional().default(''),
});

// --- Smart Canvas Schema ---
export const SmartCanvasSchema = z.object({
  reasoning: z.string().optional(),
  // Can contain BMC keys
  problem: z.array(z.string()).optional(),
  solution: z.array(z.string()).optional(),
  uniqueValue: z.array(z.string()).optional(),
  revenueStream: z.array(z.string()).optional(),
  customerSegments: z.array(z.string()).optional(),
  customerRelations: z.array(z.string()).optional(),
  channels: z.array(z.string()).optional(),
  keyActivities: z.array(z.string()).optional(),
  keyResources: z.array(z.string()).optional(),
  keyPartners: z.array(z.string()).optional(),
  costStructure: z.array(z.string()).optional(),
  // Can contain Brand Canvas keys
  identity: z.array(z.string()).optional(),
  promise: z.array(z.string()).optional(),
  audience: z.array(z.string()).optional(),
  contentStrategy: z.array(z.string()).optional(),
  monetization: z.array(z.string()).optional(),
  resources: z.array(z.string()).optional(),
  collaborators: z.array(z.string()).optional(),
  investment: z.array(z.string()).optional(),
});

// --- Business Plan (Full Strategic Blueprint) Schema ---
const BMC_KEYS = [
  "keyPartners",
  "keyActivities",
  "keyResources",
  "uniqueValue",
  "customerRelations",
  "channels",
  "customerSegments",
  "costStructure",
  "revenueStream",
] as const;

const CANVAS_KEY_ALIASES: Record<string, (typeof BMC_KEYS)[number]> = {
  keypartners: "keyPartners",
  keypartnerships: "keyPartners",
  partners: "keyPartners",
  keyactivities: "keyActivities",
  activities: "keyActivities",
  keyresources: "keyResources",
  resources: "keyResources",
  uniquevalue: "uniqueValue",
  uniquevalueproposition: "uniqueValue",
  valueproposition: "uniqueValue",
  valueprop: "uniqueValue",
  customerrelations: "customerRelations",
  customerrelationships: "customerRelations",
  relationships: "customerRelations",
  channels: "channels",
  customersegments: "customerSegments",
  segments: "customerSegments",
  customers: "customerSegments",
  coststructure: "costStructure",
  costs: "costStructure",
  revenuestream: "revenueStream",
  revenuestreams: "revenueStream",
  revenue: "revenueStream",
};

const canvasFieldSchema = z.preprocess((val) => {
  if (typeof val === "string") return val;
  if (Array.isArray(val)) {
    return val
      .map((v) => (typeof v === "string" ? v.trim() : String(v ?? "").trim()))
      .filter(Boolean)
      .join("؛ ");
  }
  if (val == null) return "";
  return String(val);
}, z.string().default(""));

function normalizeCanvasInput(raw: unknown): unknown {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return raw;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    const lower = key.toLowerCase().replace(/[^a-z]/g, "");
    const target =
      CANVAS_KEY_ALIASES[lower] ??
      (BMC_KEYS.includes(key as (typeof BMC_KEYS)[number])
        ? (key as (typeof BMC_KEYS)[number])
        : null);
    if (!target) continue;
    const existing = out[target];
    const existingEmpty =
      existing == null ||
      (typeof existing === "string" && existing.trim().length === 0);
    if (existingEmpty) out[target] = value;
  }
  return out;
}

export const BusinessModelCanvasSchema = z.preprocess(
  normalizeCanvasInput,
  z.object({
    keyPartners: canvasFieldSchema,
    keyActivities: canvasFieldSchema,
    keyResources: canvasFieldSchema,
    uniqueValue: canvasFieldSchema,
    customerRelations: canvasFieldSchema,
    channels: canvasFieldSchema,
    customerSegments: canvasFieldSchema,
    costStructure: canvasFieldSchema,
    revenueStream: canvasFieldSchema,
  })
);

export const BrandKitSchema = z.object({
  primaryColorHex: z.string().default('#3b82f6'),
  secondaryColorHex: z.string().default('#1d4ed8'),
  colorPsychology: z.string().default(''),
  suggestedFont: z.string().default('Vazirmatn'),
  logoConcepts: z.array(z.string()).default([]),
});

export const RoadmapStepSchema = z.object({
  title: z.string().default("گام"),
  description: z.string().optional().default(""),
  estimatedHours: z.coerce.number().optional().default(0),
  priority: z.string().default("medium"),
  category: z.string().default("general"),
  status: z.string().default("todo"),
  checklist: z.array(z.string()).default([]),
  tips: z.array(z.string()).default([]),
  resources: z.array(z.string()).optional().default([]),
  dependsOn: z.array(z.string()).optional().default([]),
});

export const RoadmapPhaseSchema = z.object({
  phase: z.string().default("فاز"),
  weekNumber: z.coerce.number().int().min(1).max(16),
  theme: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  steps: z.array(RoadmapStepSchema).default([]),
});

export const MarketingStrategyItemSchema = z.object({
  channel: z.string(),
  tactic: z.string(),
  cost: z.string().default('low'),
});

export const BusinessPlanSchema = z.object({
  reasoning: z.string().optional(),
  projectName: z.string().default('پروژه جدید'),
  tagline: z.string().default(''),
  overview: z.string().default(''),
  businessModelCanvas: BusinessModelCanvasSchema.optional(),
  leanCanvas: BusinessModelCanvasSchema.optional(),
  brandKit: BrandKitSchema.optional(),
  roadmap: z.array(RoadmapPhaseSchema).default([]).refine(
    (r) => r.length === 16,
    { message: "نقشه راه باید دقیقاً ۱۶ فاز (هفته) داشته باشد" }
  ),
  marketingStrategy: z.array(MarketingStrategyItemSchema).default([]),
  competitors: z.array(z.object({
    name: z.string(),
    strength: z.string().optional().default(''),
    weakness: z.string().optional().default(''),
    channel: z.string().optional().default(''),
    isIranian: z.boolean().optional().default(true),
  })).default([]),
});

export const BusinessPlanCoreSchema = BusinessPlanSchema.omit({ roadmap: true }).extend({
  roadmap: z.array(RoadmapPhaseSchema).optional().default([]),
});

export const RoadmapOnlySchema = z.object({
  roadmap: z.array(RoadmapPhaseSchema).default([]).refine(
    (r) => r.length === 16,
    { message: "نقشه راه باید دقیقاً ۱۶ فاز (هفته) داشته باشد" }
  ),
});

/** Schema for an 8-week roadmap chunk (weeks 1–8 or 9–16). */
export const RoadmapChunkSchema = z.object({
  roadmap: z.array(RoadmapPhaseSchema).default([]).refine(
    (r) => r.length === 8,
    { message: "هر بخش نقشه راه باید دقیقاً ۸ فاز داشته باشد" }
  ),
});

// ============================================
// 2. Recursive Self-Healing Retry Helper
// ============================================

export async function callAIWithValidation<T>(
  prompt: string,
  options: {
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    timeoutMs?: number;
    modelOverride?: string;
    singleModel?: boolean;
  },
  schema: z.ZodSchema<T>,
  retriesRemaining = 1,
  preprocess?: (parsed: unknown) => unknown
): Promise<T> {
  const result = await callOpenRouter(prompt, {
    ...options,
    responseFormat: { type: "json_object" },
  });

  if (!result.success) {
    throw new Error(`AI generation request failed: ${result.error}`);
  }

  if (result.finishReason === "length" && retriesRemaining > 0) {
    console.warn(
      "⚠️ Model hit max_tokens (finish_reason=length), retrying with compact output instruction..."
    );
    const compactPrompt = `${prompt}\n\n⚠️ SYSTEM DIRECTION: Your previous response was truncated (hit the token limit). Produce a SHORTER valid JSON response: fewer words per field, keep required structure, do not omit required keys.`;
    return callAIWithValidation(
      compactPrompt,
      options,
      schema,
      retriesRemaining - 1,
      preprocess
    );
  }

  const content = result.content || "";
  let parsed: any;
  try {
    parsed = parseJsonFromAI(content);
  } catch (err: any) {
    if (retriesRemaining > 0) {
      console.warn("⚠️ JSON syntax parse failed, retrying auto-correction turn...");
      const correctionPrompt = `${prompt}\n\n⚠️ SYSTEM DIRECTION: Your previous response was not valid JSON: "${err.message}". Correct it and output strictly valid JSON conforming to the schema rules. Keep the response compact.`;
      return callAIWithValidation(
        correctionPrompt,
        options,
        schema,
        retriesRemaining - 1,
        preprocess
      );
    }
    throw err;
  }

  if (preprocess) {
    parsed = preprocess(parsed);
  }

  const validation = schema.safeParse(parsed);
  if (validation.success) {
    return validation.data;
  }

  if (retriesRemaining > 0) {
    const errorDetails = JSON.stringify(validation.error.format());
    console.warn(
      `⚠️ Zod validation checks failed, retrying auto-correction. Error details: ${errorDetails}`
    );
    const correctionPrompt = `${prompt}\n\n⚠️ SYSTEM DIRECTION: Your previous response failed structural validation with the following errors:
${errorDetails}
Please fix the JSON output to strictly match the requested structure and return valid compact JSON.`;
    return callAIWithValidation(
      correctionPrompt,
      options,
      schema,
      retriesRemaining - 1,
      preprocess
    );
  }

  throw validation.error;
}
