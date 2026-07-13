import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { listReviews, createReview, getReviewSummary } from "@/lib/reviews/server";
import type { ReviewInput } from "@/lib/reviews/types";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const [reviews, summary] = await Promise.all([
      listReviews(projectId),
      getReviewSummary(projectId),
    ]);
    return NextResponse.json({ reviews, summary });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as ReviewInput;
    if (!body?.rating) {
      return NextResponse.json({ error: "امتیاز الزامی است" }, { status: 400 });
    }

    const review = await createReview(projectId, body);
    return NextResponse.json({ review });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Reviews POST error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
