import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

async function verifyAccess(projectId: string, userId: string, requireWrite: boolean) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      OR: requireWrite
        ? [
            { userId },
            { members: { some: { userId, role: { in: ["admin", "editor"] } } } },
          ]
        : [
            { userId },
            { members: { some: { userId } } },
          ],
    },
    select: { id: true },
  });
  return !!project;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ projectId: string; canvasId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, canvasId } = await params;

    if (!(await verifyAccess(projectId, session.user.id, false))) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const versions = await prisma.canvasVersion.findMany({
      where: { canvasId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ versions });
  } catch (error) {
    console.error("Versions GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string; canvasId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, canvasId } = await params;
    const body = await req.json();

    if (!(await verifyAccess(projectId, session.user.id, true))) {
      return NextResponse.json({ error: "No write access" }, { status: 403 });
    }

    const cards = await prisma.card.findMany({
      where: { canvasId },
      orderBy: [{ section: "asc" }, { order: "asc" }],
    });

    const snapshot: Record<string, unknown[]> = {};
    for (const card of cards) {
      if (!snapshot[card.section]) snapshot[card.section] = [];
      snapshot[card.section].push({
        id: card.id,
        content: card.content,
        color: card.color,
        cardType: card.cardType,
        order: card.order,
        x: card.x,
        y: card.y,
        metadata: card.metadata,
      });
    }

    const version = await prisma.canvasVersion.create({
      data: {
        canvasId,
        name: body.name || `نسخه ${new Date().toLocaleString("fa-IR")}`,
        snapshot: snapshot as object,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ version });
  } catch (error) {
    console.error("Version POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; canvasId: string }> }
) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, canvasId } = await params;
    const body = await req.json();
    const { versionId } = body;

    if (!(await verifyAccess(projectId, session.user.id, true))) {
      return NextResponse.json({ error: "No write access" }, { status: 403 });
    }

    const version = await prisma.canvasVersion.findFirst({
      where: { id: versionId, canvasId },
    });

    if (!version) {
      return NextResponse.json({ error: "Version not found" }, { status: 404 });
    }

    const snapshot = version.snapshot as Record<string, Array<{ id: string; content: string; color: string; cardType: string; order: number; x?: number | null; y?: number | null; metadata?: unknown }>>;

    await prisma.card.deleteMany({
      where: { canvasId },
    });

    const createPromises: Promise<unknown>[] = [];
    for (const [section, cards] of Object.entries(snapshot)) {
      for (const card of cards) {
        createPromises.push(
          prisma.card.create({
            data: {
              canvasId,
              section,
              content: card.content,
              cardType: card.cardType,
              color: card.color,
              order: card.order,
              x: card.x,
              y: card.y,
              metadata: card.metadata ? JSON.parse(JSON.stringify(card.metadata)) : undefined,
              updatedBy: session.user.id,
            },
          })
        );
      }
    }

    await Promise.all(createPromises);

    return NextResponse.json({ success: true, restoredFrom: versionId });
  } catch (error) {
    console.error("Version restore error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
