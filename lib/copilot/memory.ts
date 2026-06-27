import "server-only";
import prisma from "@/lib/prisma";
import { callCopilotChat } from "@/lib/openrouter";
import { parseJsonFromAI } from "@/lib/openrouter";

/**
 * Long-term memory + personalization for the Copilot.
 *
 * - `loadProfileSection` / `loadMemorySection`: read UserProfile / ProjectMemory
 *   and render a compact Persian section injected into the system prompt.
 * - `extractAndSaveMemory`: a cheap, non-blocking fast-tier job that runs after a
 *   conversation turn and distils durable facts/decisions/risks/questions into
 *   ProjectMemory so future turns can reference them.
 */

export async function loadUserProfile(userId: string) {
  return prisma.userProfile.findUnique({ where: { userId } });
}

export async function loadProjectMemory(projectId: string) {
  return prisma.projectMemory.findUnique({ where: { projectId } });
}

/** Build a short system-prompt section describing the user's preferences. */
export function buildUserProfileSection(profile: Awaited<ReturnType<typeof loadUserProfile>>): string {
  if (!profile) return "";
  const bits: string[] = [];
  if (profile.role) bits.push(`نقش کاربر: ${profile.role}`);
  if (profile.industry) bits.push(`صنعت: ${profile.industry}`);
  if (profile.businessStage) bits.push(`مرحله کسب‌وکار: ${profile.businessStage}`);
  if (profile.expertiseLevel && profile.expertiseLevel !== "beginner") {
    bits.push(`سطح تخصص: ${profile.expertiseLevel}`);
  }
  if (profile.preferredTone && profile.preferredTone !== "balanced") {
    bits.push(`لحن مورد نظر: ${profile.preferredTone}`);
  }
  if (Array.isArray(profile.goals) && profile.goals.length > 0) {
    bits.push(`اهداف: ${(profile.goals as string[]).join("، ")}`);
  }
  if (bits.length === 0) return "";

  const toneHint =
    profile.expertiseLevel === "expert"
      ? " از اصطلاحات تخصصی استفاده کن و توضیحات مقدماتی نده."
      : " مفاهیم را ساده و آموزشی بیان کن.";
  return `\nپروفایل کاربر:\n- ${bits.join("\n- ")}${toneHint}`;
}

/** Build a short system-prompt section describing remembered project facts. */
export function buildProjectMemorySection(memory: Awaited<ReturnType<typeof loadProjectMemory>>): string {
  if (!memory) return "";
  const lines: string[] = [];

  const decisions = asArray(memory.decisions);
  const questions = asArray(memory.openQuestions);
  const risks = asArray(memory.risks);
  const facts = asArray(memory.keyFacts);

  if (decisions.length) lines.push(`تصمیمات ثبت‌شده: ${decisions.map((d) => d.content).join("؛ ")}`);
  if (questions.length) lines.push(`پرسش‌های باز: ${questions.map((q) => q.content || q.question).join("؛ ")}`);
  if (risks.length) lines.push(`ریسک‌ها: ${risks.map((r) => r.content).join("؛ ")}`);
  if (facts.length) lines.push(`حقایق کلیدی: ${facts.map((f) => `${f.key ? f.key + ": " : ""}${f.content || f.value}`).join("؛ ")}`);

  if (lines.length === 0) return "";
  return `\nحافظه پروژه (از گفتگوهای قبلی):\n- ${lines.join("\n- ")}`;
}

function asArray(v: unknown): any[] {
  return Array.isArray(v) ? (v as any[]) : [];
}

interface ExtractedMemory {
  decisions?: { content: string }[];
  openQuestions?: { content: string }[];
  risks?: { content: string; severity?: string }[];
  keyFacts?: { content: string }[];
}

/**
 * Fast-tier, non-blocking memory extraction. Reads the latest user+assistant
 * turn, asks the cheap model to pull out durable facts, and appends them to
 * ProjectMemory. Designed to never throw into the request path.
 */
export async function extractAndSaveMemory(params: {
  userId: string;
  projectId: string;
  conversationId: string;
  userMessage: string;
  assistantMessage: string;
}): Promise<void> {
  const { projectId, userMessage, assistantMessage } = params;
  try {
    const sys = `You are a memory extractor. Read the latest conversation turn (in Persian) and extract ONLY durable, worth-remembering facts: firm decisions the user made, important constraints/facts, open questions, and risks. Ignore small talk and transient requests. Return JSON with keys: decisions[], openQuestions[], risks[], keyFacts[]. Each item is an object {content} (risks may add {severity: low|medium|high}). If nothing durable, return empty arrays. Output JSON only.`;

    const user = `کاربر: ${userMessage}\n\nدستیار: ${assistantMessage}\n\nJSON:`;

    const { response } = await callCopilotChat({
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      tier: "fast",
      timeoutMs: 20000,
    });

    const data = await response.json();
    const content: string = data?.choices?.[0]?.message?.content || "";
    if (!content.trim()) return;

    let extracted: ExtractedMemory;
    try {
      extracted = parseJsonFromAI(content) as ExtractedMemory;
    } catch {
      return;
    }

    const toAdd = (arr?: { content: string }[]) =>
      (arr || []).filter((x) => x && typeof x.content === "string" && x.content.trim());

    const newDecisions = toAdd(extracted.decisions);
    const newQuestions = toAdd(extracted.openQuestions);
    const newRisks = (extracted.risks || []).filter((x) => x?.content);
    const newFacts = toAdd(extracted.keyFacts);

    if (!newDecisions.length && !newQuestions.length && !newRisks.length && !newFacts.length) {
      return;
    }

    const stamp = () => new Date().toISOString();
    const wrap = (items: { content: string; severity?: string }[]) =>
      items.map((x) => ({
        id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        content: x.content,
        severity: x.severity,
        date: stamp(),
      }));

    const memory = await prisma.projectMemory.findUnique({ where: { projectId } });
    const merge = (field: "decisions" | "openQuestions" | "risks" | "keyFacts", items: any[]) => {
      if (!items.length) return undefined;
      const current = asArray(memory?.[field]);
      // de-duplicate by content
      const existingTexts = new Set(current.map((c) => (c.content || "").toString().trim()));
      const fresh = items.filter((i) => i.content && !existingTexts.has(i.content.trim()));
      return [...current, ...fresh];
    };

    const patch: any = {};
    const d = merge("decisions", wrap(newDecisions));
    const q = merge("openQuestions", wrap(newQuestions));
    const r = merge("risks", wrap(newRisks));
    const f = merge("keyFacts", wrap(newFacts));
    if (d) patch.decisions = d;
    if (q) patch.openQuestions = q;
    if (r) patch.risks = r;
    if (f) patch.keyFacts = f;

    if (Object.keys(patch).length === 0) return;

    if (memory) {
      await prisma.projectMemory.update({ where: { projectId }, data: patch });
    } else {
      await prisma.projectMemory.create({ data: { projectId, ...patch } });
    }
  } catch (err) {
    console.error("Memory extraction failed (non-fatal):", err);
  }
}
