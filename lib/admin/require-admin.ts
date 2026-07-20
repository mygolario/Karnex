import { auth, type AppSessionUser } from "@/lib/auth/session";

export class AdminForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message);
    this.name = "AdminForbiddenError";
  }
}

/** Parse ADMIN_EMAILS bootstrap allowlist (comma-separated). */
export function getAdminEmailAllowlist(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailInAdminAllowlist(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmailAllowlist().includes(email.toLowerCase());
}

/**
 * Runtime gate: Prisma `role === "admin"` only.
 * ADMIN_EMAILS is bootstrap — sync writes role on login; do not use allowlist here.
 */
export async function requireAdmin(): Promise<AppSessionUser> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    throw new AdminForbiddenError();
  }
  return session.user;
}

export async function requireAdminResult(): Promise<
  { ok: true; user: AppSessionUser } | { ok: false; error: string }
> {
  try {
    const user = await requireAdmin();
    return { ok: true, user };
  } catch {
    return { ok: false, error: "Forbidden" };
  }
}
