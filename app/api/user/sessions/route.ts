import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { listSessions, revokeSession, revokeAllSessions, recordLoginEvent } from "@/lib/account/server";

/** GET /api/user/sessions — active sessions + recent login history. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const [sessions, loginEvents] = await Promise.all([
    listSessions(userId),
    prisma.loginEvent.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);
  return NextResponse.json({
    sessions: sessions.map((s) => ({
      ...s,
      lastActive: s.lastActive.toISOString(),
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt?.toISOString?.() ?? null,
      revokedAt: s.revokedAt?.toISOString?.() ?? null,
    })),
    loginEvents: loginEvents.map((e) => ({
      ...e,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}

/** DELETE /api/user/sessions?id=... — revoke one session (or all if id=all). */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id || id === "all") {
    await revokeAllSessions(userId);
    await recordLoginEvent(userId, { status: "success", method: "revoke_all" });
    return NextResponse.json({ success: true, revoked: "all" });
  }

  await revokeSession(userId, id);
  return NextResponse.json({ success: true, revoked: id });
}
