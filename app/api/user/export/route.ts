import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { createExportRequest, buildExportPayload } from "@/lib/account/server";

/**
 * POST /api/user/export — kick off a data export request.
 * For now this synchronously returns the JSON payload (ready for download).
 * In production this would enqueue a job that produces a signed ZIP URL.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const format = body.format === "zip" ? "zip" : "json";

  const request = await createExportRequest(session.user.id, format);
  const payload = await buildExportPayload(session.user.id);
  const json = JSON.stringify(payload, null, 2);

  // Return the export as a downloadable JSON blob directly.
  return new NextResponse(json, {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="karnex-export-${session.user.id}.json"`,
      "X-Export-Request-Id": request.id,
    },
  });
}
