"use client";

import type { Promotion, PromotionInput } from "./types";

async function json<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  if (!resolved.ok) {
    const err = await resolved.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resolved.status}`);
  }
  return resolved.json() as Promise<T>;
}

export const promotionsApi = {
  async list(projectId: string): Promise<{ promotions: Promotion[] }> {
    return json(fetch(`/api/projects/${projectId}/promotions`));
  },
  async create(projectId: string, input: PromotionInput): Promise<{ promotion: Promotion }> {
    return json(
      fetch(`/api/projects/${projectId}/promotions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },
  async update(
    projectId: string,
    promoId: string,
    input: Partial<PromotionInput>
  ): Promise<{ promotion: Promotion }> {
    return json(
      fetch(`/api/projects/${projectId}/promotions/${promoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },
  async remove(projectId: string, promoId: string): Promise<{ success: boolean }> {
    return json(fetch(`/api/projects/${projectId}/promotions/${promoId}`, { method: "DELETE" }));
  },
};

export type { Promotion, PromotionInput };
