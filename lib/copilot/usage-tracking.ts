import "server-only";
import prisma from "@/lib/prisma";

/**
 * Token + cost tracking for AI requests.
 *
 * This is separate from the monthly quota counter in lib/usage-tracker.ts:
 * that one enforces "how many requests has the user made this month" (free/plus/pro),
 * while this records *what* each request consumed (tokens, model, cost) for
 * analytics, cost optimization, and per-feature usage insights.
 */

// Rough per-1M-token cost estimates (USD). OpenRouter billing varies, so these
// are conservative approximations used only for internal cost dashboards.
// Adjust as real billing data becomes available.
const COST_PER_1M_TOKENS: Record<string, { input: number; output: number }> = {
  "google/gemini-3.5-flash": { input: 1.5, output: 9 },
  "google/gemini-3.1-flash-lite": { input: 0.25, output: 1.5 },
  "google/gemini-2.5-flash": { input: 0.30, output: 2.5 },
  "google/gemini-2.5-flash-lite": { input: 0.10, output: 0.40 },
  "anthropic/claude-sonnet-5": { input: 2, output: 10 },
  "perplexity/sonar": { input: 1, output: 1 },
  "perplexity/sonar-pro": { input: 3, output: 15 },
  "perplexity/sonar-deep-research": { input: 2, output: 8 },
  "perplexity/sonar-reasoning-pro": { input: 2, output: 8 },
  // Whisper STT is billed per second of audio, not per token — leave at 0 and
  // rely on the audio duration if available; cost is tracked elsewhere.
  "openai/whisper-large-v3": { input: 0, output: 0 },
};

const DEFAULT_COST = { input: 0.10, output: 0.40 };

export function estimateCostUsd(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const rate = COST_PER_1M_TOKENS[model] ?? DEFAULT_COST;
  const cost =
    (promptTokens / 1_000_000) * rate.input +
    (completionTokens / 1_000_000) * rate.output;
  // round to 6 decimals
  return Math.round(cost * 1_000_000) / 1_000_000;
}

export interface RecordAiUsageParams {
  userId: string;
  projectId?: string;
  conversationId?: string;
  model: string;
  provider?: string;
  feature: string; // "copilot_chat" | "ai_generate" | "tool_call" | "customer_bot" | ...
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  success?: boolean;
  errorMessage?: string;
}

/**
 * Persist a single AI usage record. Non-throwing: logging failures must never
 * break the user-facing request.
 */
export async function recordAiUsage(params: RecordAiUsageParams): Promise<void> {
  try {
    const promptTokens = params.promptTokens ?? 0;
    const completionTokens = params.completionTokens ?? 0;
    const totalTokens = params.totalTokens ?? promptTokens + completionTokens;
    const costUsd = estimateCostUsd(params.model, promptTokens, completionTokens);

    await prisma.aiUsage.create({
      data: {
        userId: params.userId,
        projectId: params.projectId ?? null,
        conversationId: params.conversationId ?? null,
        model: params.model,
        provider: params.provider ?? "openrouter",
        feature: params.feature,
        promptTokens,
        completionTokens,
        totalTokens,
        costUsd,
        success: params.success ?? true,
        errorMessage: params.errorMessage ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to record AI usage (non-fatal):", error);
  }
}

/**
 * Extract token counts from an OpenRouter non-streaming response.
 */
export function extractUsage(data: any): {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
} {
  const usage = data?.usage ?? {};
  return {
    promptTokens: usage.prompt_tokens ?? 0,
    completionTokens: usage.completion_tokens ?? 0,
    totalTokens: usage.total_tokens ?? 0,
  };
}
