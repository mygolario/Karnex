import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { undoAiAction } from "@/lib/ai/copilot-tools";

/** POST /api/copilot/actions/[actionId]/undo — revert a prior Copilot tool action */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ actionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { actionId } = await params;
    const result = await undoAiAction(actionId, session.user.id);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: result.message });
  } catch (error: any) {
    console.error("Undo action error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
