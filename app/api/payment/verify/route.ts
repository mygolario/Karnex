import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentAction } from "@/lib/payment-actions";
import crypto from "crypto";

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const success = searchParams.get("success") === "1";
    const trackId = searchParams.get("trackId");
    const status = searchParams.get("status");
    const orderId = searchParams.get("orderId"); // KCD-TRX-...
    const signature = searchParams.get("sig") || searchParams.get("signature");
    const uid = searchParams.get("uid");
    const plan = searchParams.get("plan");

    // 1. IP Whitelisting Check (if configured in environment)
    const allowedIps = process.env.ZIBAL_ALLOWED_IPS?.split(",").map(ip => ip.trim()).filter(Boolean) || [];
    if (allowedIps.length > 0) {
        const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                         req.headers.get("x-real-ip")?.trim() || 
                         "127.0.0.1";
        if (!allowedIps.includes(clientIp)) {
            console.warn(`[Payment Verify API] Blocked unauthorized IP: ${clientIp}`);
            return NextResponse.redirect(new URL('/payment/failed?error=unauthorized_ip', req.url));
        }
    }

    // 2. Cryptographic Signature Verification
    if (signature) {
        const secret = process.env.ZIBAL_WEBHOOK_SECRET || process.env.ZIBAL_MERCHANT;
        if (!secret) {
            console.error("[Payment Verify API] Zibal secret/merchant key is not configured.");
            return NextResponse.redirect(new URL('/payment/failed?error=config_error', req.url));
        }
        
        // We verify the signature based on key parameters we controlled: uid, plan, orderId
        const dataToSign = `${uid || ''}:${plan || ''}:${orderId || ''}`;
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(dataToSign)
            .digest('hex');
        
        const sigBuffer = Buffer.from(signature);
        const expectedBuffer = Buffer.from(expectedSignature);
        
        const isValid = sigBuffer.length === expectedBuffer.length && 
                        crypto.timingSafeEqual(sigBuffer, expectedBuffer);
                        
        if (!isValid) {
            console.error(`[Payment Verify API] Signature verification failed.`);
            return NextResponse.redirect(new URL('/payment/failed?error=invalid_signature', req.url));
        }
    } else {
        // If signature is required by policy but not provided
        if (process.env.ZIBAL_WEBHOOK_SECRET) {
            console.error("[Payment Verify API] Missing required signature");
            return NextResponse.redirect(new URL('/payment/failed?error=missing_signature', req.url));
        }
    }

    if (!trackId) {
         return NextResponse.redirect(new URL('/payment/failed?error=missing_track_id', req.url));
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
