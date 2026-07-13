export interface LoyaltyAccount {
  id: string;
  projectId: string;
  customerId: string;
  customerName: string | null;
  phone: string | null;
  points: number;
  tier: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyAccountInput {
  customerId: string;
  customerName?: string | null;
  phone?: string | null;
  points?: number;
  tier?: string | null;
}

export interface PointTransaction {
  id: string;
  accountId: string;
  projectId: string;
  delta: number;
  reason: string | null;
  createdAt: string;
}

export interface PointsInput {
  accountId: string;
  delta: number;
  reason?: string | null;
}

export interface LoyaltySummary {
  totalAccounts: number;
  totalPoints: number;
  byTier: { tier: string; count: number; points: number }[];
}
