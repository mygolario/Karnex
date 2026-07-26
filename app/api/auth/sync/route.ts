import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncSupabaseUser } from "@/lib/auth/sync-user";
import { recordAuthLoginEvent } from "@/lib/auth/record-login";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let recordLogin = false;
  let method = "password";
  try {
    const body = (await request.json()) as {
      recordLogin?: boolean;
      method?: string;
    };
    recordLogin = Boolean(body?.recordLogin);
    if (typeof body?.method === "string" && body.method.trim()) {
      method = body.method.trim();
    }
  } catch {
    // empty body is fine
  }

  const { user: appUser, isNew } = await syncSupabaseUser(user);
  if (recordLogin) {
    await recordAuthLoginEvent(appUser.id, method);
  }
  return NextResponse.json({ userId: appUser.id, isNew });
}
