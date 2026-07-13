import "server-only";
import prisma from "@/lib/prisma";
import type { Referral, ReferralInput, ReferralStatus } from "./types";

function randomCode(len = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]!;
  }
  return out;
}

function toReferral(r: {
  id: string;
  projectId: string;
  code: string;
  referrerId: string | null;
  referrerName: string | null;
  refereeId: string | null;
  status: string;
  rewardPoints: number;
  createdAt: Date;
}): Referral {
  return {
    id: r.id,
    projectId: r.projectId,
    code: r.code,
    referrerId: r.referrerId ?? null,
    referrerName: r.referrerName ?? null,
    refereeId: r.refereeId ?? null,
    status: r.status as ReferralStatus,
    rewardPoints: r.rewardPoints,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function listReferrals(projectId: string): Promise<Referral[]> {
  const rows = await prisma.referral.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map(toReferral);
}

export async function createReferral(projectId: string, input: ReferralInput = {}): Promise<Referral> {
  const code = (input.code?.trim() || randomCode()).toUpperCase();
  const status: ReferralStatus = input.status || "pending";

  try {
    const row = await prisma.referral.create({
      data: {
        projectId,
        code,
        referrerId: input.referrerId ?? null,
        referrerName: input.referrerName?.trim() || null,
        refereeId: input.refereeId ?? null,
        status,
        rewardPoints: input.rewardPoints ?? 0,
      },
    });
    return toReferral(row);
  } catch {
    throw new Error("کد معرفی تکراری است؛ دوباره تلاش کنید");
  }
}
