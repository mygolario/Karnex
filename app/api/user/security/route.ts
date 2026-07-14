import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

/**
 * GET /api/user/security — security summary (2FA status, connected accounts, password set).
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const [user, accounts] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { password: true, twoFactorEnabled: true, email: true },
    }),
    prisma.account.findMany({ where: { userId }, select: { provider: true, providerAccountId: true } }),
  ]);

  return NextResponse.json({
    passwordSet: !!user?.password,
    twoFactorEnabled: !!user?.twoFactorEnabled,
    connectedAccounts: accounts.map((a) => ({ provider: a.provider, id: a.providerAccountId })),
    email: user?.email,
  });
}

/**
 * PATCH /api/user/security — reserved for future real TOTP 2FA.
 * Placeholder 2FA is disabled for launch (do not store fake secrets).
 */
export async function PATCH() {
  return NextResponse.json(
    {
      error: "TWO_FACTOR_COMING_SOON",
      message: "تأیید دو مرحله‌ای به‌زودی فعال می‌شود.",
    },
    { status: 501 },
  );
}
