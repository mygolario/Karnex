import { NextResponse } from "next/server";
import { getProjectAccess, unauthorizedResponse, forbiddenResponse } from "@/lib/traditional/access";
import { listBroadcasts, createBroadcast } from "@/lib/broadcast/server";
import type { BroadcastInput } from "@/lib/broadcast/types";

export async function GET(_req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();

    const broadcasts = await listBroadcasts(projectId);
    const smsProviderConfigured = Boolean(process.env.SMS_PROVIDER_API_KEY || process.env.KAVENEGAR_API_KEY);
    return NextResponse.json({ broadcasts, smsProviderConfigured });
  } catch (error) {
    console.error("Broadcast GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    const { projectId } = await params;
    const access = await getProjectAccess(projectId);
    if (!access) return unauthorizedResponse();
    if (!access.canWrite) return forbiddenResponse();

    const body = (await req.json()) as BroadcastInput;
    const broadcast = await createBroadcast(projectId, body);
    return NextResponse.json({ broadcast });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Broadcast POST error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
