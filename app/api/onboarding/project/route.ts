import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { computeQualityScore } from "@/lib/onboarding/quality-score";
import type { ProjectType } from "@/app/new-project/genesis-constants";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const row = await prisma.projectOnboarding.findFirst({
      where: { userId: session.user.id, completedAt: null },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ project: row });
  } catch (error) {
    console.error("GET project onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const row = await prisma.projectOnboarding.create({
      data: { userId: session.user.id, currentStep: "genesis" },
    });

    await prisma.userOnboarding.updateMany({
      where: { userId: session.user.id },
      data: { currentStep: "genesis", onboardingCompletedAt: null },
    });

    return NextResponse.json({ project: row });
  } catch (error) {
    console.error("POST project onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { id, ...patch } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing onboarding id" }, { status: 400 });
    }

    const existing = await prisma.projectOnboarding.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const merged = {
      pillar: (patch.pillar ?? existing.pillar) as ProjectType | null,
      projectName: patch.projectName ?? existing.projectName ?? "",
      projectVision: patch.projectVision ?? existing.projectVision ?? "",
      answers: { ...(existing.answers as object), ...(patch.answers ?? {}) },
      audience: patch.audience ?? existing.audience ?? "",
      budget: patch.budget ?? existing.budget ?? "",
    };

    const userOnboarding = await prisma.userOnboarding.findUnique({
      where: { userId: session.user.id },
    });

    const quality = computeQualityScore({
      pillar: merged.pillar,
      projectName: merged.projectName,
      projectVision: merged.projectVision,
      answers: merged.answers as Record<string, string>,
      audience: merged.audience,
      budget: merged.budget,
      profileComplete: Boolean(userOnboarding?.profileCompletedAt),
    });

    const updated = await prisma.projectOnboarding.update({
      where: { id },
      data: {
        pillar: patch.pillar ?? undefined,
        projectName: patch.projectName ?? undefined,
        projectVision: patch.projectVision ?? undefined,
        answers: patch.answers ? (merged.answers as object) : undefined,
        audience: patch.audience ?? undefined,
        budget: patch.budget ?? undefined,
        genesisDraft: patch.genesisDraft ?? undefined,
        currentStep: patch.currentStep ?? undefined,
        qualityScore: quality.score,
      },
    });

    return NextResponse.json({ project: updated, quality });
  } catch (error) {
    console.error("PATCH project onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
