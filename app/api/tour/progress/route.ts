import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { getServerTourProgress, upsertServerTourProgress } from "@/lib/tour/server";

/** GET /api/tour/progress — fetch the current user's server-backed tour progress. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const progress = await getServerTourProgress(session.user.id);
  return NextResponse.json({ progress });
}

/**
 * PATCH /api/tour/progress — merge a partial update into the current user's
 * tour progress. Called by the client store as a debounced background sync;
 * failures are non-fatal since localStorage remains the fast local cache.
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const allowedKeys = [
    "completedTours",
    "skippedTours",
    "completedChecklistItems",
    "dismissedBeacons",
    "persona",
    "experienceLevel",
    "primaryGoal",
    "hasSeenWelcome",
    "disableAutoStart",
    "lastSeenWhatsNewVersion",
    "lastKnownProjectType",
    "lastKnownPlan",
    "xpDelta",
  ] as const;

  const patch: Record<string, unknown> = {};
  for (const key of allowedKeys) {
    if (key in body) patch[key] = body[key];
  }

  const progress = await upsertServerTourProgress(session.user.id, patch);
  return NextResponse.json({ progress });
}
