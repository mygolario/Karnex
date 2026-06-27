import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { markInsightRead, dismissInsight } from "@/lib/copilot/insights";

/** PATCH /api/copilot/insights/[id] { status: "read" | "dismissed" } */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  if (body.status === "dismissed") {
    await dismissInsight(id, userId);
  } else {
    await markInsightRead(id, userId);
  }
  return NextResponse.json({ ok: true });
}

/** DELETE /api/copilot/insights/[id] — dismiss */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;
  const { id } = await params;
  await dismissInsight(id, userId);
  return NextResponse.json({ ok: true });
}
