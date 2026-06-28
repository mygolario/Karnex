import type { ProjectType } from "@/app/new-project/genesis-constants";

export const ONBOARDING_VERSION = "3.0.0";

export const USER_ONBOARDING_STEPS = [
  "profile",
  "genesis",
  "reveal",
  "missions",
  "complete",
] as const;

export type UserOnboardingStep = (typeof USER_ONBOARDING_STEPS)[number];

export const GENESIS_SUB_STEPS = ["pillar", "details", "vision", "review"] as const;
export type GenesisSubStep = (typeof GENESIS_SUB_STEPS)[number];

export const ONBOARDING_PHASE_LABELS: Record<UserOnboardingStep, string> = {
  profile: "پروفایل",
  genesis: "طرح راه‌اندازی",
  reveal: "آشکارسازی",
  missions: "مأموریت‌ها",
  complete: "آماده",
};

export interface OnboardingProfileData {
  role: string;
  industry: string;
  businessStage: string;
  expertiseLevel: "beginner" | "intermediate" | "expert";
  preferredTone: "formal" | "casual" | "balanced";
  goals: string[];
  budgetBand: string;
  audienceSketch: string;
  locationScope: string;
}

export interface OnboardingGamification {
  xp: number;
  level: number;
  badges: string[];
  streak: number;
  lastActiveDate: string | null;
}

export interface GenesisDraftData {
  pillar: ProjectType | null;
  projectName: string;
  projectVision: string;
  answers: Record<string, string>;
  audience: string;
  budget: string;
  activeSubStep: GenesisSubStep;
  subStepIndex: number;
}

export interface UserOnboardingState {
  version: string;
  currentStep: UserOnboardingStep;
  profileCompletedAt: string | null;
  needsReonboard: boolean;
  profileData: OnboardingProfileData | null;
  gamification: OnboardingGamification;
  completedMissions: string[];
  onboardingCompletedAt: string | null;
}

export interface ProjectOnboardingState {
  id: string;
  projectId: string | null;
  currentStep: string;
  pillar: ProjectType | null;
  projectName: string;
  projectVision: string;
  answers: Record<string, string>;
  audience: string;
  budget: string;
  qualityScore: number;
  chatTurnsUsed: number;
  genesisDraft: GenesisDraftData | null;
  completedMissions: string[];
  completedAt: string | null;
}

export interface OnboardingFullState {
  user: UserOnboardingState;
  project: ProjectOnboardingState | null;
  activeProjectOnboardingId: string | null;
}

export const DEFAULT_GAMIFICATION: OnboardingGamification = {
  xp: 0,
  level: 1,
  badges: [],
  streak: 0,
  lastActiveDate: null,
};

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 900, 1400];

export function levelFromXp(xp: number): number {
  let level = 1;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return Math.min(level, LEVEL_THRESHOLDS.length);
}

export const LEVEL_NAMES = ["تازه‌کار", "کاوشگر", "سازنده", "رهبر", "معمار", "اسطوره"];
