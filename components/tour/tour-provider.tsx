"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { useSubscription } from "@/hooks/useSubscription";
import { useTourStore } from "@/lib/tour/store";
import { getAllToursWithDynamic } from "@/lib/tour/registry";
import { useTourGamification } from "@/hooks/use-tour-gamification";

interface TourProviderProps {
  children: React.ReactNode;
}

const REENGAGEMENT_DELAY_MS = 45000;

export function TourProvider({ children }: TourProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const { activeProject } = useProject();
  const { tier } = useSubscription();
  const {
    initialize,
    initialized,
    persisted,
    startTour,
    setStepContext,
    setXpCallback,
    showWelcome,
    recordEnvironmentSnapshot,
    setReengagementCandidate,
  } = useTourStore();

  const { awardTourXp } = useTourGamification();

  const userId = user?.id ?? "guest";

  useEffect(() => {
    if (authLoading) return;
    initialize(userId);
  }, [userId, authLoading, initialize]);

  useEffect(() => {
    setXpCallback(awardTourXp);
    return () => setXpCallback(() => {});
  }, [awardTourXp, setXpCallback]);

  useEffect(() => {
    setStepContext({
      planId: activeProject?.id,
      projectType: activeProject?.projectType,
      persona: persisted.persona ?? "general",
      experienceLevel: persisted.experienceLevel ?? undefined,
      primaryGoal: persisted.primaryGoal ?? undefined,
      role: user?.role ?? undefined,
      subscriptionPlan: tier,
    });
  }, [
    activeProject?.id,
    activeProject?.projectType,
    persisted.persona,
    persisted.experienceLevel,
    persisted.primaryGoal,
    user?.role,
    tier,
    setStepContext,
  ]);

  // Track project type / plan drift so we can offer (opt-in) re-personalization.
  useEffect(() => {
    if (!initialized) return;
    recordEnvironmentSnapshot(activeProject?.projectType, tier);
  }, [initialized, activeProject?.projectType, tier, recordEnvironmentSnapshot]);

  // Tours never auto-start. They are launched explicitly from the help menu or a
  // page's tour button, so arriving on a page is never interrupted by one.

  // Gentle, session-scoped re-engagement nudge: if the user skipped exactly the tours
  // relevant to their setup and hasn't been reminded yet this session, surface a single
  // dismissible suggestion after a period of activity (never repeated, never nagging).
  const reengagementScheduled = useRef(false);
  useEffect(() => {
    if (!initialized || showWelcome || reengagementScheduled.current) return;
    const skipped = persisted.skippedTours ?? [];
    if (!skipped.length) return;

    reengagementScheduled.current = true;
    const timer = setTimeout(() => {
      const state = useTourStore.getState();
      if (state.isOpen || state.showWelcome) return;
      const relevantTours = getAllToursWithDynamic().filter((t) => t.id !== "whats-new");
      const candidate = relevantTours.find(
        (t) =>
          (state.persisted.skippedTours ?? []).includes(t.id) &&
          !state.persisted.completedTours.includes(t.id)
      );
      if (candidate) setReengagementCandidate(candidate.id);
    }, REENGAGEMENT_DELAY_MS);

    return () => clearTimeout(timer);
  }, [initialized, showWelcome, persisted.skippedTours, setReengagementCandidate]);

  // Global restart event (legacy compat)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ tourId?: string }>).detail;
      startTour(detail?.tourId ?? "dashboard", 0, true);
    };
    window.addEventListener("restart-tour", handler as EventListener);
    return () => window.removeEventListener("restart-tour", handler as EventListener);
  }, [startTour]);

  return <>{children}</>;
}

/** Hook for components */
export function useTour() {
  return useTourStore();
}
