import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

const VALID_PROVIDERS = ["youtube", "google_calendar", "instagram", "telegram", "zapier"];

/** GET /api/user/integrations — list connected integrations. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rows = await prisma.userIntegration.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  // Never expose raw credentials to the client.
  return NextResponse.json({
    integrations: rows.map((row) => {
      const safe: Record<string, unknown> = { ...row };
      delete safe.credentials;
      return {
        ...safe,
        connectedAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    }),
  });
}

/**
 * POST /api/user/integrations — connect (or update) an integration.
 * In a production setup this would follow an OAuth flow; here we accept
 * provider + metadata + credentials posted from the UI / OAuth callback.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const provider = body.provider as string;
  if (!provider || !VALID_PROVIDERS.includes(provider)) {
    return NextResponse.json({ error: "Invalid provider" }, { status: 400 });
  }

  const row = await prisma.userIntegration.upsert({
    where: { userId_provider: { userId: session.user.id, provider } },
    create: {
      userId: session.user.id,
      provider,
      providerAccountId: body.providerAccountId || null,
      credentials: body.credentials || null,
      metadata: body.metadata || null,
      isConnected: true,
    },
    update: {
      providerAccountId: body.providerAccountId || null,
      credentials: body.credentials || null,
      metadata: body.metadata || null,
      isConnected: true,
    },
  });

  return NextResponse.json({ success: true, id: row.id });
}

/** DELETE /api/user/integrations?provider=... — disconnect an integration. */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const provider = searchParams.get("provider");
  if (!provider) return NextResponse.json({ error: "Missing provider" }, { status: 400 });

  await prisma.userIntegration.deleteMany({
    where: { userId: session.user.id, provider },
  });
  return NextResponse.json({ success: true });
}
