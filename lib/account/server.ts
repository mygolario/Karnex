"use server";

import prisma from "@/lib/prisma";
import { Prisma } from "../../prisma/client";
import { auth } from "@/lib/auth/session";
import { archiveAppUser } from "@/lib/auth/archive-user";
import {
  mergeSettings,
  mergeProfileData,
  type UserSettings,
  type UserProfileData,
  type NotificationSettings,
} from "./types";
import { generateApiKey } from "./api-keys";

/** Get the current authenticated user's full account row (or null). */
export async function getAuthenticatedUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

/** Read merged settings for a user. */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { settings: true },
  });
  return mergeSettings(user?.settings);
}

/** Read merged profile-data JSON for a user. */
export async function getUserProfileData(userId: string): Promise<UserProfileData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { profile: true },
  });
  return mergeProfileData(user?.profile);
}

/** Deep-merge partial settings into the persisted JSON (preserves existing keys). */
export async function updateUserSettings(
  userId: string,
  patch: Partial<UserSettings>
): Promise<UserSettings> {
  const current = await getUserSettings(userId);
  // Shallow merge top-level, but deep-merge notifications.
  const next: UserSettings = {
    ...current,
    ...patch,
    notifications: patch.notifications
      ? {
          ...current.notifications,
          ...patch.notifications,
          channels: {
            ...current.notifications.channels,
            ...patch.notifications.channels,
          },
          categories: {
            ...current.notifications.categories,
            ...patch.notifications.categories,
          },
          quietHours: {
            ...current.notifications.quietHours,
            ...patch.notifications.quietHours,
          },
        }
      : current.notifications,
  };

  await prisma.user.update({
    where: { id: userId },
    data: { settings: next as unknown as Prisma.InputJsonValue },
  });
  return next;
}

/** Update the extensible profile JSON (creator links, location, etc.). */
export async function updateUserProfileData(
  userId: string,
  patch: Partial<UserProfileData>
): Promise<UserProfileData> {
  const current = await getUserProfileData(userId);
  const next: UserProfileData = {
    ...current,
    ...patch,
    channelLinks: {
      ...current.channelLinks,
      ...patch.channelLinks,
    },
  };
  await prisma.user.update({
    where: { id: userId },
    data: { profile: next as unknown as Prisma.InputJsonValue },
  });
  return next;
}

/** Update notification preferences specifically. */
export async function updateNotificationSettings(
  userId: string,
  patch: Partial<NotificationSettings>
): Promise<NotificationSettings> {
  const settings = await getUserSettings(userId);
  const nextNotifications: NotificationSettings = {
    ...settings.notifications,
    ...patch,
    channels: { ...settings.notifications.channels, ...patch.channels },
    quietHours: { ...settings.notifications.quietHours, ...patch.quietHours },
  };
  await updateUserSettings(userId, { notifications: nextNotifications });
  return nextNotifications;
}

// === API Keys ===

export async function createApiKey(
  userId: string,
  label: string,
  scopes: string[] = []
): Promise<{ id: string; raw: string; prefix: string }> {
  const { raw, hash, prefix } = generateApiKey();
  const row = await prisma.userApiKey.create({
    data: { userId, label: label.slice(0, 60), keyHash: hash, prefix, scopes },
  });
  return { id: row.id, raw, prefix };
}

export async function revokeApiKey(userId: string, keyId: string): Promise<void> {
  await prisma.userApiKey.updateMany({
    where: { id: keyId, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

// === Sessions ===

export async function listSessions(userId: string) {
  return prisma.userSession.findMany({
    where: { userId, revokedAt: null },
    orderBy: { lastActive: "desc" },
  });
}

export async function revokeSession(userId: string, sessionId: string): Promise<void> {
  await prisma.userSession.updateMany({
    where: { id: sessionId, userId },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllSessions(userId: string, exceptToken?: string): Promise<void> {
  await prisma.userSession.updateMany({
    where: { userId, revokedAt: null, ...(exceptToken ? { NOT: { token: exceptToken } } : {}) },
    data: { revokedAt: new Date() },
  });
}

// === Login events ===

export async function listLoginEvents(userId: string, limit = 20) {
  return prisma.loginEvent.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function recordLoginEvent(
  userId: string,
  data: { status: "success" | "failed"; method?: string; ip?: string; userAgent?: string; location?: string }
): Promise<void> {
  await prisma.loginEvent.create({ data: { userId, ...data } }).catch(() => {});
}

// === Account deletion / export ===

export async function softDeleteUser(userId: string): Promise<void> {
  await archiveAppUser(userId);
  await revokeAllSessions(userId).catch(() => {});
}

export async function createExportRequest(userId: string, format: "json" | "zip" = "json") {
  const expires = new Date();
  expires.setDate(expires.getDate() + 7);
  return prisma.dataExportRequest.create({
    data: { userId, format, status: "pending", expiresAt: expires },
  });
}

/** Gather the user's full data payload for export. */
export async function buildExportPayload(userId: string) {
  const [user, projects, subscriptions, transactions, userProfile, aiUsages, integrations, apiKeys] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, include: { subscriptions: true } }),
      prisma.project.findMany({ where: { userId } }),
      prisma.subscription.findMany({ where: { userId } }),
      prisma.transaction.findMany({ where: { userId } }),
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.aiUsage.findMany({ where: { userId }, take: 1000, orderBy: { createdAt: "desc" } }),
      prisma.userIntegration.findMany({ where: { userId } }),
      prisma.userApiKey.findMany({ where: { userId }, select: { label: true, prefix: true, createdAt: true, revokedAt: true } }),
    ]);

  // Strip sensitive fields + integration credentials
  const safeUser: Record<string, unknown> = { ...(((user || {}) as Record<string, unknown>)) };
  delete safeUser.password;
  delete safeUser.twoFactorSecret;
  const safeIntegrations = integrations.map((i: Record<string, unknown>) => {
    const r = { ...i };
    delete r.credentials;
    return r;
  });

  return {
    exportedAt: new Date().toISOString(),
    user: safeUser,
    profile: userProfile,
    projects,
    subscriptions,
    transactions,
    aiUsages: aiUsages.slice(0, 500),
    integrations: safeIntegrations,
    apiKeys,
  };
}

/** Gamification summary derived from roadmap + content data (server-backed). */
export async function getGamificationSummary(userId: string) {
  type Step = string | { title?: string; status?: string };
  type Phase = { steps?: Step[] };
  type Roadmap = { phases?: Phase[]; status?: Record<string, { status?: string }> };
  type ProjectData = { roadmap?: Roadmap; phases?: Phase[]; stepStatus?: Record<string, { status?: string }> };

  // Count completed roadmap steps across all the user's projects.
  const projects = await prisma.project.findMany({
    where: { userId, deletedAt: null },
    select: { id: true, data: true },
  });

  let completedSteps = 0;
  let totalSteps = 0;
  for (const p of projects) {
    const data = (p.data as ProjectData) || {};
    const phases = data.roadmap?.phases || data.phases || [];
    for (const phase of phases) {
      const steps = phase.steps || [];
      for (const step of steps) {
        totalSteps += 1;
        if (typeof step === "string") continue;
        const status =
          step.status ||
          data.roadmap?.status?.[step.title || ""]?.status ||
          data.stepStatus?.[step.title || ""]?.status;
        if (status === "done" || status === "completed") completedSteps += 1;
      }
    }
  }

  const xp = completedSteps * 25;
  const level = Math.floor(xp / 100) + 1;
  const xpIntoLevel = xp % 100;

  return {
    xp,
    level,
    xpIntoLevel,
    xpForNextLevel: 100,
    completedSteps,
    totalSteps,
    rank: rankForLevel(level),
  };
}

function rankForLevel(level: number): string {
  // Use the roadmap theme rank titles for consistency
  // Default project type since server-side doesn't have project context
  try {
    const { getRankTitle } = require("@/lib/roadmap/themes");
    return getRankTitle(level, "default");
  } catch {
    // Fallback if themes not available
    if (level >= 16) return "اسطوره";
    if (level >= 12) return "رهبر";
    if (level >= 8) return "افسانه‌ای";
    if (level >= 5) return "حرفه‌ای";
    if (level >= 3) return "کارشناس";
    return "تازه‌کار";
  }
}
