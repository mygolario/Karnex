/**
 * Weighted AI credits — expensive operations cost more than light ones.
 * Monthly plan limits in DEFAULT_FEATURES.aiRequestsPerMonth are credit budgets.
 */

export type AiCreditFeature =
  | "light"
  | "standard"
  | "heavy"
  | "copilot_tools"
  | "deep_research"
  | "stt"
  | "default";

/** Credit cost per feature class */
export const AI_CREDIT_WEIGHTS: Record<AiCreditFeature, number> = {
  light: 1,
  standard: 2,
  heavy: 5,
  copilot_tools: 3,
  deep_research: 8,
  stt: 1,
  default: 1,
};

/**
 * Map known feature / action ids to credit weights.
 * Unknown features default to 1 (backward compatible).
 */
export function getAiCreditCost(featureOrAction: string | undefined | null): number {
  if (!featureOrAction) return AI_CREDIT_WEIGHTS.default;

  const key = featureOrAction.toLowerCase();

  const heavy = new Set([
    "generateplan",
    "generate-plan",
    "generate_plan",
    "generatepitchdeck",
    "generate-pitch-deck",
    "generate_pitch_deck",
    "validateidea",
    "validate-idea",
    "validate_idea",
    "generatesmartcanvas",
    "generate-smart-canvas",
    "generate_smart_canvas",
    "generatefullcanvas",
    "generate-full-canvas",
    "analyze-competitors",
    "analyze_competitors",
    "analyzecompetitors",
  ]);

  const deep = new Set([
    "market-research-deep",
    "market_research_deep",
    "sonar-deep",
    "deep_research",
  ]);

  const copilotTools = new Set([
    "copilot",
    "copilot_chat",
    "copilot-tools",
    "search_competitors",
  ]);

  const light = new Set([
    "suggestname",
    "suggest-name",
    "suggestaudience",
    "suggest-audience",
    "breaktask",
    "break-task",
    "refine-text",
    "refine_text",
    "enhance-bio",
    "memory",
    "insights",
    "validate-idea-script",
    "validate_idea_script",
    "validateideascript",
  ]);

  const standard = new Set([
    "generate-section-cards",
    "script-writer",
    "repurpose-content",
    "chat-action",
    "advisor-chat",
    "market-research",
    "stt",
    "validate-idea-rescore",
    "validate_idea_rescore",
    "validateidearescore",
  ]);

  if (heavy.has(key) || key.includes("generate-plan") || key.includes("pitch-deck")) {
    return AI_CREDIT_WEIGHTS.heavy;
  }
  if (deep.has(key) || key.includes("deep-research") || key.includes("deep_research")) {
    return AI_CREDIT_WEIGHTS.deep_research;
  }
  if (copilotTools.has(key) || key.startsWith("copilot")) {
    return AI_CREDIT_WEIGHTS.copilot_tools;
  }
  if (light.has(key)) return AI_CREDIT_WEIGHTS.light;
  if (standard.has(key)) return AI_CREDIT_WEIGHTS.standard;

  return AI_CREDIT_WEIGHTS.default;
}
