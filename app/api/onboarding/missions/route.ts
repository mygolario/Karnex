import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { completeMission, completeOnboarding, awardOnboardingXp } from "@/lib/onboarding/server";
import prisma from "@/lib/prisma";
import { ONBOARDING_MISSIONS } from "@/lib/onboarding/orchestrator";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRow = await prisma.userOnboarding.findUnique({
      where: { userId: session.user.id },
    });
    const profile = userRow?.profileData as { role?: string } | null;
    const projectRow = await prisma.projectOnboarding.findFirst({
      where: { userId: session.user.id, completedAt: null },
      orderBy: { updatedAt: "desc" },
    });

    const pillar = projectRow?.pillar ?? null;
    const missions = ONBOARDING_MISSIONS.filter((m) => {
      if (m.projectTypes?.length && pillar && !m.projectTypes.includes(pillar as "startup" | "traditional" | "creator")) {
        return false;
      }
      if (m.roles?.length && profile?.role && !m.roles.includes(profile.role)) return false;
      return true;
    }).slice(0, 6);

    const completed = Array.isArray(userRow?.completedMissions)
      ? (userRow!.completedMissions as string[])
      : [];

    return NextResponse.json({
      missions: missions.map((m) => ({ ...m, completed: completed.includes(m.id) })),
      gamification: userRow?.gamification ?? null,
    });
  } catch (error) {
    console.error("GET missions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { missionId, action } = body;

    if (action === "complete_onboarding") {
      await completeOnboarding(session.user.id);
      await awardOnboardingXp(session.user.id, 100, "launch_complete");
      return NextResponse.json({ success: true });
    }

    const mission = ONBOARDING_MISSIONS.find((m) => m.id === missionId);
    if (!mission) {
      return NextResponse.json({ error: "Unknown mission" }, { status: 400 });
    }

    const result = await completeMission(session.user.id, mission.id, mission.xp);
    return NextResponse.json(result);
  } catch (error) {
    console.error("POST missions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
