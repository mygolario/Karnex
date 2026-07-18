import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { getGamificationSummary } from "@/lib/account/server";

/** GET /api/user/gamification — server-backed XP/level/rank summary. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const gamification = await getGamificationSummary(session.user.id);
  return NextResponse.json({ gamification });
}
