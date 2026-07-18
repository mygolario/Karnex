"use client";

import type { Coupon, CouponInput, CouponRedemption, RedeemInput } from "./types";

async function json<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  if (!resolved.ok) {
    const err = await resolved.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resolved.status}`);
  }
  return resolved.json() as Promise<T>;
}

export const couponsApi = {
  async list(projectId: string): Promise<{ coupons: Coupon[] }> {
    return json(fetch(`/api/projects/${projectId}/coupons`));
  },
  async create(projectId: string, input: CouponInput): Promise<{ coupon: Coupon }> {
    return json(
      fetch(`/api/projects/${projectId}/coupons`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },
  async redeem(
    projectId: string,
    input: RedeemInput
  ): Promise<{ coupon: Coupon; redemption: CouponRedemption }> {
    return json(
      fetch(`/api/projects/${projectId}/coupons/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },
};

export type { Coupon, CouponInput, CouponRedemption, RedeemInput };
