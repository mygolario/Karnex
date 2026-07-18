import "server-only";
import prisma from "@/lib/prisma";
import type {
  LoyaltyAccount,
  LoyaltyAccountInput,
  PointTransaction,
  PointsInput,
  LoyaltySummary,
} from "./types";

function toAccount(a: {
  id: string;
  projectId: string;
  customerId: string;
  customerName: string | null;
  phone: string | null;
  points: number;
  tier: string | null;
  createdAt: Date;
  updatedAt: Date;
}): LoyaltyAccount {
  return {
    id: a.id,
    projectId: a.projectId,
    customerId: a.customerId,
    customerName: a.customerName ?? null,
    phone: a.phone ?? null,
    points: a.points ?? 0,
    tier: a.tier ?? "bronze",
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}

function toTx(t: {
  id: string;
  accountId: string;
  projectId: string;
  delta: number;
  reason: string | null;
  createdAt: Date;
}): PointTransaction {
  return {
    id: t.id,
    accountId: t.accountId,
    projectId: t.projectId,
    delta: t.delta,
    reason: t.reason ?? null,
    createdAt: t.createdAt.toISOString(),
  };
}

function tierForPoints(points: number): string {
  if (points >= 5000) return "gold";
  if (points >= 1500) return "silver";
  return "bronze";
}

export async function listAccounts(projectId: string): Promise<LoyaltyAccount[]> {
  const rows = await prisma.loyaltyAccount.findMany({
    where: { projectId },
    orderBy: [{ points: "desc" }, { customerName: "asc" }],
  });
  return rows.map(toAccount);
}

export async function createAccount(
  projectId: string,
  input: LoyaltyAccountInput
): Promise<LoyaltyAccount> {
  const customerId = input.customerId.trim();
  if (!customerId) throw new Error("شناسه مشتری الزامی است");

  const existing = await prisma.loyaltyAccount.findUnique({
    where: { projectId_customerId: { projectId, customerId } },
  });
  if (existing) throw new Error("این مشتری قبلاً در باشگاه ثبت شده است");

  const points = Math.max(0, Number(input.points) || 0);
  const row = await prisma.loyaltyAccount.create({
    data: {
      projectId,
      customerId,
      customerName: input.customerName?.trim() || null,
      phone: input.phone?.trim() || null,
      points,
      tier: input.tier?.trim() || tierForPoints(points),
    },
  });
  return toAccount(row);
}

export async function addPoints(
  projectId: string,
  input: PointsInput
): Promise<{ account: LoyaltyAccount; transaction: PointTransaction }> {
  const delta = Math.trunc(Number(input.delta));
  if (!delta || delta === 0) throw new Error("مقدار امتیاز باید غیرصفر باشد");
  if (delta < 0) throw new Error("برای کسر امتیاز از redeemPoints استفاده کنید");

  const account = await prisma.loyaltyAccount.findFirst({
    where: { id: input.accountId, projectId },
  });
  if (!account) throw new Error("حساب وفاداری یافت نشد");

  const newPoints = account.points + delta;
  const [updated, tx] = await prisma.$transaction([
    prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: { points: newPoints, tier: tierForPoints(newPoints) },
    }),
    prisma.pointTransaction.create({
      data: {
        accountId: account.id,
        projectId,
        delta,
        reason: input.reason?.trim() || null,
      },
    }),
  ]);

  return { account: toAccount(updated), transaction: toTx(tx) };
}

export async function redeemPoints(
  projectId: string,
  input: PointsInput
): Promise<{ account: LoyaltyAccount; transaction: PointTransaction }> {
  let delta = Math.trunc(Number(input.delta));
  if (!delta || delta === 0) throw new Error("مقدار امتیاز باید غیرصفر باشد");
  // Accept positive "amount to redeem" or negative delta
  if (delta > 0) delta = -delta;

  const account = await prisma.loyaltyAccount.findFirst({
    where: { id: input.accountId, projectId },
  });
  if (!account) throw new Error("حساب وفاداری یافت نشد");

  const newPoints = account.points + delta;
  if (newPoints < 0) throw new Error("امتیاز کافی نیست");

  const [updated, tx] = await prisma.$transaction([
    prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: { points: newPoints, tier: tierForPoints(newPoints) },
    }),
    prisma.pointTransaction.create({
      data: {
        accountId: account.id,
        projectId,
        delta,
        reason: input.reason?.trim() || null,
      },
    }),
  ]);

  return { account: toAccount(updated), transaction: toTx(tx) };
}

export async function applyPointsDelta(
  projectId: string,
  input: PointsInput
): Promise<{ account: LoyaltyAccount; transaction: PointTransaction }> {
  const delta = Math.trunc(Number(input.delta));
  if (!delta || delta === 0) throw new Error("مقدار امتیاز باید غیرصفر باشد");
  if (delta > 0) return addPoints(projectId, { ...input, delta });
  return redeemPoints(projectId, { ...input, delta });
}

export async function summary(projectId: string): Promise<LoyaltySummary> {
  const accounts = await listAccounts(projectId);
  const tierMap = new Map<string, { count: number; points: number }>();
  for (const a of accounts) {
    const tier = a.tier || "bronze";
    const cur = tierMap.get(tier) || { count: 0, points: 0 };
    cur.count += 1;
    cur.points += a.points;
    tierMap.set(tier, cur);
  }
  return {
    totalAccounts: accounts.length,
    totalPoints: accounts.reduce((s, a) => s + a.points, 0),
    byTier: Array.from(tierMap.entries()).map(([tier, v]) => ({
      tier,
      count: v.count,
      points: v.points,
    })),
  };
}
