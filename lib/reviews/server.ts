import "server-only";
import prisma from "@/lib/prisma";
import type { Review, ReviewInput, ReviewSummary } from "./types";

function toReview(r: {
  id: string;
  projectId: string;
  author: string | null;
  rating: number;
  body: string | null;
  source: string | null;
  reply: string | null;
  createdAt: Date | string;
}): Review {
  return {
    id: r.id,
    projectId: r.projectId,
    author: r.author ?? null,
    rating: r.rating,
    body: r.body ?? null,
    source: r.source ?? null,
    reply: r.reply ?? null,
    createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : String(r.createdAt),
  };
}

export async function listReviews(projectId: string): Promise<Review[]> {
  const rows = await prisma.review.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toReview);
}

export async function getReviewSummary(projectId: string): Promise<ReviewSummary> {
  const reviews = await listReviews(projectId);
  const count = reviews.length;
  const average = count > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const distribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
  }));
  const unreplied = reviews.filter((r) => !r.reply).length;
  return { count, average, distribution, unreplied };
}

export async function createReview(projectId: string, input: ReviewInput): Promise<Review> {
  const rating = Math.round(Number(input.rating));
  if (!rating || rating < 1 || rating > 5) {
    throw new Error("امتیاز باید بین ۱ تا ۵ باشد");
  }

  const row = await prisma.review.create({
    data: {
      projectId,
      author: input.author?.trim() || null,
      rating,
      body: input.body?.trim() || null,
      source: input.source?.trim() || "direct",
      reply: input.reply?.trim() || null,
    },
  });
  return toReview(row);
}

export async function replyToReview(
  projectId: string,
  reviewId: string,
  reply: string
): Promise<Review> {
  const existing = await prisma.review.findFirst({ where: { id: reviewId, projectId } });
  if (!existing) throw new Error("نظر یافت نشد");

  const row = await prisma.review.update({
    where: { id: reviewId },
    data: { reply: reply.trim() || null },
  });
  return toReview(row);
}

export async function updateReview(
  projectId: string,
  reviewId: string,
  input: Partial<ReviewInput>
): Promise<Review> {
  const existing = await prisma.review.findFirst({ where: { id: reviewId, projectId } });
  if (!existing) throw new Error("نظر یافت نشد");

  const data: Record<string, unknown> = {};
  if (input.author !== undefined) data.author = input.author?.trim() || null;
  if (input.rating !== undefined) {
    const rating = Math.round(Number(input.rating));
    if (rating < 1 || rating > 5) throw new Error("امتیاز باید بین ۱ تا ۵ باشد");
    data.rating = rating;
  }
  if (input.body !== undefined) data.body = input.body?.trim() || null;
  if (input.source !== undefined) data.source = input.source?.trim() || null;
  if (input.reply !== undefined) data.reply = input.reply?.trim() || null;

  const row = await prisma.review.update({ where: { id: reviewId }, data });
  return toReview(row);
}
