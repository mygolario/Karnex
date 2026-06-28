import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messageId, rating, reason } = await req.json();
    if (!rating || !["up", "down"].includes(rating)) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    if (messageId) {
      const msg = await prisma.chatMessage.findUnique({
        where: { id: messageId },
      });
      if (msg) {
        await prisma.aiFeedback.upsert({
          where: { messageId },
          create: { messageId, rating, reason: reason || null },
          update: { rating, reason: reason || null },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("Feedback error:", e);
    return NextResponse.json({ success: true });
  }
}
