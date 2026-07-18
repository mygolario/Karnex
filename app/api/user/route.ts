import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth/session";
import { getUserSettings, getUserProfileData, updateUserSettings, updateUserProfileData } from "@/lib/account/server";
import { mergeSettings, mergeProfileData, type UserSettings, type UserProfileData } from "@/lib/account/types";

/** GET /api/user — full account bundle for the Account Center. */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const [user, settings, profileData, userProfile, integrations, apiKeys, sessions] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          include: { subscriptions: true },
        }),
        getUserSettings(userId),
        getUserProfileData(userId),
        prisma.userProfile.findUnique({ where: { userId } }),
        prisma.userIntegration.findMany({ where: { userId } }),
        prisma.userApiKey.findMany({
          where: { userId, revokedAt: null },
          select: { id: true, label: true, prefix: true, scopes: true, lastUsed: true, createdAt: true },
        }),
        prisma.userSession.findMany({
          where: { userId, revokedAt: null },
          orderBy: { lastActive: "desc" },
          select: { id: true, device: true, platform: true, ip: true, location: true, lastActive: true, createdAt: true },
        }),
      ]);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const activeSub =
      user.subscriptions?.find((s) => s.status === "active") || user.subscriptions?.[0] || null;

    return NextResponse.json({
      account: {
        id: user.id,
        email: user.email,
        role: user.role || "user",
        name: user.name,
        image: user.image,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        birthDate: user.birthDate?.toISOString() ?? null,
        bio: user.bio,
        twoFactorEnabled: user.twoFactorEnabled,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      profile: mergeProfileData(profileData),
      settings: mergeSettings(settings),
      copilotProfile: userProfile
        ? {
            role: userProfile.role,
            industry: userProfile.industry,
            businessStage: userProfile.businessStage,
            goals: userProfile.goals,
            preferredTone: userProfile.preferredTone,
            expertiseLevel: userProfile.expertiseLevel,
            language: userProfile.language,
          }
        : null,
      subscription: activeSub
        ? {
            planId: activeSub.planId,
            status: activeSub.status,
            billingCycle: activeSub.billingCycle,
            startDate: activeSub.startDate.toISOString(),
            endDate: activeSub.endDate?.toISOString() ?? null,
            autoRenew: activeSub.autoRenew,
            cancelAtPeriodEnd: activeSub.cancelAtPeriodEnd,
            provider: activeSub.provider,
          }
        : null,
      integrations: integrations.map((i) => ({
        id: i.id,
        provider: i.provider,
        providerAccountId: i.providerAccountId,
        isConnected: i.isConnected,
        metadata: i.metadata,
        connectedAt: i.createdAt.toISOString(),
      })),
      apiKeys: apiKeys,
      sessions: sessions.map((s) => ({
        ...s,
        lastActive: s.lastActive.toISOString(),
        createdAt: s.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("[ACCOUNT_GET]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/** PATCH /api/user — update profile fields, extensible profile data, and/or settings. */
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const body = await req.json().catch(() => ({}));

    const profileFields: Record<string, unknown> = {};
    if (typeof body.firstName === "string") profileFields.firstName = body.firstName.slice(0, 80);
    if (typeof body.lastName === "string") profileFields.lastName = body.lastName.slice(0, 80);
    if (typeof body.name === "string") profileFields.name = body.name.slice(0, 120);
    if (typeof body.image === "string") profileFields.image = body.image;
    if (typeof body.phoneNumber === "string") profileFields.phoneNumber = body.phoneNumber.slice(0, 20) || null;
    if (typeof body.bio === "string") profileFields.bio = body.bio.slice(0, 2000) || null;
    if (body.birthDate !== undefined) {
      if (body.birthDate) {
        const d = new Date(body.birthDate);
        if (!isNaN(d.getTime())) profileFields.birthDate = d;
      } else {
        profileFields.birthDate = null;
      }
    }

    if (Object.keys(profileFields).length > 0) {
      await prisma.user.update({ where: { id: userId }, data: profileFields });
    }

    let nextProfileData: UserProfileData | undefined;
    if (body.profileData && typeof body.profileData === "object") {
      nextProfileData = await updateUserProfileData(userId, body.profileData);
    }

    let nextSettings: UserSettings | undefined;
    if (body.settings && typeof body.settings === "object") {
      nextSettings = await updateUserSettings(userId, body.settings);
    }

    return NextResponse.json({
      success: true,
      profileData: nextProfileData,
      settings: nextSettings,
    });
  } catch (error) {
    console.error("[ACCOUNT_PATCH]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
