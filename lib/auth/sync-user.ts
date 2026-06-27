import prisma from "@/lib/prisma";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { archiveAppUser } from "@/lib/auth/archive-user";

function displayName(supabaseUser: SupabaseUser): string | undefined {
  const meta = supabaseUser.user_metadata ?? {};
  return (
    (meta.full_name as string | undefined) ||
    (meta.name as string | undefined) ||
    supabaseUser.email?.split("@")[0]
  );
}

function avatarUrl(supabaseUser: SupabaseUser): string | undefined {
  const meta = supabaseUser.user_metadata ?? {};
  const url =
    (meta.avatar_url as string | undefined) ||
    (meta.picture as string | undefined);
  if (url && url.startsWith("http")) return url;
  const name = displayName(supabaseUser);
  if (name) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
  }
  return undefined;
}

export async function syncSupabaseUser(supabaseUser: SupabaseUser) {
  if (!supabaseUser.email) {
    throw new Error("Supabase user is missing email");
  }

  const bySupabaseId = await prisma.user.findFirst({
    where: { supabaseUserId: supabaseUser.id, deletedAt: null },
  });
  if (bySupabaseId) return bySupabaseId;

  const byEmail = await prisma.user.findFirst({
    where: { email: supabaseUser.email, deletedAt: null },
  });

  if (byEmail) {
    // Legacy migration: link Supabase ID to a row that never had one.
    if (!byEmail.supabaseUserId) {
      return prisma.user.update({
        where: { id: byEmail.id },
        data: {
          supabaseUserId: supabaseUser.id,
          name: byEmail.name || displayName(supabaseUser),
          image: byEmail.image || avatarUrl(supabaseUser),
          emailVerified: supabaseUser.email_confirmed_at
            ? new Date(supabaseUser.email_confirmed_at)
            : byEmail.emailVerified,
        },
      });
    }

    // Same Supabase auth identity — normal re-login.
    if (byEmail.supabaseUserId === supabaseUser.id) {
      return byEmail;
    }

    // New Supabase auth user re-used an email from a previous auth identity.
    // Archive the old app record (subscription does not carry over).
    await archiveAppUser(byEmail.id);
  }

  const name = displayName(supabaseUser);
  return prisma.user.create({
    data: {
      supabaseUserId: supabaseUser.id,
      email: supabaseUser.email,
      name,
      image: avatarUrl(supabaseUser),
      emailVerified: supabaseUser.email_confirmed_at
        ? new Date(supabaseUser.email_confirmed_at)
        : null,
    },
  });
}
