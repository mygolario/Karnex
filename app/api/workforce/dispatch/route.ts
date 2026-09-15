import { NextResponse } from "next/server";
import { checkAILimit } from "@/lib/ai-limit-middleware";
import { creditFeatureForAgent } from "@/lib/workforce/catalog";
import { dispatchWorkforceAgent } from "@/lib/workforce/dispatch";
import { isMissingAgentRunTable } from "@/lib/workforce/store";
import { isWorkforceAgentId } from "@/lib/workforce/types";

export const maxDuration = 90;

export async function POST(req: Request) {
  let rollback = async () => {};
  try {
    const body = await req.json().catch(() => ({}));
    const projectId = body.projectId as string | undefined;
    const agentId = body.agentId as string | undefined;
    if (!projectId || !agentId || !isWorkforceAgentId(agentId)) {
      return NextResponse.json({ error: "projectId and a valid agentId required" }, { status: 400 });
    }

    const limit = await checkAILimit(creditFeatureForAgent(agentId));
    rollback = limit.rollback;
    if (limit.errorResponse) return limit.errorResponse;
    const userId = limit.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const kind = body.kind === "cron" ? "cron" : agentId === "night_shift" ? "night_shift" : "dispatch";
    const run = await dispatchWorkforceAgent({ userId, projectId, agentId, kind });
    if (run.status === "failed") {
      await rollback();
    }
    return NextResponse.json({ run });
  } catch (error) {
    await rollback();
    if (isMissingAgentRunTable(error)) {
      return NextResponse.json(
        { error: "میز عامل‌ها هنوز روی پایگاه‌داده فعال نشده. مهاجرت را اجرا کنید." },
        { status: 503 },
      );
    }
    const message = error instanceof Error ? error.message : "";
    if (message === "PROJECT_NOT_FOUND") {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (message === "CAPITAL_STARTUP_ONLY") {
      return NextResponse.json(
        { error: "عامل سرمایه فعلاً برای پروژه‌های استارتاپ است." },
        { status: 400 },
      );
    }
    console.error("[WORKFORCE_DISPATCH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
