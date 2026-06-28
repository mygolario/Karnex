import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { callAIWithValidation, WizardExtractionSchema } from "@/lib/ai-validation";
import { checkAILimit } from "@/lib/ai-limit-middleware";
import { computeQualityScore } from "@/lib/onboarding/quality-score";
import type { ProjectType } from "@/app/new-project/genesis-constants";

const MAX_CHAT_TURNS = 4;

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { onboardingId, message, context } = body;

    if (!onboardingId || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const row = await prisma.projectOnboarding.findFirst({
      where: { id: onboardingId, userId: session.user.id },
    });
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (row.chatTurnsUsed >= MAX_CHAT_TURNS) {
      return NextResponse.json(
        { error: "CHAT_LIMIT", message: "حداکثر پرسش‌های هوش مصنوعی استفاده شد. لطفاً از کارت‌ها استفاده کنید." },
        { status: 429 }
      );
    }

    const { errorResponse } = await checkAILimit();
    if (errorResponse) {
      return NextResponse.json(
        { error: "AI_LIMIT_REACHED", message: "سقف هوش مصنوعی" },
        { status: 429 }
      );
    }

    const pillar = row.pillar as ProjectType | null;
    const vision = row.projectVision ?? "";
    const answers = (row.answers as Record<string, string>) ?? {};

    const systemPrompt = `You are Karnex onboarding assistant. Extract business entities from user input in Persian.
Return JSON with idea, problem, audience, budget, isComplete.
Context pillar: ${pillar ?? "unknown"}
Existing vision: ${vision}
Existing answers: ${JSON.stringify(answers)}
User message: ${message}`;

    const extracted = await callAIWithValidation(
      message,
      { systemPrompt, maxTokens: 800, temperature: 0.3, timeoutMs: 20000 },
      WizardExtractionSchema
    );

    const audience = extracted.audience || row.audience || "";
    const budget = extracted.budget || row.budget || "";

    const quality = computeQualityScore({
      pillar,
      projectName: row.projectName ?? "",
      projectVision: vision,
      answers,
      audience: audience ?? "",
      budget: budget ?? "",
    });

    const followUp =
      quality.score < 70 && !extracted.isComplete
        ? generateFollowUp(pillar, quality.gaps[0]?.field)
        : null;

    await prisma.projectOnboarding.update({
      where: { id: onboardingId },
      data: {
        chatTurnsUsed: row.chatTurnsUsed + 1,
        audience: audience || undefined,
        budget: budget || undefined,
        extractedData: extracted as object,
        qualityScore: quality.score,
      },
    });

    return NextResponse.json({
      extracted,
      quality,
      followUp,
      turnsRemaining: MAX_CHAT_TURNS - row.chatTurnsUsed - 1,
    });
  } catch (error) {
    console.error("genesis-chat error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function generateFollowUp(pillar: ProjectType | null, field?: string): string {
  if (field === "audience") return "مخاطب اصلی شما چه کسانی هستند؟ (سن، علاقه، موقعیت)";
  if (field === "budget") return "بودجه تقریبی برای ۳ ماه اول چقدر در نظر گرفته‌اید؟";
  if (field === "vision") return "لطفاً مشکل، راه‌حل و مخاطب را در ۲–۳ جمله توضیح دهید.";
  if (pillar === "creator") return "چه نوع محتوایی تولید می‌کنید و کجا منتشر می‌شود؟";
  if (pillar === "traditional") return "کسب‌وکار فیزیکی است یا آنلاین؟ مشتری محلی دارید؟";
  return "یک جزئیات مهم دیگر درباره ایده‌تان بگویید تا طرح دقیق‌تر شود.";
}
