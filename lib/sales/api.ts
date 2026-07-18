"use client";

import type { DailyReport, Order, OrderInput } from "./types";

async function json<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  if (!resolved.ok) {
    const err = await resolved.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resolved.status}`);
  }
  return resolved.json() as Promise<T>;
}

export const salesApi = {
  async list(projectId: string): Promise<{ orders: Order[]; report: DailyReport }> {
    return json(fetch(`/api/projects/${projectId}/sales`));
  },
  async create(projectId: string, input: OrderInput): Promise<{ order: Order }> {
    return json(
      fetch(`/api/projects/${projectId}/sales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },
};

export type { DailyReport, Order, OrderInput };
