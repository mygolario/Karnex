import "server-only";

import { callOpenRouter, parseJsonFromAI, TIER_DEFAULT, TIER_FAST } from "@/lib/openrouter";
import { getAgentDef } from "./catalog";
import {
  fallbackCapital,
  fallbackExecution,
  fallbackGrowth,
  fallbackNightShift,
  fallbackResearch,
} from "./fallback";
import { normalizeAgentOutput } from "./normalize";
import { snapshotToPromptBlock } from "./snapshot";
import type { AgentOutput, ProjectSnapshot, WorkforceAgentId } from "./types";

const SYSTEM = `تو عامل اجرایی کارنکس هستی — هم‌بنیان‌گذار اجرایی استارتاپ ایرانی، نه نویسنده سند.
خروجی فقط JSON معتبر، فارسی، مشخص، قابل اجرا در ۷ روز، بدون شعار تبلیغاتی توخالی.
هیچ کار برگشت‌ناپذیری پیشنهاد نکن که بدون تأیید بنیان‌گذار از کارنکس خارج شود (پرداخت، پست عمومی خودکار).
اگر داده کم است، صریح بگو چه دادهٔ گم‌شده‌ای کار را واقعی می‌کند.`;

function jsonPrompt(agentId: WorkforceAgentId, snapshot: ProjectSnapshot): string {
  const block = snapshotToPromptBlock(snapshot);
  const schemas: Record<WorkforceAgentId, string> = {
    research: `{
  "headline": "یک جمله تیز",
  "briefing": "۲-۴ جمله وضعیت بازار/رقبا مخصوص همین پروژه",
  "competitorMoves": [{"name": "", "move": "چه می‌کنند و چرا برای ما مهم است", "threat": "low|medium|high"}],
  "questions": ["سوال تحقیق این هفته"],
  "recommendedActions": [{"title": "", "why": "", "href": "/dashboard/competitors"}]
}`,
    execution: `{
  "weekTheme": "",
  "missions": [{"id": "m1", "title": "", "roadmapStep": "عنوان دقیق گام نقشه راه اگر وجود دارد", "minutes": 25, "steps": ["زیرکار"], "copyPaste": {"label": "", "body": ""}}],
  "decisionForFounder": "یک تصمیم بله/خیر این هفته"
}`,
    growth: `{
  "hook": "",
  "posts": [{"channel": "instagram|telegram|linkedin", "title": "", "caption": "کپشن کامل فارسی آماده انتشار", "cta": ""}],
  "interviewScript": {"opener": "", "questions": []},
  "dmTemplate": "پیام دایرکت کوتاه"
}`,
    capital: `{
  "oneLiner": "",
  "ask": "درخواست سرمایه واقع‌بینانه برای استارتاپ ایرانی",
  "faqs": [{"q": "", "a": ""}],
  "objections": ["اعتراض + پاسخ یک خطی"]
}`,
    night_shift: `{
  "greeting": "",
  "todayFocus": "یک کار امروز",
  "decision": "",
  "whatAgentsDid": ["یک خط برای هر عامل"],
  "children": {
    "research": { "headline": "", "briefing": "", "competitorMoves": [], "questions": [], "recommendedActions": [] },
    "execution": { "weekTheme": "", "missions": [], "decisionForFounder": "" },
    "growth": { "hook": "", "posts": [], "interviewScript": {"opener": "", "questions": []}, "dmTemplate": "" }
  }
}`,
  };

  return `پروژه:
${block}

عامل: ${agentId}
${getAgentDef(agentId)?.description || "شب‌کاری: تحقیق + اجرا + رشد را در یک گزارش صبح جمع کن. اگر پروژه استارتاپ است children.capital را هم پر کن."}

فقط JSON با این شکل:
${schemas[agentId]}`;
}

export function fallbackForAgent(
  agentId: WorkforceAgentId,
  snapshot: ProjectSnapshot,
): AgentOutput {
  switch (agentId) {
    case "research":
      return fallbackResearch(snapshot);
    case "execution":
      return fallbackExecution(snapshot);
    case "growth":
      return fallbackGrowth(snapshot);
    case "capital":
      return fallbackCapital(snapshot);
    case "night_shift":
      return fallbackNightShift(snapshot);
  }
}

export async function generateAgentOutput(
  agentId: WorkforceAgentId,
  snapshot: ProjectSnapshot,
): Promise<{ output: AgentOutput; source: "ai" | "fallback" }> {
  const fallback = fallbackForAgent(agentId, snapshot);

  if (!process.env.OPENROUTER_API_KEY) {
    return { output: fallback, source: "fallback" };
  }

  const model = agentId === "night_shift" || agentId === "research" ? TIER_DEFAULT : TIER_FAST;
  const result = await callOpenRouter(jsonPrompt(agentId, snapshot), {
    systemPrompt: SYSTEM,
    modelOverride: model,
    temperature: 0.4,
    maxTokens: agentId === "night_shift" ? 3500 : 2200,
    timeoutMs: agentId === "night_shift" ? 45000 : 25000,
    maxAttempts: 2,
  });

  if (!result.success || !result.content) {
    return { output: fallback, source: "fallback" };
  }

  try {
    const parsed = parseJsonFromAI(result.content) as Record<string, unknown>;
    return {
      output: normalizeAgentOutput(agentId, parsed, fallback),
      source: "ai",
    };
  } catch {
    return { output: fallback, source: "fallback" };
  }
}
