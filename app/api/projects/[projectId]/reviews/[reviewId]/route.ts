import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { replyToReview, updateReview } from "@/lib/reviews/server";
import type { ReviewInput } from "@/lib/reviews/types";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ projectId: string; reviewId: string }> }
) {
  try {
    const { projectId, reviewId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as Partial<ReviewInput>;

    if (body.reply !== undefined && Object.keys(body).length === 1) {
      const review = await replyToReview(projectId, reviewId, body.reply ?? "");
      return NextResponse.json({ review });
    }

    const review = await updateReview(projectId, reviewId, body);
    return NextResponse.json({ review });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Reviews PATCH error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
