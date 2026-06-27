import suggestAudience from "./suggest-audience.json";
import suggestName from "./suggest-name.json";
import breakTask from "./break-task.json";
import analyzeCompetitors from "./analyze-competitors.json";
import generatePitchDeck from "./generate-pitch-deck.json";
import generateSmartCanvas from "./generate-smart-canvas.json";
import chatAction from "./chat-action.json";
import advisorChat from "./advisor-chat.json";
import generatePlan from "./generate-plan.json";
import copilotSystem from "./copilot-system.json";

export const Prompts = {
  suggestAudience,
  suggestName,
  breakTask,
  analyzeCompetitors,
  generatePitchDeck,
  generateSmartCanvas,
  chatAction,
  advisorChat,
  generatePlan,
  copilotSystem
};

export type PromptKey = keyof typeof Prompts;

/**
 * Fills variables in a template string using {{variableName}} format
 */
export function fillTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? String(data[key]) : match;
  });
}

/**
 * Loads a structured prompt by key and resolves variables in system/user templates,
 * appending few-shot examples and Chain-of-Thought instructions.
 */
export function getPrompt(
  key: PromptKey,
  variables: Record<string, any>
): { system: string; user: string } {
  const p = Prompts[key] as any;
  
  let system = fillTemplate(p.system, variables);
  let user = fillTemplate(p.user, variables);

  // If there are few-shot examples, format them and append to system instructions
  if (p.fewShots && p.fewShots.length > 0) {
    const examplesText = p.fewShots
      .map((shot: any, idx: number) => {
        const inputStr = typeof shot.input === 'object' ? JSON.stringify(shot.input, null, 2) : String(shot.input);
        const outputStr = typeof shot.output === 'object' ? JSON.stringify(shot.output, null, 2) : String(shot.output);
        return `مثال ${idx + 1}:\nورودی: ${inputStr}\nخروجی:\n${outputStr}`;
      })
      .join("\n\n");
    system += `\n\n**مثال‌های نمونه (Few-Shot Examples):**\n${examplesText}`;
  }

  // Encourage Chain of Thought reasoning if reasoning instruction is specified
  if (p.reasoningInstruction) {
    system += `\n\n**قانون مهم برای استدلال (Chain of Thought):**\n${p.reasoningInstruction}`;
  }

  return { system, user };
}
