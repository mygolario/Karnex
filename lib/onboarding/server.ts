import prisma from "@/lib/prisma";
import type { Prisma } from "@/prisma/client";
import {
  DEFAULT_GAMIFICATION,
  type OnboardingGamification,
  type OnboardingProfileData,
  type UserOnboardingState,
  type ProjectOnboardingState,
  type OnboardingFullState,
  levelFromXp,
} from "./types";
import type { ProjectType } from "@/app/new-project/genesis-constants";

function parseGamification(raw: unknown): OnboardingGamification {
  if (!raw || typeof raw !== "object") return { ...DEFAULT_GAMIFICATION };
  const g = raw as Partial<OnboardingGamification>;
  return {
    xp: typeof g.xp === "number" ? g.xp : 0,
    level: typeof g.level === "number" ? g.level : 1,
    badges: Array.isArray(g.badges) ? g.badges.filter((b) => typeof b === "string") : [],
    streak: typeof g.streak === "number" ? g.streak : 0,
    lastActiveDate: typeof g.lastActiveDate === "string" ? g.lastActiveDate : null,
  };
}

function parseProfileData(raw: unknown): OnboardingProfileData | null {
  if (!raw || typeof raw !== "object") return null;
  return raw as OnboardingProfileData;
}

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x) => typeof x === "string");
}

export async function getOrCreateUserOnboarding(userId: string) {
  return prisma.userOnboarding.upsert({
    where: { userId },
    create: { userId, needsReonboard: true },
    update: {},
  });
}

export async function getActiveProjectOnboarding(userId: string): Promise<ProjectOnboardingState | null> {
  const row = await prisma.projectOnboarding.findFirst({
    where: { userId, completedAt: null },
    orderBy: { updatedAt: "desc" },
  });
  if (!row) return null;
  return mapProjectRow(row);
}

function mapProjectRow(row: {
  id: string;
  projectId: string | null;
  currentStep: string;
  pillar: string | null;
  projectName: string | null;
  projectVision: string | null;
  answers: unknown;
  audience: string | null;
  budget: string | null;
  qualityScore: number;
  chatTurnsUsed: number;
  genesisDraft: unknown;
  completedMissions: unknown;
  completedAt: Date | null;
}): ProjectOnboardingState {
  return {
    id: row.id,
    projectId: row.projectId,
    currentStep: row.currentStep,
    pillar: (row.pillar as ProjectType | null) ?? null,
    projectName: row.projectName ?? "",
    projectVision: row.projectVision ?? "",
    answers: (row.answers as Record<string, string>) ?? {},
    audience: row.audience ?? "",
    budget: row.budget ?? "",
    qualityScore: row.qualityScore,
    chatTurnsUsed: row.chatTurnsUsed,
    genesisDraft: row.genesisDraft as ProjectOnboardingState["genesisDraft"],
    completedMissions: parseStringArray(row.completedMissions),
    completedAt: row.completedAt?.toISOString() ?? null,
  };
}

export async function getOnboardingState(userId: string): Promise<OnboardingFullState> {
  const userRow = await getOrCreateUserOnboarding(userId);
  const project = await getActiveProjectOnboarding(userId);

  const user: UserOnboardingState = {
    version: userRow.version,
    currentStep: userRow.currentStep as UserOnboardingState["currentStep"],
    profileCompletedAt: userRow.profileCompletedAt?.toISOString() ?? null,
    needsReonboard: userRow.needsReonboard,
    profileData: parseProfileData(userRow.profileData),
    gamification: parseGamification(userRow.gamification),
    completedMissions: parseStringArray(userRow.completedMissions),
    onboardingCompletedAt: userRow.onboardingCompletedAt?.toISOString() ?? null,
  };

  return {
    user,
    project,
    activeProjectOnboardingId: project?.id ?? null,
  };
}

export async function saveProfileGate(
  userId: string,
  profile: OnboardingProfileData
): Promise<UserOnboardingState> {
  await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      role: profile.role,
      industry: profile.industry,
      businessStage: profile.businessStage,
      goals: profile.goals,
      preferredTone: profile.preferredTone,
      expertiseLevel: profile.expertiseLevel,
      language: "fa",
    },
    update: {
      role: profile.role,
      industry: profile.industry,
      businessStage: profile.businessStage,
      goals: profile.goals,
      preferredTone: profile.preferredTone,
      expertiseLevel: profile.expertiseLevel,
    },
  });

  const existingProjects = await prisma.project.count({
    where: { userId, deletedAt: null },
  });

  const skipGenesis = existingProjects > 0;
  const nextStep = skipGenesis ? "complete" : "genesis";

  const row = await prisma.userOnboarding.update({
    where: { userId },
    data: {
      profileData: profile as unknown as Prisma.InputJsonValue,
      profileCompletedAt: new Date(),
      needsReonboard: false,
      currentStep: nextStep,
      ...(skipGenesis ? { onboardingCompletedAt: new Date() } : {}),
    },
  });

  if (!skipGenesis) {
    await prisma.projectOnboarding.create({
      data: { userId, currentStep: "genesis" },
    });
  }

  return {
    version: row.version,
    currentStep: nextStep as UserOnboardingState["currentStep"],
    profileCompletedAt: row.profileCompletedAt?.toISOString() ?? null,
    needsReonboard: false,
    profileData: profile,
    gamification: parseGamification(row.gamification),
    completedMissions: parseStringArray(row.completedMissions),
    onboardingCompletedAt: row.onboardingCompletedAt?.toISOString() ?? null,
  };
}

export async function updateProjectOnboarding(
  onboardingId: string,
  userId: string,
  data: Partial<{
    pillar: string;
    projectName: string;
    projectVision: string;
    answers: Record<string, string>;
    audience: string;
    budget: string;
    qualityScore: number;
    chatTurnsUsed: number;
    genesisDraft: unknown;
    currentStep: string;
    projectId: string;
    completedAt: Date;
    completedMissions: string[];
  }>
) {
  return prisma.projectOnboarding.updateMany({
    where: { id: onboardingId, userId },
    data: data as Prisma.ProjectOnboardingUpdateManyMutationInput,
  });
}

export async function startNewProjectOnboarding(userId: string) {
  return prisma.projectOnboarding.create({
    data: { userId, currentStep: "genesis" },
  });
}

export async function awardOnboardingXp(userId: string, amount: number, badge?: string) {
  const row = await getOrCreateUserOnboarding(userId);
  const g = parseGamification(row.gamification);
  const xp = g.xp + amount;
  const level = levelFromXp(xp);
  const badges = badge && !g.badges.includes(badge) ? [...g.badges, badge] : g.badges;
  const today = new Date().toISOString().slice(0, 10);
  const streak =
    g.lastActiveDate === today
      ? g.streak
      : g.lastActiveDate &&
          new Date(g.lastActiveDate).getTime() === new Date(today).getTime() - 86400000
        ? g.streak + 1
        : 1;

  const gamification: OnboardingGamification = { xp, level, badges, streak, lastActiveDate: today };

  await prisma.userOnboarding.update({
    where: { userId },
    data: { gamification: gamification as unknown as Prisma.InputJsonValue },
  });

  return gamification;
}

export async function completeOnboarding(userId: string) {
  await prisma.userOnboarding.update({
    where: { userId },
    data: {
      currentStep: "complete",
      onboardingCompletedAt: new Date(),
    },
  });
}

export async function completeMission(userId: string, missionId: string, xp: number) {
  const row = await getOrCreateUserOnboarding(userId);
  const completed = parseStringArray(row.completedMissions);
  if (completed.includes(missionId)) {
    return { gamification: parseGamification(row.gamification), alreadyDone: true };
  }
  const gamification = await awardOnboardingXp(userId, xp);
  await prisma.userOnboarding.update({
    where: { userId },
    data: { completedMissions: [...completed, missionId] as unknown as Prisma.InputJsonValue },
  });
  return { gamification, alreadyDone: false };
}
