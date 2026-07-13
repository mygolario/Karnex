"use client";

import type { BroadcastInput, BroadcastMessage } from "./types";

async function json<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  if (!resolved.ok) {
    const err = await resolved.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resolved.status}`);
  }
  return resolved.json() as Promise<T>;
}

export const broadcastApi = {
  async list(projectId: string): Promise<{ broadcasts: BroadcastMessage[]; smsProviderConfigured: boolean }> {
    return json(fetch(`/api/projects/${projectId}/broadcast`));
  },
  async create(projectId: string, input: BroadcastInput): Promise<{ broadcast: BroadcastMessage }> {
    return json(
      fetch(`/api/projects/${projectId}/broadcast`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },
};

export type { BroadcastInput, BroadcastMessage };
