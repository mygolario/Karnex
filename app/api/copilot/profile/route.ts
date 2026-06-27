import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/session";

const VALID_TONES = ["formal", "casual", "balanced"];
const VALID_LEVELS = ["beginner", "intermediate", "expert"];

/** GET /api/copilot/profile — current user's personalization profile */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });
    return NextResponse.json({
      profile: profile
        ? {
            role: profile.role,
            industry: profile.industry,
            businessStage: profile.businessStage,
            goals: profile.goals,
            preferredTone: profile.preferredTone,
            expertiseLevel: profile.expertiseLevel,
            language: profile.language,
          }
        : null,
    });
  } catch (error: any) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** PATCH /api/copilot/profile — upsert personalization fields */
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));

    const data: any = {};
    if (typeof body.role === "string") data.role = body.role.slice(0, 80);
    if (typeof body.industry === "string") data.industry = body.industry.slice(0, 80);
    if (typeof body.businessStage === "string") data.businessStage = body.businessStage.slice(0, 40);
    if (Array.isArray(body.goals)) data.goals = body.goals.filter((g: any) => typeof g === "string").slice(0, 10);
    if (typeof body.preferredTone === "string" && VALID_TONES.includes(body.preferredTone)) {
      data.preferredTone = body.preferredTone;
    }
    if (typeof body.expertiseLevel === "string" && VALID_LEVELS.includes(body.expertiseLevel)) {
      data.expertiseLevel = body.expertiseLevel;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });

    return NextResponse.json({
      profile: {
        role: profile.role,
        industry: profile.industry,
        businessStage: profile.businessStage,
        goals: profile.goals,
        preferredTone: profile.preferredTone,
        expertiseLevel: profile.expertiseLevel,
        language: profile.language,
      },
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
