"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type {
  OnboardingFullState,
  OnboardingProfileData,
  ProjectOnboardingState,
  UserOnboardingState,
} from "@/lib/onboarding/types";
import type { ProjectType } from "@/app/new-project/genesis-constants";
import { computeQualityScore } from "@/lib/onboarding/quality-score";
import {
  trackGenesisGenerated,
  trackGenesisQualityScore,
  trackOnboardingStepCompleted,
  trackOnboardingStepViewed,
} from "@/lib/onboarding/analytics";

interface OnboardingContextValue {
  loading: boolean;
  state: OnboardingFullState | null;
  quality: ReturnType<typeof computeQualityScore> | null;
  refresh: () => Promise<void>;
  saveProfile: (profile: OnboardingProfileData) => Promise<boolean>;
  patchProject: (patch: Partial<ProjectOnboardingState>) => Promise<void>;
  sendGenesisChat: (message: string) => Promise<{ followUp?: string | null } | null>;
  generateProject: () => Promise<{ projectId?: string; plan?: unknown; error?: string }>;
  completeReveal: () => Promise<void>;
  completeMission: (missionId: string) => Promise<void>;
  finishOnboarding: () => Promise<void>;
  startNewProject: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding requires OnboardingProvider");
  return ctx;
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<OnboardingFullState | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/onboarding");
    if (!res.ok) return;
    const data = await res.json();
    setState({
      user: data.user,
      project: data.project,
      activeProjectOnboardingId: data.activeProjectOnboardingId,
    });
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const quality = useMemo(() => {
    if (!state?.project) return null;
    const p = state.project;
    return computeQualityScore({
      pillar: p.pillar,
      projectName: p.projectName,
      projectVision: p.projectVision,
      answers: p.answers,
      audience: p.audience,
      budget: p.budget,
      profileComplete: Boolean(state.user.profileCompletedAt),
    });
  }, [state]);

  useEffect(() => {
    if (quality && state?.project?.pillar) {
      trackGenesisQualityScore(quality.score, state.project.pillar);
    }
  }, [quality?.score, state?.project?.pillar]);

  const saveProfile = useCallback(async (profile: OnboardingProfileData) => {
    const res = await fetch("/api/onboarding/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) return false;
    trackOnboardingStepCompleted("profile");
    await refresh();
    return true;
  }, [refresh]);

  const patchProject = useCallback(
    async (patch: Partial<ProjectOnboardingState>) => {
      if (!state?.project?.id) return;
      await fetch("/api/onboarding/project", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: state.project.id, ...patch }),
      });
      await refresh();
    },
    [state?.project?.id, refresh]
  );

  const sendGenesisChat = useCallback(
    async (message: string) => {
      if (!state?.project?.id) return null;
      const res = await fetch("/api/onboarding/genesis-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ onboardingId: state.project.id, message }),
      });
      if (!res.ok) return null;
      const data = await res.json();
      await refresh();
      return { followUp: data.followUp };
    },
    [state?.project?.id, refresh]
  );

  const generateProject = useCallback(async () => {
    if (!state?.project?.id) return { error: "No project onboarding" };
    const res = await fetch("/api/onboarding/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ onboardingId: state.project.id }),
    });
    const data = await res.json();
    if (!res.ok) return { error: data.message || data.error };
    trackGenesisGenerated(data.projectId, data.quality?.score ?? 0);
    trackOnboardingStepCompleted("genesis");
    await refresh();
    return { projectId: data.projectId, plan: data.plan };
  }, [state?.project?.id, refresh]);

  const completeReveal = useCallback(async () => {
    if (!state?.project?.id) return;
    await fetch("/api/onboarding/project", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: state.project.id, currentStep: "missions" }),
    });
    await fetch("/api/onboarding", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentStep: "missions" }),
    });
    trackOnboardingStepCompleted("reveal");
    await refresh();
  }, [state?.project?.id, refresh]);

  const completeMission = useCallback(async (missionId: string) => {
    await fetch("/api/onboarding/missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ missionId }),
    });
    await refresh();
  }, [refresh]);

  const finishOnboarding = useCallback(async () => {
    await fetch("/api/onboarding/missions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "complete_onboarding" }),
    });
    trackOnboardingStepCompleted("missions");
    await refresh();
  }, [refresh]);

  const startNewProject = useCallback(async () => {
    await fetch("/api/onboarding/project", { method: "POST" });
    await refresh();
  }, [refresh]);

  const value: OnboardingContextValue = {
    loading,
    state,
    quality,
    refresh,
    saveProfile,
    patchProject,
    sendGenesisChat,
    generateProject,
    completeReveal,
    completeMission,
    finishOnboarding,
    startNewProject,
  };

  return (
    <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
  );
}

export function trackStepView(step: string, sub?: string) {
  trackOnboardingStepViewed(step, sub);
}
