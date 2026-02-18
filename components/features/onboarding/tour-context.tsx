"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { TOUR_STEPS } from "./tour-steps";

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
  const [isOpen, setIsOpen] = useState(false);
  const [activeTourId, setActiveTourId] = useState("dashboard");
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedTours, setCompletedTours] = useState<string[]>([]);

  // Load persistence
  useEffect(() => {
    try {
      const seen = localStorage.getItem("karnex_completed_tours");
      if (seen) {
        setCompletedTours(JSON.parse(seen));
      } else {
        // Migration from old single boolean logic if needed, or just fresh start
        const oldSeen = localStorage.getItem("karnex_tour_seen");
        if (oldSeen) {
            setCompletedTours(["dashboard"]);
            localStorage.setItem("karnex_completed_tours", JSON.stringify(["dashboard"]));
        }
      }
    } catch (e) {
      console.error("Failed to parse completed tours", e);
    }

    // Auto start dashboard tour if not seen
    const timer = setTimeout(() => {
       const seen = localStorage.getItem("karnex_completed_tours");
       const seenArray = seen ? JSON.parse(seen) : [];
       if (!seenArray.includes("dashboard")) {
          startTour("dashboard");
       }
    }, 2000);

    const handleRestart = (e: CustomEvent<{ tourId?: string }>) => startTour(e.detail?.tourId || "dashboard");
    // @ts-ignore
    window.addEventListener('restart-tour', handleRestart);
    // @ts-ignore
    return () => { clearTimeout(timer); window.removeEventListener('restart-tour', handleRestart); }
  }, []);

  const startTour = useCallback((tourId: string = "dashboard") => {
    if (!TOUR_STEPS[tourId]) {
        console.warn(`Tour ${tourId} not found`);
        return;
    }
    setActiveTourId(tourId);
    setCurrentStepIndex(0);
    setIsOpen(true);
  }, []);

  const endTour = useCallback(() => {
    setIsOpen(false);
    // Use functional update or ref if completedTours dependency causes issues, 
    // but here we need the current list. 
    // Actually, to avoid startTour changing when completedTours changes, 
    // we should validly include completedTours in deps or use a ref for it.
    // For now, let's just memoize startTour (it has no deps).
    // endTour needs completedTours.
    
    setCompletedTours((prev) => {
        if (!prev.includes(activeTourId)) {
            const newCompleted = [...prev, activeTourId];
            localStorage.setItem("karnex_completed_tours", JSON.stringify(newCompleted));
            return newCompleted;
        }
        return prev;
    });
  }, [activeTourId]);

  const skipTour = useCallback(() => {
    setIsOpen(false);
     setCompletedTours((prev) => {
        if (!prev.includes(activeTourId)) {
            const newCompleted = [...prev, activeTourId];
            localStorage.setItem("karnex_completed_tours", JSON.stringify(newCompleted));
            return newCompleted;
        }
        return prev;
    });
  }, [activeTourId]);

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

  const hasSeenTour = useCallback((tourId: string) => completedTours.includes(tourId), [completedTours]);

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
        hasSeenTour
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
