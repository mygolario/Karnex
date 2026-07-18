import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Server-side admin check — Prisma role OR ADMIN_EMAILS allowlist.
 * Client hooks must call this; never trust ADMIN_EMAILS in the browser.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }

    const allowlist = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const email = (user.email || "").toLowerCase();
    const isAdmin =
      user.role === "admin" || (email.length > 0 && allowlist.includes(email));

    return NextResponse.json({ isAdmin });
  } catch (error) {
    console.error("admin/me error:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
