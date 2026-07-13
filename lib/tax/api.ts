"use client";

import type { TaxEstimate } from "./types";

async function json<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  if (!resolved.ok) {
    const err = await resolved.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resolved.status}`);
  }
  return resolved.json() as Promise<T>;
}

export const taxApi = {
  async get(projectId: string): Promise<{ estimate: TaxEstimate }> {
    return json(fetch(`/api/projects/${projectId}/tax`));
  },
};

export type { TaxEstimate };
