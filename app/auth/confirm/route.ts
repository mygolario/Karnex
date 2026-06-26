import { createClient } from "@/lib/supabase/server";
import { syncSupabaseUser } from "@/lib/auth/sync-user";
import { NextResponse } from "next/server";

/** Handles email confirmation and password recovery links from Supabase */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard/overview";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "email" | "recovery" | "signup" | "invite" | "magiclink" | "email_change",
    });

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await syncSupabaseUser(user);
      }

      if (type === "recovery") {
        return NextResponse.redirect(`${origin}/reset-password`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_confirm_error`);
}
