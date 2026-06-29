import { z } from 'zod';
import { callOpenRouter, parseJsonFromAI } from './openrouter';

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
  names: z.array(z.string()).default([]),
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
export const CompetitorSchema = z.object({
  name: z.string(),
  channel: z.string().optional().default('وب‌سایت'),
  strength: z.string().optional().default(''),
  weakness: z.string().optional().default(''),
  isIranian: z.boolean().optional().default(true),
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
export const BusinessModelCanvasSchema = z.object({
  keyPartners: z.string().default(''),
  keyActivities: z.string().default(''),
  keyResources: z.string().default(''),
  uniqueValue: z.string().default(''),
  customerRelations: z.string().default(''),
  channels: z.string().default(''),
  customerSegments: z.string().default(''),
  costStructure: z.string().default(''),
  revenueStream: z.string().default(''),
});

export const BrandKitSchema = z.object({
  primaryColorHex: z.string().default('#3b82f6'),
  secondaryColorHex: z.string().default('#1d4ed8'),
  colorPsychology: z.string().default(''),
  suggestedFont: z.string().default('Vazirmatn'),
  logoConcepts: z.array(z.string()).default([]),
});

export const RoadmapStepSchema = z.object({
  title: z.string(),
  description: z.string().optional().default(''),
  estimatedHours: z.union([z.number(), z.string()]).transform(val => Number(val) || 0).default(0),
  priority: z.string().default('medium'),
  category: z.string().default('general'),
  status: z.string().default('todo'),
  checklist: z.array(z.string()).default([]),
  tips: z.array(z.string()).default([]),
  resources: z.array(z.string()).optional().default([]),
  dependsOn: z.array(z.string()).optional().default([]),
});

export const RoadmapPhaseSchema = z.object({
  phase: z.string(),
  weekNumber: z.number().int().min(1).max(16),
  theme: z.string().optional().default(''),
  icon: z.string().optional().default(''),
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
  },
  schema: z.ZodSchema<T>,
  retriesRemaining = 1
): Promise<T> {
  const result = await callOpenRouter(prompt, {
    ...options,
    responseFormat: { type: 'json_object' }
  });

  if (!result.success) {
    throw new Error(`AI generation request failed: ${result.error}`);
  }

  const content = result.content || '';
  let parsed: any;
  try {
    parsed = parseJsonFromAI(content);
  } catch (err: any) {
    if (retriesRemaining > 0) {
      console.warn("⚠️ JSON syntax parse failed, retrying auto-correction turn...");
      const correctionPrompt = `${prompt}\n\n⚠️ SYSTEM DIRECTION: Your previous response was not valid JSON: "${err.message}". Correct it and output strictly valid JSON conforming to the schema rules.`;
      return callAIWithValidation(correctionPrompt, options, schema, retriesRemaining - 1);
    }
    throw err;
  }

  const validation = schema.safeParse(parsed);
  if (validation.success) {
    return validation.data;
  }

  // If Zod validation fails
  if (retriesRemaining > 0) {
    const errorDetails = JSON.stringify(validation.error.format());
    console.warn(`⚠️ Zod validation checks failed, retrying auto-correction. Error details: ${errorDetails}`);
    const correctionPrompt = `${prompt}\n\n⚠️ SYSTEM DIRECTION: Your previous response failed structural validation with the following errors:
${errorDetails}
Please fix the JSON output to strictly match the requested structure and return valid JSON.`;
    return callAIWithValidation(correctionPrompt, options, schema, retriesRemaining - 1);
  }

  // Throw validation error if out of retries
  throw validation.error;
}
