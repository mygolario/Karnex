import prisma from "@/lib/prisma";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { archiveAppUser } from "@/lib/auth/archive-user";
import { creditsSeedFromEmailQuota } from "@/lib/auth/email-ai-quota";
import { isEmailInAdminAllowlist } from "@/lib/admin/require-admin";
import type { Prisma } from "../../prisma/client";

/** Bootstrap: ADMIN_EMAILS → Prisma role=admin (runtime gates use role only). */
async function ensureAdminRoleFromAllowlist<
  T extends { id: string; email: string | null; role: string | null },
>(user: T): Promise<T> {
  if (user.role === "admin") return user;
  if (!isEmailInAdminAllowlist(user.email)) return user;
  await prisma.user.update({
    where: { id: user.id },
    data: { role: "admin" },
  });
  return { ...user, role: "admin" };
}

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
  if (bySupabaseId) return ensureAdminRoleFromAllowlist(bySupabaseId);

  const byEmail = await prisma.user.findFirst({
    where: { email: supabaseUser.email, deletedAt: null },
  });

  if (byEmail) {
    // Legacy migration: link Supabase ID to a row that never had one.
    if (!byEmail.supabaseUserId) {
      const linked = await prisma.user.update({
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
      return ensureAdminRoleFromAllowlist(linked);
    }

    // Same Supabase auth identity — normal re-login.
    if (byEmail.supabaseUserId === supabaseUser.id) {
      return ensureAdminRoleFromAllowlist(byEmail);
    }

    // New Supabase auth user re-used an email from a previous auth identity.
    // Archive the old app record (subscription does not carry over).
    await archiveAppUser(byEmail.id);
  }

  const name = displayName(supabaseUser);
  const credits = await creditsSeedFromEmailQuota(supabaseUser.email);
  const newUser = await prisma.user.create({
    data: {
      supabaseUserId: supabaseUser.id,
      email: supabaseUser.email,
      name,
      image: avatarUrl(supabaseUser),
      emailVerified: supabaseUser.email_confirmed_at
        ? new Date(supabaseUser.email_confirmed_at)
        : null,
      credits: credits as Prisma.InputJsonValue,
    },
  });

  try {
    const { seedWelcomeNotifications } = await import("@/lib/notifications");
    await seedWelcomeNotifications(newUser.id);
  } catch (seedErr) {
    console.error("Failed to seed welcome notifications on user sync:", seedErr);
  }

  // Welcome email — best-effort, never block signup
  try {
    const { sendEmail } = await import("@/lib/email");
    const { getWelcomeTemplate } = await import("@/lib/email-templates");
    const display = name || "کاربر";
    await sendEmail({
      to: supabaseUser.email,
      subject: "به کارنکس خوش آمدید — هم‌بنیان‌گذار هوشمند شما",
      templateName: "welcome",
      htmlContent: getWelcomeTemplate(display, "startup"),
      name: display,
    });
  } catch (emailErr) {
    console.error("Failed to send welcome email on user sync:", emailErr);
  }

  return ensureAdminRoleFromAllowlist(newUser);
}
