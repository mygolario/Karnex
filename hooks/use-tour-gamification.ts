"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import type { Badge } from "@/hooks/use-gamification";
import { getAllTours } from "@/lib/tour/registry";

const TOTAL_TOURS = getAllTours().filter((t) => t.id !== "whats-new").length;

const STORAGE_KEY = "karnex-tour-gamification";
const XP_PER_LEVEL = 100;

export interface TourGamificationState {
  totalXp: number;
  level: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  completedTourCount: number;
  badges: Badge[];
  lastActiveDate: string | null;
  streak: number;
}

function defaultState(): TourGamificationState {
  return {
    totalXp: 0,
    level: 1,
    xpInCurrentLevel: 0,
    xpForNextLevel: XP_PER_LEVEL,
    completedTourCount: 0,
    badges: [],
    lastActiveDate: null,
    streak: 0,
  };
}

function loadState(userId: string): TourGamificationState {
  if (typeof window === "undefined") return defaultState();
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch {}
  return defaultState();
}

function saveState(userId: string, state: TourGamificationState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(state));
}

function computeTourBadges(completedCount: number, totalTours: number): Badge[] {
  return [
    {
      id: "tour-first-steps",
      label: "اولین قدم",
      description: "اولین تور را تکمیل کن",
      icon: "🧭",
      unlocked: completedCount >= 1,
      threshold: 1,
      progress: Math.min(completedCount, 1),
    },
    {
      id: "tour-explorer",
      label: "کاوشگر",
      description: "۳ تور را تکمیل کن",
      icon: "🗺️",
      unlocked: completedCount >= 3,
      threshold: 3,
      progress: Math.min(completedCount, 3),
    },
    {
      id: "tour-power-user",
      label: "کاربر حرفه‌ای",
      description: "همه تورها را تکمیل کن",
      icon: "🏆",
      unlocked: totalTours > 0 && completedCount >= totalTours,
      threshold: totalTours,
      progress: completedCount,
    },
  ];
}

export function useTourGamification() {
  const { user } = useAuth();
  const userId = user?.id ?? "guest";
  const [state, setState] = useState<TourGamificationState>(defaultState);
  const [lastXp, setLastXp] = useState<{ xp: number; reason: string } | null>(null);

  useEffect(() => {
    setState(loadState(userId));
  }, [userId]);

  const awardTourXp = useCallback(
    (amount: number, reason: string) => {
      setState((prev) => {
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const newStreak =
          prev.lastActiveDate === today
            ? prev.streak
            : prev.lastActiveDate === yesterday
              ? prev.streak + 1
              : 1;

        const newTotal = prev.totalXp + amount;
        const newLevel = Math.floor(newTotal / XP_PER_LEVEL) + 1;
        const isTourComplete = reason.startsWith("تکمیل تور:");
        const completedTourCount = isTourComplete
          ? prev.completedTourCount + 1
          : prev.completedTourCount;

        const next: TourGamificationState = {
          ...prev,
          totalXp: newTotal,
          level: newLevel,
          xpInCurrentLevel: newTotal % XP_PER_LEVEL,
          xpForNextLevel: XP_PER_LEVEL,
          completedTourCount,
          lastActiveDate: today,
          streak: newStreak,
          badges: computeTourBadges(completedTourCount, TOTAL_TOURS),
        };
        saveState(userId, next);
        return next;
      });
      setLastXp({ xp: amount, reason });
      setTimeout(() => setLastXp(null), 3000);
    },
    [userId]
  );

  return {
    ...state,
    lastXp,
    awardTourXp,
    tourBadges: computeTourBadges(state.completedTourCount, TOTAL_TOURS),
  };
}
