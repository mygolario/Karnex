import { NextResponse } from "next/server";
import { SIGNUP_COOKIE } from "@/lib/analytics/constants";

/** Mark a brand-new signup so the client can fire signup_completed once. */
export function attachNewSignupCookie(response: NextResponse): NextResponse {
  response.cookies.set(SIGNUP_COOKIE, "1", {
    path: "/",
    maxAge: 60 * 10, // 10 minutes — enough for OAuth redirect → first paint
    sameSite: "lax",
    httpOnly: false, // client must read + clear it
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}
