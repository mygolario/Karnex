"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { useProject } from "@/contexts/project-context";
import { useTourStore } from "@/lib/tour/store";
import { TOUR_VERSION } from "@/lib/tour/registry";
import { useTourGamification } from "@/hooks/use-tour-gamification";

interface TourProviderProps {
  children: React.ReactNode;
}

export function TourProvider({ children }: TourProviderProps) {
  const { user, loading: authLoading } = useAuth();
  const { activeProject } = useProject();
  const {
    initialize,
    initialized,
    persisted,
    startTour,
    setStepContext,
    setXpCallback,
    markWhatsNewSeen,
    showWelcome,
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
    });
  }, [activeProject?.id, activeProject?.projectType, persisted.persona, setStepContext]);

  // Auto-start dashboard tour for new users
  useEffect(() => {
    if (!initialized || authLoading || showWelcome) return;
    if (persisted.disableAutoStart) return;

    const timer = setTimeout(() => {
      if (!persisted.completedTours.includes("dashboard") && !persisted.skippedTours?.includes("dashboard")) {
        startTour("dashboard");
      } else if (persisted.lastSeenWhatsNewVersion !== TOUR_VERSION) {
        startTour("whats-new", 0, true);
        markWhatsNewSeen(TOUR_VERSION);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    initialized,
    authLoading,
    showWelcome,
    persisted.completedTours,
    persisted.skippedTours,
    persisted.disableAutoStart,
    persisted.lastSeenWhatsNewVersion,
    startTour,
    markWhatsNewSeen,
  ]);

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
