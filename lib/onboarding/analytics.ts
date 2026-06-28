type OnboardingAnalyticsPayload = Record<string, string | number | boolean | undefined>;

function capture(event: string, properties?: OnboardingAnalyticsPayload) {
  if (typeof window === "undefined") return;
  try {
    window.posthog?.capture(event, properties);
  } catch {
    // optional
  }
}

export function trackOnboardingStepViewed(step: string, subStep?: string) {
  capture("onboarding_step_viewed", { step, sub_step: subStep });
}

export function trackOnboardingStepCompleted(step: string, subStep?: string) {
  capture("onboarding_step_completed", { step, sub_step: subStep });
}

export function trackGenesisQualityScore(score: number, pillar: string | null) {
  capture("genesis_quality_score", { score, pillar: pillar ?? undefined });
}

export function trackGenesisGenerated(projectId: string, score: number) {
  capture("genesis_generated", { project_id: projectId, quality_score: score });
}

export function trackGenesisRevealCompleted(projectId: string) {
  capture("genesis_reveal_completed", { project_id: projectId });
}

export function trackMissionCompleted(missionId: string, xp: number) {
  capture("mission_completed", { mission_id: missionId, xp });
}

export function trackOnboardingCompleted(source: string) {
  capture("onboarding_completed", { source });
}

export function trackExistingUserReonboarded() {
  capture("existing_user_reonboarded");
}
