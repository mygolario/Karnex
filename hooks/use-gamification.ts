"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";

export interface GamificationState {
  totalXp: number;
  level: number;
  xpInCurrentLevel: number;
  xpForNextLevel: number;
  streak: number;
  lastActiveDate: string | null;
  badges: Badge[];
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress?: number;
  threshold?: number;
}

export interface XpEvent {
  xp: number;
  reason: string;
  id: number;
}

const XP_PER_STEP = 25;
const XP_PER_LEVEL = 100;
const STORAGE_KEY = "karnex-gamification";

function loadState(userId: string): GamificationState {
  if (typeof window === "undefined")
    return defaultState();
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
    if (raw) return { ...defaultState(), ...JSON.parse(raw) };
  } catch {}
  return defaultState();
}

function defaultState(): GamificationState {
  return {
    totalXp: 0,
    level: 1,
    xpInCurrentLevel: 0,
    xpForNextLevel: XP_PER_LEVEL,
    streak: 0,
    lastActiveDate: null,
    badges: [],
  };
}

function saveState(userId: string, state: GamificationState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(`${STORAGE_KEY}-${userId}`, JSON.stringify(state));
}

export function computeOnboardingBadges(completedTourCount: number, totalTours = 9): Badge[] {
  return [
    {
      id: "tour-first-steps",
      label: "اولین قدم",
      description: "اولین تور راهنما را تکمیل کن",
      icon: "🧭",
      unlocked: completedTourCount >= 1,
      threshold: 1,
      progress: Math.min(completedTourCount, 1),
    },
    {
      id: "tour-explorer",
      label: "کاوشگر",
      description: "۳ تور راهنما را تکمیل کن",
      icon: "🗺️",
      unlocked: completedTourCount >= 3,
      threshold: 3,
      progress: Math.min(completedTourCount, 3),
    },
    {
      id: "tour-power-user",
      label: "کاربر حرفه‌ای",
      description: "همه تورهای راهنما را تکمیل کن",
      icon: "🏆",
      unlocked: totalTours > 0 && completedTourCount >= totalTours,
      threshold: totalTours,
      progress: completedTourCount,
    },
  ];
}

function computeBadges(
  totalDone: number,
  totalSteps: number,
  phasesDone: number,
  totalPhases: number,
  streak: number
): Badge[] {
  return [
    {
      id: "first-step",
      label: "اولین قدم",
      description: "اولین گام نقشه راه را کامل کن",
      icon: "🎯",
      unlocked: totalDone >= 1,
      threshold: 1,
      progress: Math.min(totalDone, 1),
    },
    {
      id: "ten-steps",
      label: "ده‌گام",
      description: "۱۰ گام را تکمیل کن",
      icon: "🏃",
      unlocked: totalDone >= 10,
      threshold: 10,
      progress: Math.min(totalDone, 10),
    },
    {
      id: "quarter",
      label: "یک‌چهارم مسیر",
      description: "۲۵٪ نقشه راه را کامل کن",
      icon: "🚀",
      unlocked: totalSteps > 0 && totalDone / totalSteps >= 0.25,
      threshold: 25,
      progress: totalSteps > 0 ? Math.round((totalDone / totalSteps) * 100) : 0,
    },
    {
      id: "halfway",
      label: "نیمه راه",
      description: "۵۰٪ نقشه راه را کامل کن",
      icon: "⛰️",
      unlocked: totalSteps > 0 && totalDone / totalSteps >= 0.5,
      threshold: 50,
      progress: totalSteps > 0 ? Math.round((totalDone / totalSteps) * 100) : 0,
    },
    {
      id: "first-phase",
      label: "قهرمان فصل",
      description: "اولین فاز را کامل کن",
      icon: "🏅",
      unlocked: phasesDone >= 1,
      threshold: 1,
      progress: phasesDone,
    },
    {
      id: "streak-3",
      label: "روزشمار ۳ روزه",
      description: "۳ روز پشت سر هم فعال باش",
      icon: "🔥",
      unlocked: streak >= 3,
      threshold: 3,
      progress: streak,
    },
    {
      id: "streak-7",
      label: "هفته طلایی",
      description: "۷ روز پشت سر هم فعال باش",
      icon: "💎",
      unlocked: streak >= 7,
      threshold: 7,
      progress: streak,
    },
    {
      id: "complete",
      label: "پیروزی نهایی",
      description: "کل نقشه راه را کامل کن",
      icon: "🏆",
      unlocked: totalSteps > 0 && totalDone === totalSteps,
      threshold: 100,
      progress: totalSteps > 0 ? Math.round((totalDone / totalSteps) * 100) : 0,
    },
  ];
}

export function useGamification(
  completedCount: number,
  totalSteps: number,
  phasesDone: number,
  totalPhases: number
) {
  const { user } = useAuth();
  const [state, setState] = useState<GamificationState>(defaultState);
  const [xpEvents, setXpEvents] = useState<XpEvent[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [prevCompleted, setPrevCompleted] = useState(0);

  const userId = user?.id || "guest";

  // Load on mount / user change
  useEffect(() => {
    const loaded = loadState(userId);
    setState(loaded);
    setPrevCompleted(completedCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Detect new completions and award XP
  useEffect(() => {
    if (completedCount > prevCompleted) {
      const gained = completedCount - prevCompleted;
      awardXp(gained * XP_PER_STEP, "تکمیل گام نقشه راه");
    }
    setPrevCompleted(completedCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedCount, prevCompleted]);

  // Update streak on activity
  useEffect(() => {
    if (completedCount === 0) return;
    const today = new Date().toDateString();
    setState((prev) => {
      if (prev.lastActiveDate === today) return prev;
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak =
        prev.lastActiveDate === yesterday ? prev.streak + 1 : 1;
      const next = { ...prev, streak: newStreak, lastActiveDate: today };
      saveState(userId, next);
      return next;
    });
  }, [completedCount, userId]);

  const awardXp = useCallback(
    (amount: number, reason: string) => {
      setState((prev) => {
        const newTotal = prev.totalXp + amount;
        const newLevel = Math.floor(newTotal / XP_PER_LEVEL) + 1;
        const leveledUp = newLevel > prev.level;
        if (leveledUp) {
          setShowLevelUp(true);
        }

        const event: XpEvent = {
          xp: amount,
          reason,
          id: Date.now() + Math.random(),
        };
        setXpEvents((evs) => [...evs, event]);
        setTimeout(() => {
          setXpEvents((evs) => evs.filter((e) => e.id !== event.id));
        }, 3000);

        const next = {
          ...prev,
          totalXp: newTotal,
          level: newLevel,
          xpInCurrentLevel: newTotal % XP_PER_LEVEL,
          xpForNextLevel: XP_PER_LEVEL,
        };
        saveState(userId, next);
        return next;
      });
    },
    [userId]
  );

  // Compute badges dynamically
  const badges = useMemo(
    () =>
      computeBadges(
        completedCount,
        totalSteps,
        phasesDone,
        totalPhases,
        state.streak
      ),
    [completedCount, totalSteps, phasesDone, totalPhases, state.streak]
  );

  return {
    ...state,
    badges,
    xpEvents,
    showLevelUp,
    setShowLevelUp,
    awardXp,
  };
}
