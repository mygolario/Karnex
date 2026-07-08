"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { useSubscription } from "@/hooks/useSubscription";
import { useTourStore } from "@/lib/tour/store";
import { getAllToursWithDynamic, TOUR_VERSION } from "@/lib/tour/registry";
import { getGlobalAutoStartCandidate } from "@/lib/tour/trigger-queue";
import { useTourGamification } from "@/hooks/use-tour-gamification";

interface TourProviderProps {
  children: React.ReactNode;
}

const GLOBAL_AUTOSTART_DELAY_MS = 2000;
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
    markWhatsNewSeen,
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

  // Auto-start dashboard / what's-new tour for the shell (runs once per mount)
  const autoStartFired = useRef(false);
  useEffect(() => {
    if (!initialized || authLoading || showWelcome) return;
    if (autoStartFired.current) return;
    autoStartFired.current = true;

    const timer = setTimeout(() => {
      const state = useTourStore.getState();
      const candidate = getGlobalAutoStartCandidate({
        initialized: state.initialized,
        showWelcome: state.showWelcome,
        persisted: state.persisted,
      });
      if (!candidate) return;
      startTour(candidate.tourId, 0, candidate.force);
      if (candidate.tourId === "whats-new") {
        markWhatsNewSeen(TOUR_VERSION);
      }
    }, GLOBAL_AUTOSTART_DELAY_MS);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialized, authLoading, showWelcome]);

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
