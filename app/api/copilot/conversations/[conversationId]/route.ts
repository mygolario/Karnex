import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/session";
import type { CopilotMode, CopilotPersona } from "@/lib/copilot/types";

async function getOwnedConversation(conversationId: string, userId: string) {
  return prisma.chatConversation.findFirst({
    where: { id: conversationId, userId },
    select: { id: true, projectId: true, userId: true },
  });
}

/** GET /api/copilot/conversations/[id] — full message history */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { conversationId } = await params;
    const owned = await getOwnedConversation(conversationId, session.user.id);
    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        followUps: true,
        toolCalls: true,
        parentMessageId: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      messages: messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        followUps: m.followUps,
        toolCalls: m.toolCalls,
        parentMessageId: m.parentMessageId,
        createdAt: m.createdAt.getTime(),
      })),
    });
  } catch (error: any) {
    console.error("Get conversation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** PATCH /api/copilot/conversations/[id] — update metadata (title/pinned/mode/persona) */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { conversationId } = await params;
    const owned = await getOwnedConversation(conversationId, session.user.id);
    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const data: any = {};
    if (typeof body.title === "string") data.title = body.title.slice(0, 120);
    if (typeof body.pinned === "boolean") data.pinned = body.pinned;
    if (body.mode) data.mode = body.mode as CopilotMode;
    if (body.persona) data.persona = body.persona as CopilotPersona;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await prisma.chatConversation.update({
      where: { id: conversationId },
      data,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update conversation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** DELETE /api/copilot/conversations/[id] — delete conversation + messages (cascade) */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { conversationId } = await params;
    const owned = await getOwnedConversation(conversationId, session.user.id);
    if (!owned) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.chatConversation.delete({ where: { id: conversationId } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete conversation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
