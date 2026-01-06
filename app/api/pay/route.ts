
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const planId = searchParams.get("planId");

  // Allow redirect back to wherever specified, or default to dashboard
  // Actually, standard Zibal flow takes a callbackUrl.
  // Our mock gateway takes a callbackUrl too? 
  // currently app/pay/mock/page.tsx hardcodes redirect to /dashboard?upgrade=success.
  // We can stick to that for now.

  if (!planId) {
    return NextResponse.json({ error: "Missing planId" }, { status: 400 });
  }

  // --- MOCK PAYMENT INITIATION ---
  // In a real scenario, we would call the Zibal API here to get a 'trackId'
  // const response = await fetch('https://gateway.zibal.ir/v1/request', { ... })
  // const { trackId } = await response.json()
  // return NextResponse.redirect(`https://gateway.zibal.ir/start/${trackId}`)
  
  // Instead, we redirect to our local mock gateway
  const mockGatewayUrl = new URL("/pay/mock", req.url);
  mockGatewayUrl.searchParams.set("planId", planId);
  
  return NextResponse.redirect(mockGatewayUrl);
}
