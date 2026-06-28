import type { ProjectType } from "@/app/new-project/genesis-constants";
import {
  USER_ONBOARDING_STEPS,
  type UserOnboardingStep,
  type UserOnboardingState,
  type ProjectOnboardingState,
  type GenesisSubStep,
  GENESIS_SUB_STEPS,
  DEFAULT_GAMIFICATION,
} from "./types";

export function getStepIndex(step: UserOnboardingStep): number {
  return USER_ONBOARDING_STEPS.indexOf(step);
}

export function getNextUserStep(step: UserOnboardingStep): UserOnboardingStep | null {
  const idx = getStepIndex(step);
  if (idx < 0 || idx >= USER_ONBOARDING_STEPS.length - 1) return null;
  return USER_ONBOARDING_STEPS[idx + 1];
}

export function resolveOnboardingRedirect(state: {
  user: Pick<UserOnboardingState, "currentStep" | "needsReonboard" | "profileCompletedAt" | "onboardingCompletedAt">;
  project: Pick<ProjectOnboardingState, "currentStep" | "completedAt"> | null;
  hasProjects: boolean;
}): string | null {
  const { user, project } = state;

  if (user.currentStep === "complete" || user.onboardingCompletedAt) {
    return null;
  }

  if (user.needsReonboard || !user.profileCompletedAt) {
    return "/onboarding/profile";
  }

  if (user.currentStep === "genesis" || (project && !project.completedAt && project.currentStep === "genesis")) {
    return "/onboarding/genesis";
  }

  if (user.currentStep === "reveal" || (project && project.currentStep === "reveal")) {
    return "/onboarding/reveal";
  }

  if (user.currentStep === "missions") {
    return "/onboarding/missions";
  }

  return null;
}

export function shouldForceExistingUserReonboard(
  profileCompletedAt: string | null,
  needsReonboard: boolean
): boolean {
  return needsReonboard || !profileCompletedAt;
}

export function genesisSubStepIndex(sub: GenesisSubStep): number {
  return GENESIS_SUB_STEPS.indexOf(sub);
}

export function getGenesisRoute(sub: GenesisSubStep): string {
  return `/onboarding/genesis?sub=${sub}`;
}

export function buildEmptyProjectOnboarding(userId: string): Omit<ProjectOnboardingState, "id"> & { userId: string } {
  return {
    userId,
    projectId: null,
    currentStep: "genesis",
    pillar: null,
    projectName: "",
    projectVision: "",
    answers: {},
    audience: "",
    budget: "",
    qualityScore: 0,
    chatTurnsUsed: 0,
    genesisDraft: null,
    completedMissions: [],
    completedAt: null,
  };
}

export function mergeGenesisDraft(
  current: ProjectOnboardingState,
  patch: Partial<ProjectOnboardingState>
): ProjectOnboardingState {
  return { ...current, ...patch };
}

export function defaultUserOnboardingState(): UserOnboardingState {
  return {
    version: "3.0.0",
    currentStep: "profile",
    profileCompletedAt: null,
    needsReonboard: true,
    profileData: null,
    gamification: { ...DEFAULT_GAMIFICATION },
    completedMissions: [],
    onboardingCompletedAt: null,
  };
}

export function mapPillarFromProfileRole(role: string): ProjectType | null {
  if (role === "creator") return "creator";
  return null;
}

export interface MissionDefinition {
  id: string;
  title: string;
  description: string;
  xp: number;
  href: string;
  projectTypes?: ProjectType[];
  roles?: string[];
}

export const ONBOARDING_MISSIONS: MissionDefinition[] = [
  {
    id: "review-roadmap",
    title: "نقشه راه هفته اول را ببین",
    description: "۳ گام اول مسیر شخصی‌سازی‌شده خود را مرور کنید.",
    xp: 40,
    href: "/dashboard/roadmap",
  },
  {
    id: "fill-canvas-block",
    title: "یک بلوک بوم را تکمیل کن",
    description: "ارزش پیشنهادی یا مشتریان هدف را در بوم مدل کسب‌وکار پر کنید.",
    xp: 50,
    href: "/dashboard/canvas",
  },
  {
    id: "ask-copilot",
    title: "از دستیار هوشمند بپرس",
    description: "یک سؤال درباره گام بعدی از Copilot بپرسید.",
    xp: 35,
    href: "/dashboard/copilot",
  },
  {
    id: "dashboard-tour",
    title: "تور پیشخوان را تمام کن",
    description: "با ابزارهای اصلی کارنکس آشنا شوید.",
    xp: 50,
    href: "/dashboard/overview",
  },
  {
    id: "pitch-outline",
    title: "طرح ارائه را باز کن",
    description: "اسلایدهای اولیه pitch deck خود را ببینید.",
    xp: 40,
    href: "/dashboard/pitch-deck",
    projectTypes: ["startup"],
    roles: ["founder"],
  },
  {
    id: "content-calendar",
    title: "تقویم محتوا را ببین",
    description: "برنامه انتشار محتوای پیشنهادی را مرور کنید.",
    xp: 35,
    href: "/dashboard/content-calendar",
    projectTypes: ["creator"],
  },
  {
    id: "location-check",
    title: "تحلیل موقعیت را امتحان کن",
    description: "ابزار تحلیل موقعیت فیزیکی را باز کنید.",
    xp: 40,
    href: "/dashboard/location",
    projectTypes: ["traditional"],
  },
];

export function getMissionsForContext(
  projectType: ProjectType | null,
  role: string | null
): MissionDefinition[] {
  return ONBOARDING_MISSIONS.filter((m) => {
    if (m.projectTypes?.length && projectType && !m.projectTypes.includes(projectType)) return false;
    if (m.roles?.length && role && !m.roles.includes(role)) return false;
    return true;
  }).slice(0, 6);
}
