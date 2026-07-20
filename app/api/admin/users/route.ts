import { NextResponse } from "next/server";
import { getAdminUsers } from "@/lib/admin-actions";

export const dynamic = "force-dynamic";

/** Thin API wrapper around getAdminUsers (prefer server actions from the admin UI). */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? undefined;
    const page = Number(searchParams.get("page") || "1");
    const res = await getAdminUsers({ search, page });
    if (res.error) {
      return NextResponse.json({ error: res.error }, { status: 403 });
    }
    return NextResponse.json(res);
  } catch (error) {
    console.error("GET Admin Users Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
