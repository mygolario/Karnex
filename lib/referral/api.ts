"use client";

import type { Referral, ReferralInput } from "./types";

async function json<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  if (!resolved.ok) {
    const err = await resolved.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resolved.status}`);
  }
  return resolved.json() as Promise<T>;
}

export const referralApi = {
  async list(projectId: string): Promise<{ referrals: Referral[] }> {
    return json(fetch(`/api/projects/${projectId}/referral`));
  },
  async create(projectId: string, input: ReferralInput = {}): Promise<{ referral: Referral }> {
    return json(
      fetch(`/api/projects/${projectId}/referral`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },
};

export type { Referral, ReferralInput };
