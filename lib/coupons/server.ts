import "server-only";
import prisma from "@/lib/prisma";
import type { Coupon, CouponInput, CouponRedemption, RedeemInput } from "./types";

function randomCode(len = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]!;
  }
  return out;
}

function toCoupon(c: {
  id: string;
  projectId: string;
  code: string;
  discountPct: number | null;
  discountAmt: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: Date | null;
  active: boolean;
  createdAt: Date;
}): Coupon {
  return {
    id: c.id,
    projectId: c.projectId,
    code: c.code,
    discountPct: c.discountPct ?? null,
    discountAmt: c.discountAmt ?? null,
    maxUses: c.maxUses ?? null,
    usedCount: c.usedCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    active: c.active,
    createdAt: c.createdAt.toISOString(),
  };
}

function toRedemption(r: {
  id: string;
  couponId: string;
  projectId: string;
  customerId: string | null;
  createdAt: Date;
}): CouponRedemption {
  return {
    id: r.id,
    couponId: r.couponId,
    projectId: r.projectId,
    customerId: r.customerId ?? null,
    createdAt: r.createdAt.toISOString(),
  };
}

export async function listCoupons(projectId: string): Promise<Coupon[]> {
  const rows = await prisma.coupon.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return rows.map(toCoupon);
}

export async function createCoupon(projectId: string, input: CouponInput): Promise<Coupon> {
  const code = (input.code?.trim() || randomCode()).toUpperCase();
  if (input.discountPct == null && input.discountAmt == null) {
    throw new Error("درصد یا مبلغ تخفیف الزامی است");
  }

  try {
    const row = await prisma.coupon.create({
      data: {
        projectId,
        code,
        discountPct: input.discountPct != null ? Number(input.discountPct) : null,
        discountAmt: input.discountAmt != null ? Number(input.discountAmt) : null,
        maxUses: input.maxUses != null ? Number(input.maxUses) : null,
        expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        active: input.active !== false,
      },
    });
    return toCoupon(row);
  } catch {
    throw new Error("کد کوپن تکراری است");
  }
}

export async function redeemCoupon(
  projectId: string,
  input: RedeemInput
): Promise<{ coupon: Coupon; redemption: CouponRedemption }> {
  const code = input.code?.trim().toUpperCase();
  if (!code) throw new Error("کد کوپن الزامی است");

  const coupon = await prisma.coupon.findFirst({
    where: { projectId, code },
  });
  if (!coupon) throw new Error("کوپن یافت نشد");
  if (!coupon.active) throw new Error("کوپن غیرفعال است");
  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new Error("کوپن منقضی شده است");
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    throw new Error("سقف استفاده از کوپن پر شده است");
  }

  const [redemption, updated] = await prisma.$transaction([
    prisma.couponRedemption.create({
      data: {
        couponId: coupon.id,
        projectId,
        customerId: input.customerId ?? null,
      },
    }),
    prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    }),
  ]);

  return {
    coupon: toCoupon(updated),
    redemption: toRedemption(redemption),
  };
}
