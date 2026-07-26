import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

const THROTTLE_MS = 5 * 60 * 1000;

/** Lightweight last-seen heartbeat for authenticated users (throttled server-side). */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { lastSeenAt: true },
  });

  const now = new Date();
  if (
    existing?.lastSeenAt &&
    now.getTime() - existing.lastSeenAt.getTime() < THROTTLE_MS
  ) {
    return NextResponse.json({ ok: true, throttled: true });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { lastSeenAt: now },
  });

  return NextResponse.json({ ok: true });
}
