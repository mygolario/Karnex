import "server-only";
import prisma from "@/lib/prisma";
import type { TourPersistedState } from "./types";

type JsonStringArray = string[];

function asStringArray(value: unknown): JsonStringArray {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  return [];
}

export interface ServerTourProgress {
  persisted: TourPersistedState;
  gamification: {
    xp: number;
    level: number;
    streak: number;
    lastActiveDate: string | null;
  };
}

function toClientShape(
  row: NonNullable<Awaited<ReturnType<typeof prisma.tourProgress.findUnique>>>
): ServerTourProgress {
  return {
    persisted: {
      completedTours: asStringArray(row.completedTours),
      skippedTours: asStringArray(row.skippedTours),
      completedChecklistItems: asStringArray(row.completedChecklistItems),
      dismissedBeacons: asStringArray(row.dismissedBeacons),
      persona: (row.persona as TourPersistedState["persona"]) ?? null,
      experienceLevel: (row.experienceLevel as TourPersistedState["experienceLevel"]) ?? null,
      primaryGoal: (row.primaryGoal as TourPersistedState["primaryGoal"]) ?? null,
      hasSeenWelcome: row.hasSeenWelcome,
      disableAutoStart: row.disableAutoStart,
      activeTourId: null,
      activeStepIndex: 0,
      lastSeenWhatsNewVersion: row.lastSeenWhatsNewVersion,
      lastKnownProjectType: row.lastKnownProjectType,
      lastKnownPlan: row.lastKnownPlan,
      updatedAt: row.updatedAt.getTime(),
    },
    gamification: {
      xp: row.xp,
      level: row.level,
      streak: row.streak,
      lastActiveDate: row.lastActiveDate ? row.lastActiveDate.toISOString() : null,
    },
  };
}

export async function getServerTourProgress(userId: string): Promise<ServerTourProgress | null> {
  const row = await prisma.tourProgress.findUnique({ where: { userId } });
  if (!row) return null;
  return toClientShape(row);
}

export interface TourProgressPatch {
  completedTours?: string[];
  skippedTours?: string[];
  completedChecklistItems?: string[];
  dismissedBeacons?: string[];
  persona?: string | null;
  experienceLevel?: string | null;
  primaryGoal?: string | null;
  hasSeenWelcome?: boolean;
  disableAutoStart?: boolean;
  lastSeenWhatsNewVersion?: string | null;
  lastKnownProjectType?: string | null;
  lastKnownPlan?: string | null;
  xpDelta?: number;
}

export async function upsertServerTourProgress(
  userId: string,
  patch: TourProgressPatch
): Promise<ServerTourProgress> {
  const { xpDelta, ...rest } = patch;

  const data: Record<string, unknown> = { ...rest };
  // Prisma needs undefined stripped so we don't overwrite existing values on partial patches.
  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) delete data[key];
  });

  const existing = await prisma.tourProgress.findUnique({ where: { userId } });

  if (!existing) {
    const created = await prisma.tourProgress.create({
      data: {
        userId,
        ...data,
        xp: xpDelta && xpDelta > 0 ? xpDelta : 0,
        level: xpDelta && xpDelta > 0 ? Math.floor(xpDelta / 100) + 1 : 1,
        lastActiveDate: xpDelta ? new Date() : undefined,
      },
    });
    return toClientShape(created);
  }

  const nextXp = xpDelta ? existing.xp + xpDelta : existing.xp;
  const updated = await prisma.tourProgress.update({
    where: { userId },
    data: {
      ...data,
      ...(xpDelta
        ? {
            xp: nextXp,
            level: Math.floor(nextXp / 100) + 1,
            lastActiveDate: new Date(),
          }
        : {}),
    },
  });
  return toClientShape(updated);
}
