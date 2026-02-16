import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentAction } from "@/lib/payment-actions";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const success = searchParams.get("success") === "1";
    const trackId = searchParams.get("trackId");
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId"); // KCD-TRX-...

    // Log for debugging
    console.log("Payment Callback:", { success, trackId, status, orderId });

    if (!orderId) {
         return NextResponse.redirect(new URL('/payment/failed?error=missing_transaction_id', req.url));
    }

    try {
        if (success && trackId) {
             // Server Action to verify with Zibal and update DB
             // verifyPaymentAction takes trackId. orderId is retrieved from the transaction in DB effectively found via trackId or we trust the trackId verification.
             const result = await verifyPaymentAction(trackId);

             if (result.success) {
                 return NextResponse.redirect(new URL(`/payment/receipt/${result.transactionId}`, req.url));
             } else {
                 return NextResponse.redirect(new URL(`/payment/failed?error=${'verification_failed'}`, req.url));
             }
        } 
        
        return NextResponse.redirect(new URL('/payment/failed?error=gateway_rejected', req.url));

    } catch (error: any) {
        console.error("Payment Callback Route Error:", error);
         return NextResponse.redirect(new URL(`/payment/failed?error=${encodeURIComponent(error.message)}`, req.url));
    }
}
