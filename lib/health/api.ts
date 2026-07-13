"use client";

import type { HealthReport } from "./types";

async function json<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  if (!resolved.ok) {
    const err = await resolved.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resolved.status}`);
  }
  return resolved.json() as Promise<T>;
}

export const healthApi = {
  async get(projectId: string): Promise<{ report: HealthReport }> {
    return json(fetch(`/api/projects/${projectId}/health`));
  },
};

export type { HealthReport };
