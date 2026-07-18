import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { updateNotificationSettings, getUserSettings } from "@/lib/account/server";

/** GET /api/user/notifications — current notification preferences. */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await getUserSettings(session.user.id);
  return NextResponse.json({ notifications: settings.notifications });
}

/** PATCH /api/user/notifications — update notification preferences. */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const next = await updateNotificationSettings(session.user.id, body || {});
  return NextResponse.json({ notifications: next });
}
