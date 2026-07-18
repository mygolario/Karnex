import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncSupabaseUser } from "@/lib/auth/sync-user";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUser = await syncSupabaseUser(user);
  return NextResponse.json({ userId: appUser.id });
}
