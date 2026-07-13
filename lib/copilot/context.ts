import "server-only";
import { getPrompt } from "@/lib/prompts/registry";
import { COPILOT_PERSONAS, COPILOT_DEFAULT_PERSONA } from "@/lib/prompts/persona-packs";
import type { CopilotMode, CopilotPersona } from "./types";

/**
 * Server-side context builder for the Copilot.
 *
 * Assembles a pillar-aware, persona/mode-aware system prompt from the project's
 * JSON data plus (in later phases) UserProfile / ProjectMemory / AiInsight data.
 *
 * Phase 0: project base context + persona + mode behaviour.
 * Phase 1: appends UserProfile + ProjectMemory sections.
 * Phase 2: appends the full pillar bundle (roadmap, calendar, scripts,
 *          sponsor, ideas, gamification).
 */

export interface CopilotContextInput {
  projectName: string;
  projectDescription: string;
  projectAudience: string;
  projectType: string;
  persona: CopilotPersona;
  mode: CopilotMode;
  /** Already-serialised @-mention context string (or a "none" placeholder). */
  mentionedContext: string;
  /** Raw project data blob (Project.data) for deriving live state. */
  projectData: Record<string, any>;
  /** Optional pre-built memory/profile sections (Phase 1+). */
  userProfileSection?: string;
  projectMemorySection?: string;
  /** Optional pre-built pillar bundle string (Phase 2+). */
  pillarBundleSection?: string;
}

export interface BuiltCopilotContext {
  systemPrompt: string;
  /** Compact context object safe to log / attach to usage records. */
  summary: Record<string, unknown>;
}

// --- Persona capability blocks (single source of truth in persona-packs.ts) ---

function getCopilotPersona(persona: CopilotPersona): string {
  if (persona === "default") return COPILOT_DEFAULT_PERSONA;
  return COPILOT_PERSONAS[persona] || COPILOT_DEFAULT_PERSONA;
}

// --- Mode behaviour blocks ---

const MODE_SECTIONS: Record<CopilotMode, string> = {
  cofounder: `حالت «هم‌بنیان‌گذار»: دسترسی کامل به ابزارها. وقتی کاربر می‌خواهد چیزی بسازد، پر کند یا به‌روز کند، فوراً از ابزار مربوطه استفاده کن (ACTION OVER CHAT). قبل از فراخوانی ابزار یک جمله کوتاه فارسی بگو.`,
  customer_bot: `حالت «ربات مشتری»: تو در حال پیکربندی و آموزش ربات پاسخ‌گوی خودکار برای کانال‌های WhatsApp/Telegram/Instagram هستی.
- قالب‌های پاسخ (Reply Templates) را بر اساس پرسونای برند، حافظه پروژه و سوالات رایج مشتری بنویس (مثلاً: سلام‌رسپانس، قیمت‌پرسیدن، ساعت‌کاری، شکایت، ارسال‌لینک).
- هر قالب را کوتاه، دوستانه و متناسب با لحن کاربر نگه‌دار.
- شخصیت ربات (Persona) را از حافظه پروژه استخراج کن و اگر خالی بود پیشنهاد بده.
- تغییرات ساختاری پروژه (نقشه راه، بوم، تقویم) را اعمال نکن مگر درخواست صریح.
- قالب‌های نهایی را با ابزار save_memory در حافظه پروژه ذخیره کن تا در گفتگوهای بعدی حفظ شوند.`,
  insights: `حالت «بینش‌ها»: فقط تحلیلی و read-only. هیچ ابزار نوشتن را فراخوانی نکن.
- سلامت کلی پروژه، نرخ پیشرفت، گلوگاه‌ها و شکاف‌ها را تحلیل کن.
- ریسک‌ها (تأخیر، رقبا، استریک، مجوزها) را اولویت‌بندی کن.
- سناریوهای what-if پیشنهاد بده («اگر فلان گام را یک هفته جابه‌جا کنیم...»).
- خروجی را با ساختار markdown (سرتیتر، لیست، جدول خلاصه) عرضه کن و در پایان ۳ توصیه عملی با اولویت بده.`,
};

// --- Pillar context derived from project data (Phase 2 full bundle) ---

function buildPillarContext(data: Record<string, any>, projectType: string): string {
  const lines: string[] = [];

  // --- Canvas (all) ---
  const canvas = projectType === "creator" ? data.brandCanvas : data.leanCanvas;
  const canvasLabel = projectType === "creator" ? "بوم برند" : "بوم مدل کسب‌وکار (Lean Canvas)";
  if (canvas && typeof canvas === "object" && Object.keys(canvas).length > 0) {
    const filled = Object.keys(canvas).filter((k) => {
      const v = (canvas as any)[k];
      if (Array.isArray(v)) return v.length > 0;
      return v && String(v).trim().length > 0;
    }).length;
    lines.push(`- ${canvasLabel}: ${filled} بخش پر شده است.`);
  } else {
    lines.push(`- ${canvasLabel}: خالی.`);
  }

  // --- Roadmap (all) ---
  const roadmap: any[] = Array.isArray(data.roadmap) ? data.roadmap : [];
  const completed: string[] = Array.isArray(data.completedSteps) ? data.completedSteps : [];
  if (roadmap.length > 0) {
    // Find current step = first non-completed step in first phase.
    let currentStep = "—";
    for (const phase of roadmap) {
      const steps = Array.isArray(phase?.steps) ? phase.steps : [];
      for (const s of steps) {
        const step = typeof s === "string" ? { title: s } : s;
        const id = step.id || step.title;
        const status = step.status || (completed.includes(id) ? "done" : "todo");
        if (status !== "done") {
          currentStep = step.title || "—";
          break;
        }
      }
      if (currentStep !== "—") break;
    }
    lines.push(`- نقشه راه: ${roadmap.length} فاز، ${completed.length} گام تکمیل‌شده، گام فعلی: «${currentStep}».`);
  }

  // --- Startup specifics ---
  if (projectType === "startup") {
    const pitchCount = Array.isArray(data.pitchDeck) ? data.pitchDeck.length : 0;
    lines.push(`- پیچ‌دک: ${pitchCount} اسلاید.`);
    if (data.swotAnalysis) lines.push(`- تحلیل SWOT: موجود.`);
  }

  if (projectType === "startup" || projectType === "traditional") {
    const intelComps = Array.isArray(data.competitorIntel?.competitors)
      ? data.competitorIntel.competitors.filter((c: { status?: string }) => c.status === "active")
      : [];
    const legacyComps = Array.isArray(data.competitors) ? data.competitors : [];
    const count = intelComps.length || legacyComps.length;
    if (count > 0) {
      const names = (intelComps.length ? intelComps : legacyComps)
        .slice(0, 5)
        .map((c: { name?: string }) => c.name)
        .filter(Boolean)
        .join("، ");
      lines.push(`- رقبا: ${count} فعال${names ? ` (${names})` : ""}.`);
      if (data.competitorIntel?.wedge) {
        lines.push(`- زاویه تمایز رقابتی: ${data.competitorIntel.wedge}`);
      }
    } else {
      lines.push(`- رقبا: هنوز ثبت نشده.`);
    }
  }

  // --- Creator specifics ---
  if (projectType === "creator") {
    const posts: any[] = Array.isArray(data.contentCalendar) ? data.contentCalendar : [];
    if (posts.length > 0) {
      const byStatus = posts.reduce<Record<string, number>>((acc, p) => {
        acc[p.status || "idea"] = (acc[p.status || "idea"] || 0) + 1;
        return acc;
      }, {});
      lines.push(`- تقویم محتوا: ${posts.length} پست (${Object.entries(byStatus).map(([k, v]) => `${k}: ${v}`).join("، ")}).`);
    }
    const streak = data.contentStreak;
    if (streak) {
      lines.push(`- استریک محتوا: فعلی ${streak.current ?? 0}، بهترین ${streak.best ?? 0}.`);
    }
  }

  // --- Traditional specifics ---
  if (projectType === "traditional") {
    const permits: any[] = Array.isArray(data.permits) ? data.permits : [];
    if (permits.length > 0) {
      const done = permits.filter((p) => p.status === "done").length;
      lines.push(`- مجوزها: ${done}/${permits.length} تکمیل‌شده.`);
    }
    if (data.swotAnalysis) lines.push(`- تحلیل SWOT: موجود.`);
  }

  return lines.join("\n");
}

export function buildCopilotContext(input: CopilotContextInput): BuiltCopilotContext {
  const personaSection = getCopilotPersona(input.persona);
  const modeSection = MODE_SECTIONS[input.mode] || MODE_SECTIONS.cofounder;
  const pillarContext =
    input.pillarBundleSection || buildPillarContext(input.projectData, input.projectType);

  const { system: systemPrompt } = getPrompt("copilotSystem", {
    projectName: input.projectName,
    projectDescription: input.projectDescription || "N/A",
    projectAudience: input.projectAudience || "Unknown",
    canvasStatus: input.projectData?.leanCanvas ? "Partially Filled" : "Empty",
    pitchDeckCount: String(Array.isArray(input.projectData?.pitchDeck) ? input.projectData.pitchDeck.length : 0),
    mentionedContext: input.mentionedContext,
    personaSection,
    modeSection,
    pillarContext,
    userProfileSection: input.userProfileSection || "",
    projectMemorySection: input.projectMemorySection || "",
  });

  return {
    systemPrompt,
    summary: {
      projectType: input.projectType,
      persona: input.persona,
      mode: input.mode,
      hasPillarBundle: !!input.pillarBundleSection,
      hasMemory: !!input.projectMemorySection,
      hasProfile: !!input.userProfileSection,
    },
  };
}

/** Serialise @-mention context data into a readable block for the prompt. */
export function serializeMentionedContext(context: unknown): string {
  if (!context) return "No specific items mentioned.";
  try {
    return JSON.stringify(context, null, 2);
  } catch {
    return "No specific items mentioned.";
  }
}
