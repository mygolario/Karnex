import "server-only";
import { callOpenRouter } from "@/lib/openrouter";
import type { GeneratedInsight } from "./insights";

/**
 * Hybrid LLM enhancement: enrich rule-based insight bodies with personalized narrative.
 */
export async function enrichInsightsWithLLM(
  insights: GeneratedInsight[],
  projectName: string,
  projectType: string
): Promise<GeneratedInsight[]> {
  if (insights.length === 0 || !process.env.OPENROUTER_API_KEY) return insights;

  const top = insights.slice(0, 5);
  const summary = top
    .map((i) => `- [${i.priority}] ${i.title}: ${i.body}`)
    .join("\n");

  const result = await callOpenRouter(
    `پروژه «${projectName}» (${projectType}). بینش‌های زیر rule-based هستند. برای هر عنوان، body را به ۲ جمله شخصی‌سازی‌شده و عملی بازنویسی کن.\n\n${summary}\n\nJSON: [{ "title": "...", "body": "..." }]`,
    {
      systemPrompt:
        "تو تحلیل‌گر کارنکس هستی. فقط JSON آرایه با همان titleها و body بهبودیافته.",
      maxTokens: 1200,
      temperature: 0.5,
    }
  );

  if (!result.success || !result.content) return insights;

  try {
    const cleaned = result.content.replace(/```json|```/g, "").trim();
    const enriched = JSON.parse(cleaned) as { title: string; body: string }[];
    return insights.map((ins) => {
      const match = enriched.find((e) => e.title === ins.title);
      return match ? { ...ins, body: match.body } : ins;
    });
  } catch {
    return insights;
  }
}
