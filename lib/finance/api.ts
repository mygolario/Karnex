"use client";

import type { BusinessTransaction, BusinessTxInput, PnLReport, BusinessTxType } from "./types";

async function json<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  if (!resolved.ok) {
    const err = await resolved.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resolved.status}`);
  }
  return resolved.json() as Promise<T>;
}

export const financeApi = {
  async list(projectId: string): Promise<{ transactions: BusinessTransaction[]; pnl: PnLReport }> {
    return json(fetch(`/api/projects/${projectId}/finance`));
  },
  async create(projectId: string, input: BusinessTxInput): Promise<{ transaction: BusinessTransaction }> {
    return json(fetch(`/api/projects/${projectId}/finance`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }));
  },
  async update(projectId: string, txId: string, input: Partial<BusinessTxInput>): Promise<{ transaction: BusinessTransaction }> {
    return json(fetch(`/api/projects/${projectId}/finance/${txId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }));
  },
  async remove(projectId: string, txId: string): Promise<{ success: boolean }> {
    return json(fetch(`/api/projects/${projectId}/finance/${txId}`, { method: "DELETE" }));
  },
};

export type { BusinessTransaction, BusinessTxInput, PnLReport, BusinessTxType };
