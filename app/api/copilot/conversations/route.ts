import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/session";
import type { CopilotMode, CopilotPersona } from "@/lib/copilot/types";

/** GET /api/copilot/conversations?projectId=... — list conversations for the user */
export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId") || undefined;

    const where: any = { userId };
    if (projectId) where.projectId = projectId;

    const conversations = await prisma.chatConversation.findMany({
      where,
      orderBy: [{ pinned: "desc" }, { lastMessageAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        mode: true,
        persona: true,
        model: true,
        pinned: true,
        projectId: true,
        lastMessagePreview: true,
        lastMessageAt: true,
        createdAt: true,
        _count: { select: { messages: true } },
      },
      take: 100,
    });

    const rows = conversations.map((c) => ({
      id: c.id,
      title: c.title,
      mode: c.mode,
      persona: c.persona,
      model: c.model,
      pinned: c.pinned,
      projectId: c.projectId,
      lastMessagePreview: c.lastMessagePreview,
      lastMessageAt: c.lastMessageAt?.getTime() ?? null,
      messageCount: c._count.messages,
      createdAt: c.createdAt.getTime(),
    }));

    return NextResponse.json({ conversations: rows });
  } catch (error: any) {
    console.error("List conversations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** POST /api/copilot/conversations — create a new conversation */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId || null;
    const mode: CopilotMode = body.mode || "cofounder";
    const persona: CopilotPersona = body.persona || "default";
    const title = body.title || "گفتگوی جدید";

    // If a projectId is provided, validate the user owns/has access to it.
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [{ userId }, { members: { some: { userId } } }],
        },
        select: { id: true },
      });
      if (!project) {
        return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
      }
    }

    const conversation = await prisma.chatConversation.create({
      data: {
        userId,
        projectId,
        title,
        mode,
        persona,
      },
    });

    return NextResponse.json({
      conversation: {
        id: conversation.id,
        title: conversation.title,
        mode: conversation.mode,
        persona: conversation.persona,
        model: conversation.model,
        pinned: conversation.pinned,
        projectId: conversation.projectId,
        lastMessagePreview: conversation.lastMessagePreview,
        lastMessageAt: conversation.lastMessageAt?.getTime() ?? null,
        messageCount: 0,
        createdAt: conversation.createdAt.getTime(),
      },
    });
  } catch (error: any) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
