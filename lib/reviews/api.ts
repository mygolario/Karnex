"use client";

import type { Review, ReviewInput, ReviewSummary } from "./types";

async function json<T>(res: Response | Promise<Response>): Promise<T> {
  const resolved = await res;
  if (!resolved.ok) {
    const err = await resolved.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${resolved.status}`);
  }
  return resolved.json() as Promise<T>;
}

export const reviewsApi = {
  async list(projectId: string): Promise<{ reviews: Review[]; summary: ReviewSummary }> {
    return json(fetch(`/api/projects/${projectId}/reviews`));
  },
  async create(projectId: string, input: ReviewInput): Promise<{ review: Review }> {
    return json(
      fetch(`/api/projects/${projectId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
    );
  },
  async reply(projectId: string, reviewId: string, reply: string): Promise<{ review: Review }> {
    return json(
      fetch(`/api/projects/${projectId}/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply }),
      })
    );
  },
};

export type { Review, ReviewInput, ReviewSummary };
