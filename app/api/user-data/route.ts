import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { UserProfile } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "profile") {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: {
            subscriptions: true 
        }
      });

      if (!user) {
        return new NextResponse("User not found", { status: 404 });
      }

      // Find active or latest subscription
      const activeSub = user.subscriptions?.find((s: any) => s.status === 'active') || 
                        user.subscriptions?.[0] || 
                        null;

      // Map to UserProfile
      const profile: UserProfile = {
        id: user.id,
        email: user.email || "",
        role: (user.role as any) || "user",
        full_name: user.name || "",
        avatar_url: user.image || "",
        credits: (user.credits as any) || { aiTokens: 0, projectsUsed: 0 },
        settings: (user.settings as any) || { emailNotifications: true, theme: 'system' },
        subscription: {
             planId: (activeSub?.planId as any) || 'free',
             status: (activeSub?.status as any) || 'active',
             endDate: activeSub?.endDate?.toISOString(),
             startDate: activeSub?.startDate?.toISOString(),
             autoRenew: activeSub?.autoRenew ?? false
        } as any,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString()
      };

      return NextResponse.json({ profile });
    }

    return new NextResponse("Invalid type", { status: 400 });
  } catch (error) {
    console.error("[USER_DATA_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
