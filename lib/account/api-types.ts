/** Client-side types for Account Center API responses. */

export interface UsageQuotaItem {
  used: number;
  limit: number | "unlimited";
  remaining: number | "unlimited";
}

export interface UsageTotals {
  requests: number;
  tokens: number;
  costUsd: number;
  failed: number;
}

export interface UsageByDayItem {
  date: string;
  requests: number;
  tokens: number;
  costUsd: number;
}

export interface UsageByFeatureItem {
  feature: string;
  requests: number;
  tokens: number;
  costUsd: number;
}

export interface UsageResponse {
  tier: string;
  quota: {
    ai: UsageQuotaItem;
    projects: UsageQuotaItem;
  };
  totals: UsageTotals;
  byDay: UsageByDayItem[];
  byFeature: UsageByFeatureItem[];
  byProject: { projectId: string; requests: number; tokens: number; costUsd: number }[];
  resetDate: string;
}

export interface CopilotUsageTotals {
  requests: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  failed: number;
}

export interface GamificationSummary {
  xp: number;
  level: number;
  xpIntoLevel: number;
  xpForNextLevel: number;
  completedSteps: number;
  totalSteps: number;
  rank: string;
}

export interface SecuritySummary {
  passwordSet: boolean;
  twoFactorEnabled: boolean;
  connectedAccounts: { provider: string; id: string }[];
  email: string | null;
}

export interface SessionListItem {
  id: string;
  device: string | null;
  platform: string | null;
  ip: string | null;
  location: string | null;
  lastActive: string;
  createdAt: string;
}

export interface LoginEventItem {
  id: string;
  status: string;
  method: string | null;
  ip: string | null;
  userAgent: string | null;
  location: string | null;
  createdAt: string;
}

export interface TransactionItem {
  id: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: string;
  gateway: string;
  refId?: string;
  cardPan?: string;
  description: string;
  createdAt: Date;
  completedAt?: Date;
}
