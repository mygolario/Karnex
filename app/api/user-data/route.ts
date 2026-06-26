import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UserProfile } from "@/lib/db";
import { getUserSubscription, getUserTier, getUserFeatures } from "@/lib/subscription";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const userId = session.user.id;

    if (type === "profile") {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            subscriptions: true 
        }
      });

      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }

      const activeSub = user.subscriptions?.find((s: { status: string }) => s.status === 'active') || 
                        user.subscriptions?.[0] || 
                        null;

      const profile: UserProfile = {
        id: user.id,
        email: user.email || "",
        role: (user.role as UserProfile["role"]) || "user",
        full_name: user.name || "",
        avatar_url: user.image || "",
        credits: (user.credits as UserProfile["credits"]) || { aiTokens: 0, projectsUsed: 0 },
        settings: (user.settings as UserProfile["settings"]) || { emailNotifications: true, theme: 'system' },
        subscription: {
             planId: (activeSub?.planId as UserProfile["subscription"]["planId"]) || 'free',
             status: (activeSub?.status as UserProfile["subscription"]["status"]) || 'active',
             endDate: activeSub?.endDate?.toISOString(),
             startDate: activeSub?.startDate?.toISOString(),
             autoRenew: activeSub?.autoRenew ?? false
        },
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString()
      };

      return NextResponse.json({ profile });
    }

    if (type === "subscription") {
      const [subscription, tier, features] = await Promise.all([
        getUserSubscription(userId),
        getUserTier(userId),
        getUserFeatures(userId),
      ]);

      return NextResponse.json({ subscription, tier, features });
    }

    return new NextResponse("Invalid type", { status: 400 });
  } catch (error) {
    console.error("[USER_DATA_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
