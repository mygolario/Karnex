"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { TOUR_STEPS } from "./tour-steps";
import { useAuth } from "@/contexts/auth-context";

export type TourStep = {
  id: string;
  targetId: string; // matches data-tour-id
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
  offset?: number;
};

interface TourContextType {
  isOpen: boolean;
  activeTourId: string;
  currentStepIndex: number;
  totalSteps: number;
  currentStep: TourStep;
  startTour: (tourId?: string) => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  hasSeenTour: (tourId: string) => boolean;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth(); // Get user from auth context
  const [isOpen, setIsOpen] = useState(false);
  const [activeTourId, setActiveTourId] = useState("dashboard");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedTours, setCompletedTours] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false); // Track if we've loaded from local storage

  // Helper to get the correct storage key
  const getStorageKey = useCallback(() => {
    if (!user?.id) return "karnex_completed_tours_guest"; // or null, but let's allow guest tours? usually dashboard is protected.
    return `karnex_completed_tours_${user.id}`;
  }, [user?.id]);

  // Load persistence when user is ready
  useEffect(() => {
    if (authLoading) return; // Wait for auth to settle

    try {
      const key = getStorageKey();
      const seen = localStorage.getItem(key);

      let initialCompleted: string[] = [];

      if (seen) {
        initialCompleted = JSON.parse(seen);
      } else {
        // Migration/Fallback logic specifically for the very first user (optional, or just treat as new)
        // If we want to be nice and migrate the old generic key to the CURRENT user:
        // const oldGeneric = localStorage.getItem("karnex_completed_tours");
        // if (oldGeneric) {
        //     initialCompleted = JSON.parse(oldGeneric);
        //     // Save to new user-scoped key immediately?
        //     // localStorage.setItem(key, JSON.stringify(initialCompleted));
        // }
        // BUT: The user complaint is that they created a NEW account and didn't see the tour.
        // If we migrate the old key, we might inadvertently hide the tour for the new account if the old key said "completed".
        // So, BETTER: Start fresh for new users (no migration from generic key).
      }

      setCompletedTours(initialCompleted);
      setIsInitialized(true);
    } catch (e) {
      console.error("Failed to parse completed tours", e);
      setCompletedTours([]);
      setIsInitialized(true);
    }
  }, [user?.id, authLoading, getStorageKey]);

  // Auto start dashboard tour logic
  useEffect(() => {
    if (!isInitialized || authLoading) return;

    // Check if we should auto-start
    // We only auto-start 'dashboard' tour if it's not in completedTours
    const timer = setTimeout(() => {
      if (!completedTours.includes("dashboard")) {
        // Double check storage to be sure (in case of race conditions, though state should be source of truth)
        startTour("dashboard");
      }
    }, 2000); // 2 second delay to let UI settle

    const handleRestart = (e: CustomEvent<{ tourId?: string }>) =>
      startTour(e.detail?.tourId || "dashboard");

    window.addEventListener("restart-tour", handleRestart as EventListener);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("restart-tour", handleRestart as EventListener);
    };
  }, [isInitialized, authLoading, completedTours]); // Re-run when initialization finishes

  const startTour = useCallback((tourId: string = "dashboard") => {
    if (!TOUR_STEPS[tourId]) {
      console.warn(`Tour ${tourId} not found`);
      return;
    }
    setActiveTourId(tourId);
    setCurrentStepIndex(0);
    setIsOpen(true);
  }, []);

  const markTourCompleted = useCallback(
    (tourId: string) => {
      setCompletedTours((prev) => {
        if (!prev.includes(tourId)) {
          const newCompleted = [...prev, tourId];
          const key = getStorageKey();
          localStorage.setItem(key, JSON.stringify(newCompleted));
          return newCompleted;
        }
        return prev;
      });
    },
    [getStorageKey],
  );

  const endTour = useCallback(() => {
    setIsOpen(false);
    markTourCompleted(activeTourId);
  }, [activeTourId, markTourCompleted]);

  const skipTour = useCallback(() => {
    setIsOpen(false);
    markTourCompleted(activeTourId);
  }, [activeTourId, markTourCompleted]);

  const activeSteps = TOUR_STEPS[activeTourId] || [];

  const nextStep = useCallback(() => {
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      endTour();
    }
  }, [currentStepIndex, activeSteps.length, endTour]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const hasSeenTour = useCallback(
    (tourId: string) => completedTours.includes(tourId),
    [completedTours],
  );

  return (
    <TourContext.Provider
      value={{
        isOpen,
        activeTourId,
        currentStepIndex,
        totalSteps: activeSteps.length,
        currentStep: activeSteps[currentStepIndex],
        startTour,
        endTour,
        nextStep,
        prevStep,
        skipTour,
        hasSeenTour,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export const useTour = () => {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error("useTour must be used within a TourProvider");
  }
  return context;
};
