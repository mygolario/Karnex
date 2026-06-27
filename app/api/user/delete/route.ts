import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { softDeleteUser } from "@/lib/account/server";
import { createClient } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";

/**
 * POST /api/user/delete — soft-delete the current user's account.
 * Sets `deletedAt`, cancels subscription, scrubs PII, and revokes all sessions.
 * Confirmation string must match "DELETE" to prevent accidents.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  if (body.confirm !== "DELETE") {
    return NextResponse.json({ error: "Confirmation required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  await softDeleteUser(session.user.id);

  if (supabaseUser?.id && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = await getAdminSupabase();
      await admin.auth.admin.deleteUser(supabaseUser.id);
    } catch (error) {
      console.error("[USER_DELETE] Supabase auth delete failed:", error);
    }
  }

  return NextResponse.json({ success: true });
}
