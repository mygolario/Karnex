"use client";

import type {
  LoyaltyAccount,
  LoyaltyAccountInput,
  PointTransaction,
  PointsInput,
  LoyaltySummary,
} from "./types";

async function json<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  if (!resolved.ok) {
    const err = await resolved.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resolved.status}`);
  }
  return resolved.json() as Promise<T>;
}

export const loyaltyApi = {
  async list(projectId: string): Promise<{
    accounts: LoyaltyAccount[];
    summary: LoyaltySummary;
  }> {
    return json(fetch(`/api/projects/${projectId}/loyalty`));
  },

  async create(
    projectId: string,
    input: LoyaltyAccountInput
  ): Promise<{ account: LoyaltyAccount }> {
    return json(
      fetch(`/api/projects/${projectId}/loyalty`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },

  async points(
    projectId: string,
    input: PointsInput
  ): Promise<{ account: LoyaltyAccount; transaction: PointTransaction }> {
    return json(
      fetch(`/api/projects/${projectId}/loyalty/points`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },
};

export type {
  LoyaltyAccount,
  LoyaltyAccountInput,
  PointTransaction,
  PointsInput,
  LoyaltySummary,
};
