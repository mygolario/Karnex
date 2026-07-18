import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/lib/notifications";

/** GET /api/notifications — Fetch current in-app notifications for the user. */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const list = await getNotifications(session.user.id);
    return NextResponse.json({ notifications: list });
  } catch (error) {
    console.error("[API GET Notifications] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** POST /api/notifications — Mark notification(s) as read. */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, id } = body;

    if (action === "markAllAsRead") {
      await markAllNotificationsAsRead(session.user.id);
      return NextResponse.json({ success: true });
    }

    if (action === "markAsRead") {
      if (!id) {
        return NextResponse.json({ error: "Missing notification ID" }, { status: 400 });
      }
      await markNotificationAsRead(session.user.id, id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[API POST Notifications] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** DELETE /api/notifications — Delete a specific notification. */
export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing notification ID" }, { status: 400 });
    }

    await deleteNotification(session.user.id, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API DELETE Notifications] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
