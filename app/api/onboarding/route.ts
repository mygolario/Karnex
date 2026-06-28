import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { getOnboardingState } from "@/lib/onboarding/server";
import { resolveOnboardingRedirect } from "@/lib/onboarding/orchestrator";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const state = await getOnboardingState(userId);
    const projectCount = await prisma.project.count({
      where: { userId, deletedAt: null },
    });

    const redirectTo = resolveOnboardingRedirect({
      user: state.user,
      project: state.project,
      hasProjects: projectCount > 0,
    });

    return NextResponse.json({ ...state, redirectTo, projectCount });
  } catch (error) {
    console.error("GET onboarding error:", error);
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
    const { currentStep } = body;

    if (currentStep && typeof currentStep === "string") {
      await prisma.userOnboarding.update({
        where: { userId: session.user.id },
        data: { currentStep },
      });
    }

    const state = await getOnboardingState(session.user.id);
    return NextResponse.json(state);
  } catch (error) {
    console.error("PATCH onboarding error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
