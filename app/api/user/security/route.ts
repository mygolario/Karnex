import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

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
 * PATCH /api/user/security — toggle 2FA.
 * Body: { enableTwoFactor: boolean }
 *
 * NOTE: This stores a placeholder TOTP secret. A full TOTP/QR + backup-code
 * implementation would use an OTP library (e.g. otplib) and verify the code;
 * kept minimal here to avoid adding dependencies without confirmation.
 */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  if (typeof body.enableTwoFactor === "boolean") {
    const secret = body.enableTwoFactor ? randomBytes(20).toString("hex") : null;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorEnabled: body.enableTwoFactor, twoFactorSecret: secret },
    });
    return NextResponse.json({ twoFactorEnabled: body.enableTwoFactor });
  }

  return NextResponse.json({ error: "No valid fields" }, { status: 400 });
}
