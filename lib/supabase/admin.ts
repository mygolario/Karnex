import { createClient } from "@/lib/supabase/server";

export async function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const { createClient: createSupabaseClient } = await import("@supabase/supabase-js");
  const ws = await import("ws").then((m) => m.default);
  return createSupabaseClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    realtime: { transport: ws as unknown as typeof WebSocket },
  });
}

/** Server-only admin client using service role */
export async function getAdminSupabase() {
  return createAdminClient();
}
