import { createClient } from "@/lib/supabase/server";
import { syncSupabaseUser } from "@/lib/auth/sync-user";
import { attachNewSignupCookie } from "@/lib/analytics/signup-cookie";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard/overview";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      let isNew = false;
      if (user) {
        const result = await syncSupabaseUser(user);
        isNew = result.isNew;
      }
      const response = NextResponse.redirect(`${origin}${next}`);
      if (isNew) attachNewSignupCookie(response);
      return response;
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
