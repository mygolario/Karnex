import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentAction } from "@/lib/payment-actions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Zibal browser redirect callback handler.
 * Zibal appends: trackId, success, status, orderId
 * Trust is established via Zibal /verify API, not URL signatures.
 */
export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const trackId = searchParams.get("trackId");
    const success = searchParams.get("success");
    const paymentStatus = searchParams.get("status");
    const orderId = searchParams.get("orderId");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;

    if (!trackId) {
        return NextResponse.redirect(new URL("/payment/failed?error=missing_track_id", baseUrl));
    }

    if (success === "0" || paymentStatus === "3") {
        return NextResponse.redirect(new URL("/payment/failed?error=cancelled", baseUrl));
    }

    try {
        const result = await verifyPaymentAction(trackId, orderId ?? undefined);

        if (result.success && result.transactionId) {
            return NextResponse.redirect(new URL(`/payment/receipt/${result.transactionId}`, baseUrl));
        }

        const msg = encodeURIComponent(result.message || "verification_failed");
        return NextResponse.redirect(new URL(`/payment/failed?error=verification_failed&msg=${msg}`, baseUrl));
    } catch (error: unknown) {
        console.error("[Payment Verify API] Error:", error);
        const msg = encodeURIComponent(error instanceof Error ? error.message : "system");
        return NextResponse.redirect(new URL(`/payment/failed?error=system&msg=${msg}`, baseUrl));
    }
}
