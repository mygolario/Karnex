import { createClient } from "@/lib/supabase/server";
import { syncSupabaseUser } from "@/lib/auth/sync-user";

export interface AppSessionUser {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  role: string | null;
}

export interface AppSession {
  user: AppSessionUser;
}

/** Drop-in replacement for NextAuth `auth()` — returns Prisma CUID as user.id */
export async function auth(): Promise<AppSession | null> {
  const supabase = await createClient();
  const {
    data: { user: supabaseUser },
  } = await supabase.auth.getUser();

  if (!supabaseUser) return null;

  const appUser = await syncSupabaseUser(supabaseUser);

  return {
    user: {
      id: appUser.id,
      email: appUser.email,
      name: appUser.name,
      image: appUser.image,
      role: appUser.role,
    },
  };
}
