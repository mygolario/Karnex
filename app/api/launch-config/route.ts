import { NextResponse } from "next/server";
import { getEffectiveLaunchConfig, getLaunchOverrides } from "@/lib/launch/effective";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Public effective launch config for client hydrate (nav / genesis gates). */
export async function GET() {
  try {
    const config = await getEffectiveLaunchConfig();
    const overrides = await getLaunchOverrides();
    return NextResponse.json({ config, overrides });
  } catch (error) {
    console.error("launch-config error:", error);
    return NextResponse.json({ error: "Failed to load launch config" }, { status: 500 });
  }
}
