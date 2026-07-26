import { headers } from "next/headers";
import { recordLoginEvent } from "@/lib/account/server";

/** Best-effort login audit from auth callback/confirm routes. */
export async function recordAuthLoginEvent(
  userId: string,
  method: string
): Promise<void> {
  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      undefined;
    const userAgent = h.get("user-agent") || undefined;
    await recordLoginEvent(userId, {
      status: "success",
      method,
      ip,
      userAgent,
    });
  } catch {
    // never block auth
  }
}
