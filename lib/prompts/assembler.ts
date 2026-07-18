import karnexBase from "./karnex-base.json";
import { fillTemplate, getPrompt, type PromptKey } from "./registry";
import {
  buildPromptContext,
  type PromptContextInput,
} from "./context-builder";
import { REGENERATE_MODIFIERS } from "./persona-packs";

export interface AssemblePromptOptions extends PromptContextInput {
  /** Feature prompt key from registry */
  featureKey: PromptKey;
  /** Feature-specific template variables */
  variables?: Record<string, string | number | boolean>;
  /** Optional modifier for regenerate flows */
  modifier?: keyof typeof REGENERATE_MODIFIERS;
  /** Skip base layer (e.g. copilot has its own assembly) */
  skipBase?: boolean;
}

export interface AssembledPrompt {
  system: string;
  user: string;
  version: string;
  featureVersion: string;
}

/**
 * Layered prompt: Karnex Base + Persona/Context + Feature prompt
 */
export function assemblePrompt(options: AssemblePromptOptions): AssembledPrompt {
  const ctx = buildPromptContext(options);
  const featureVars = {
    ...ctx,
    preferredToneInstruction: ctx.preferredToneInstruction,
    expertiseInstruction: ctx.expertiseInstruction,
    liveContextSection: ctx.liveContextSection,
    userProfileSection: ctx.userProfileSection || "—",
    memoryHighlightsSection: ctx.memoryHighlightsSection || "—",
    personaSection: ctx.personaSection,
    businessGlossary: ctx.businessGlossary,
    completedStepsSummary: ctx.completedStepsSummary,
    ...(options.variables || {}),
  };

  const { system: featureSystem, user: featureUser } = getPrompt(
    options.featureKey,
    featureVars
  );

  let system = featureSystem;
  if (!options.skipBase) {
    const baseSystem = fillTemplate(karnexBase.system, featureVars);
    system = `${baseSystem}\n\n---\n\n${featureSystem}`;
  }

  if (options.modifier && REGENERATE_MODIFIERS[options.modifier]) {
    system += `\n\n**دستور اصلاح:** ${REGENERATE_MODIFIERS[options.modifier]}`;
  }

  const { Prompts } = require("./registry") as typeof import("./registry");
  const featurePrompt = Prompts[options.featureKey] as { version?: string };

  return {
    system,
    user: featureUser,
    version: karnexBase.version,
    featureVersion: featurePrompt?.version || "1.0.0",
  };
}

/** Alias for assemblePrompt (sync) */
export const assemblePromptSync = assemblePrompt;
