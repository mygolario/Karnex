export type ReferralStatus = "pending" | "converted" | "rewarded";

export interface Referral {
  id: string;
  projectId: string;
  code: string;
  referrerId: string | null;
  referrerName: string | null;
  refereeId: string | null;
  status: ReferralStatus;
  rewardPoints: number;
  createdAt: string;
}

export interface ReferralInput {
  code?: string;
  referrerId?: string | null;
  referrerName?: string | null;
  refereeId?: string | null;
  status?: ReferralStatus;
  rewardPoints?: number;
}
