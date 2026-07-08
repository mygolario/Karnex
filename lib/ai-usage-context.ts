import "server-only";
import { AsyncLocalStorage } from "async_hooks";

/**
 * Request-scoped AI usage context.
 *
 * Wraps an async operation so that every `callOpenRouter` invocation inside it
 * can automatically record token/cost usage to the `AiUsage` table without
 * each caller having to thread usage params through handlers.
 *
 * The monthly request quota (lib/usage-tracker.ts) is separate and still
 * enforced by `checkAILimit` at the entry point.
 */
export interface AiUsageContext {
  userId: string;
  projectId?: string;
  conversationId?: string;
  /** Feature label, e.g. "generate-full-canvas", "stt", "generatePlan". */
  feature: string;
}

const als = new AsyncLocalStorage<AiUsageContext>();

export function runWithAiUsage<T>(
  ctx: AiUsageContext,
  fn: () => Promise<T>
): Promise<T> {
  return als.run(ctx, fn);
}

export function getAiUsageContext(): AiUsageContext | undefined {
  return als.getStore();
}
