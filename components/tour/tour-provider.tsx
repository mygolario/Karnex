"use client";

import { useEffect, useRef } from "react";
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

  // Auto-start dashboard tour for new users (runs once per mount)
  const autoStartFired = useRef(false);
  useEffect(() => {
    if (!initialized || authLoading || showWelcome) return;
    if (persisted.disableAutoStart) return;
    if (autoStartFired.current) return;
    autoStartFired.current = true;

    const timer = setTimeout(() => {
      const current = useTourStore.getState().persisted;
      const dashBlocked = current.completedTours.includes("dashboard") || current.skippedTours?.includes("dashboard");
      const whatsNewEligible = current.lastSeenWhatsNewVersion !== TOUR_VERSION && !current.skippedTours?.includes("whats-new");
      // #region agent log
      fetch('http://127.0.0.1:7443/ingest/9ae0ee8b-1865-4481-b3b2-37ccf5719385',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'176184'},body:JSON.stringify({sessionId:'176184',location:'tour-provider.tsx:autoStart',message:'TourProvider autoStart timer',data:{dashBlocked,whatsNewEligible,skippedTours:current.skippedTours,completedTours:current.completedTours,disableAutoStart:current.disableAutoStart},timestamp:Date.now(),hypothesisId:'H4,H5'})}).catch(()=>{});
      // #endregion
      if (!dashBlocked) {
        startTour("dashboard");
      } else if (whatsNewEligible) {
        startTour("whats-new", 0, true);
        markWhatsNewSeen(TOUR_VERSION);
      }
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialized,
    authLoading,
    showWelcome,
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
