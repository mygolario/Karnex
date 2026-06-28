import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { generatePlanAction, createProjectAction } from "@/lib/project-actions";
import prisma from "@/lib/prisma";
import { computeQualityScore } from "@/lib/onboarding/quality-score";
import type { ProjectType } from "@/app/new-project/genesis-constants";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { onboardingId } = body;

    if (!onboardingId) {
      return NextResponse.json({ error: "Missing onboarding id" }, { status: 400 });
    }

    const row = await prisma.projectOnboarding.findFirst({
      where: { id: onboardingId, userId: session.user.id },
    });
    if (!row || !row.pillar) {
      return NextResponse.json({ error: "Incomplete onboarding" }, { status: 400 });
    }

    const userOnboarding = await prisma.userOnboarding.findUnique({
      where: { userId: session.user.id },
    });
    const profileData = userOnboarding?.profileData as Record<string, unknown> | null;

    const quality = computeQualityScore({
      pillar: row.pillar as ProjectType,
      projectName: row.projectName ?? "",
      projectVision: row.projectVision ?? "",
      answers: (row.answers as Record<string, string>) ?? {},
      audience: row.audience ?? "",
      budget: row.budget ?? "",
      profileComplete: Boolean(userOnboarding?.profileCompletedAt),
    });

    if (!quality.canGenerate) {
      return NextResponse.json(
        { error: "QUALITY_TOO_LOW", quality, message: "لطفاً فیلدهای ضروری را تکمیل کنید." },
        { status: 400 }
      );
    }

    const genesisAnswers = {
      ...((row.answers as Record<string, string>) ?? {}),
      ...(profileData
        ? {
            profile_role: String(profileData.role ?? ""),
            profile_industry: String(profileData.industry ?? ""),
            profile_stage: String(profileData.businessStage ?? ""),
          }
        : {}),
    };

    const planResult = await generatePlanAction({
      projectType: row.pillar,
      idea: row.projectVision,
      projectName: row.projectName,
      genesisAnswers,
      audience: row.audience ?? "",
      budget: row.budget ?? "",
    });

    if (planResult.error || !("plan" in planResult) || !planResult.plan) {
      return NextResponse.json(planResult, { status: planResult.error === "AI_LIMIT_REACHED" ? 429 : 400 });
    }

    const completePlan = {
      ...(planResult.plan as Record<string, unknown>),
      projectName: row.projectName,
      projectType: row.pillar,
      ideaInput: row.projectVision,
      genesisAnswers,
      onboardingQualityScore: quality.score,
    };

    const createResult = await createProjectAction(completePlan);
    if (createResult.error) {
      return NextResponse.json(createResult, { status: 400 });
    }

    await prisma.projectOnboarding.update({
      where: { id: onboardingId },
      data: {
        projectId: createResult.id,
        currentStep: "reveal",
        qualityScore: quality.score,
        completedAt: null,
      },
    });

    await prisma.userOnboarding.update({
      where: { userId: session.user.id },
      data: { currentStep: "reveal" },
    });

    return NextResponse.json({
      success: true,
      projectId: createResult.id,
      plan: completePlan,
      quality,
    });
  } catch (error) {
    console.error("onboarding generate error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
