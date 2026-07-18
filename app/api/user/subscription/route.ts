import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { cancelSubscription, reactivateSubscription, getUserSubscription } from "@/lib/subscription";

/** GET /api/user/subscription — current subscription (with cancelAtPeriodEnd). */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sub = await getUserSubscription(session.user.id);
  return NextResponse.json({ subscription: sub });
}

/** PATCH /api/user/subscription — cancel (at period end) or reactivate. */
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));

  if (body.action === "cancel") {
    await cancelSubscription(session.user.id);
    return NextResponse.json({ success: true, cancelAtPeriodEnd: true });
  }
  if (body.action === "reactivate") {
    await reactivateSubscription(session.user.id);
    return NextResponse.json({ success: true, cancelAtPeriodEnd: false });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
