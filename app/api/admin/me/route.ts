import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Admin identity probe — Prisma role === "admin" only.
 * Authenticated non-admins get 200 {isAdmin:false} (not 401) so dashboards
 * don't spam the console. Unauthenticated requests still get 401.
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
    return NextResponse.json({
      isAdmin: session.user.role === "admin",
    });
  } catch (error) {
    console.error("admin/me error:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
