export interface Coupon {
  id: string;
  projectId: string;
  code: string;
  discountPct: number | null;
  discountAmt: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

export interface CouponInput {
  code?: string;
  discountPct?: number | null;
  discountAmt?: number | null;
  maxUses?: number | null;
  expiresAt?: string | null;
  active?: boolean;
}

export interface CouponRedemption {
  id: string;
  couponId: string;
  projectId: string;
  customerId: string | null;
  createdAt: string;
}

export interface RedeemInput {
  code: string;
  customerId?: string | null;
}
