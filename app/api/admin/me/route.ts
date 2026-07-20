import { NextResponse } from "next/server";
import { requireAdminResult } from "@/lib/admin/require-admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Server-side admin check — Prisma role === "admin" only.
 * Client hooks must call this; never trust ADMIN_EMAILS in the browser.
 */
export async function GET() {
  try {
    const result = await requireAdminResult();
    if (!result.ok) {
      return NextResponse.json({ isAdmin: false }, { status: 401 });
    }
    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    console.error("admin/me error:", error);
    return NextResponse.json({ isAdmin: false }, { status: 500 });
  }
}
