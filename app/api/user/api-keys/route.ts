import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { createApiKey, revokeApiKey } from "@/lib/account/server";

/** GET /api/user/api-keys — list active API keys (never returns the raw secret). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const keys = await prisma.userApiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, label: true, prefix: true, scopes: true, lastUsed: true, createdAt: true, revokedAt: true },
  });
  return NextResponse.json({
    apiKeys: keys.map((k) => ({
      ...k,
      lastUsed: k.lastUsed?.toISOString?.() ?? null,
      createdAt: k.createdAt.toISOString(),
      revokedAt: k.revokedAt?.toISOString?.() ?? null,
    })),
  });
}

/** POST /api/user/api-keys — create a new API key. Returns the raw key ONCE. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const label = (body.label as string) || "API Key";
  const scopes = Array.isArray(body.scopes) ? body.scopes.filter((s: unknown) => typeof s === "string").slice(0, 10) as string[] : [];

  const created = await createApiKey(session.user.id, label, scopes);
  return NextResponse.json({
    id: created.id,
    prefix: created.prefix,
    key: created.raw, // only returned at creation time
    label,
    scopes,
  });
}

/** DELETE /api/user/api-keys?id=... — revoke a key. */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await revokeApiKey(session.user.id, id);
  return NextResponse.json({ success: true });
}
