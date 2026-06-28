import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { OnboardingProfileSchema } from "@/lib/onboarding/profile-schema";
import { saveProfileGate } from "@/lib/onboarding/server";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = OnboardingProfileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const user = await saveProfileGate(session.user.id, parsed.data);
    return NextResponse.json({ user, nextStep: "genesis" });
  } catch (error) {
    console.error("POST onboarding profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
