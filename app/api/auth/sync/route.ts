import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncSupabaseUser } from '@/lib/auth/sync-user';
import { recordAuthLoginEvent } from '@/lib/auth/record-login';
import { attachNewSignupCookie } from '@/lib/analytics/signup-cookie';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let recordLogin = false;
  let method = 'password';
  try {
    const body = (await request.json()) as {
      recordLogin?: boolean;
      method?: string;
    };
    recordLogin = Boolean(body?.recordLogin);
    if (typeof body?.method === 'string' && body.method.trim()) {
      method = body.method.trim();
    }
  } catch {
    // empty body is fine
  }

  const { user: appUser, isNew } = await syncSupabaseUser(user);
  if (recordLogin) {
    await recordAuthLoginEvent(appUser.id, method);
  }
  const response = NextResponse.json({ userId: appUser.id, isNew });
  // Tell the client to fire signup_completed once PostHog loads + consent is
  // accepted. This unifies the email/password path with the OAuth path, which
  // sets the same cookie via attachNewSignupCookie in the auth callback routes.
  // Without this, email signups can be lost when the user hasn't accepted the
  // cookie banner yet at the moment the client-side markSignupCompletedOnce
  // call fires (PostHog not loaded → 20s queue expiry → silent drop).
  if (isNew) attachNewSignupCookie(response);
  return response;
}
