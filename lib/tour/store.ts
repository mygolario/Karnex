"use client";

import { create } from "zustand";
import type {
  TourExperienceLevel,
  TourPersona,
  TourPersistedState,
  TourPrimaryGoal,
  TourStepContext,
} from "./types";
import {
  defaultPersistedState,
  loadPersistedState,
  savePersistedState,
} from "./migration";
import { createEngineState, type TourEngineState } from "./engine";
import { getTourWithDynamic } from "./registry";
import {
  fetchRemoteTourProgress,
  queueTourProgressSync,
  reconcilePersistedState,
  setTourSyncEnabled,
} from "./sync";

export interface CelebrationPayload {
  tourId: string;
  tourTitle: string;
  xpReward: number;
}

interface TourStore {
  userId: string;
  initialized: boolean;
  persisted: TourPersistedState;
  engine: TourEngineState | null;
  isOpen: boolean;
  showWelcome: boolean;
  showCelebration: boolean;
  celebration: CelebrationPayload | null;
  beaconsEnabled: boolean;
  stepContext: TourStepContext;
  pendingXpCallback: ((amount: number, reason: string) => void) | null;
  reengagementCandidate: string | null;
  repersonalizePrompt: { kind: "projectType" | "plan"; value: string } | null;

  initialize: (userId: string) => Promise<void>;
  setStepContext: (ctx: Partial<TourStepContext>) => void;
  setPersona: (persona: TourPersona) => void;
  completeOnboarding: (
    persona: TourPersona,
    experienceLevel: TourExperienceLevel,
    primaryGoal: TourPrimaryGoal
  ) => void;
  setDisableAutoStart: (disabled: boolean) => void;
  setXpCallback: (cb: (amount: number, reason: string) => void) => void;
  recordEnvironmentSnapshot: (projectType?: string, plan?: string) => void;
  dismissReengagement: () => void;
  setReengagementCandidate: (tourId: string | null) => void;
  dismissRepersonalize: () => void;
  acceptRepersonalize: () => void;

  startTour: (tourId: string, stepIndex?: number, force?: boolean) => boolean;
  endTour: (markComplete?: boolean) => void;
  skipTour: () => void;
  skipTourById: (tourId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  jumpToStep: (index: number) => void;
  setPaused: (paused: boolean) => void;
  setInteractiveWaiting: (waiting: boolean) => void;
  completeChecklistItem: (itemId: string) => void;
  dismissBeacon: (targetId: string) => void;
  setBeaconsEnabled: (enabled: boolean) => void;
  closeWelcome: () => void;
  closeCelebration: () => void;
  markWhatsNewSeen: (version: string) => void;

  hasSeenTour: (tourId: string) => boolean;
  hasCompletedChecklistItem: (itemId: string) => boolean;
}

function persist(get: () => TourStore, partial: Partial<TourPersistedState>) {
  const { userId, persisted } = get();
  const next = { ...persisted, ...partial, updatedAt: Date.now() };
  savePersistedState(userId, next);
  queueTourProgressSync(partial);
  return next;
}

export const useTourStore = create<TourStore>((set, get) => ({
  userId: "guest",
  initialized: false,
  persisted: defaultPersistedState(),
  engine: null,
  isOpen: false,
  showWelcome: false,
  showCelebration: false,
  celebration: null,
  beaconsEnabled: true,
  stepContext: { persona: "general" },
  pendingXpCallback: null,
  reengagementCandidate: null,
  repersonalizePrompt: null,

  initialize: async (userId) => {
    const local = loadPersistedState(userId);
    const isGuest = userId === "guest";
    setTourSyncEnabled(!isGuest);

    set({
      userId,
      persisted: local,
      initialized: true,
      showWelcome: !local.hasSeenWelcome,
      beaconsEnabled: true,
    });

    if (isGuest) return;

    const remote = await fetchRemoteTourProgress();
    if (!remote) return;

    const reconciled = reconcilePersistedState(local, remote.persisted);
    if (reconciled !== local) {
      savePersistedState(userId, reconciled);
      set({
        persisted: reconciled,
        showWelcome: !reconciled.hasSeenWelcome,
        stepContext: { ...get().stepContext, persona: reconciled.persona ?? "general" },
      });
    }
  },

  setStepContext: (ctx) => {
    set((s) => ({ stepContext: { ...s.stepContext, ...ctx } }));
  },

  setPersona: (persona) => {
    const persisted = persist(get, { persona });
    set({ persisted, stepContext: { ...get().stepContext, persona } });
  },

  completeOnboarding: (persona, experienceLevel, primaryGoal) => {
    const persisted = persist(get, {
      persona,
      experienceLevel,
      primaryGoal,
      hasSeenWelcome: true,
    });
    set({
      persisted,
      showWelcome: false,
      stepContext: { ...get().stepContext, persona, experienceLevel, primaryGoal },
    });
  },

  setDisableAutoStart: (disabled) => {
    const persisted = persist(get, { disableAutoStart: disabled });
    set({ persisted });
  },

  setXpCallback: (cb) => set({ pendingXpCallback: cb }),

  recordEnvironmentSnapshot: (projectType, plan) => {
    const { persisted, showWelcome } = get();
    const prevProjectType = persisted.lastKnownProjectType;
    const prevPlan = persisted.lastKnownPlan;
    const nextProjectType = projectType ?? null;
    const nextPlan = plan ?? null;

    if (prevProjectType === nextProjectType && prevPlan === nextPlan) return;

    const nextPersisted = persist(get, {
      lastKnownProjectType: nextProjectType,
      lastKnownPlan: nextPlan,
    });

    // Only offer to re-personalize on a genuine *change* after onboarding, not on first observation.
    const isMaterialProjectTypeChange =
      prevProjectType !== null && nextProjectType !== null && prevProjectType !== nextProjectType;
    const isMaterialPlanUpgrade =
      prevPlan !== null && nextPlan !== null && prevPlan !== nextPlan;

    let repersonalizePrompt = get().repersonalizePrompt;
    if (!showWelcome && !repersonalizePrompt) {
      if (isMaterialProjectTypeChange && nextProjectType) {
        repersonalizePrompt = { kind: "projectType", value: nextProjectType };
      } else if (isMaterialPlanUpgrade && nextPlan) {
        repersonalizePrompt = { kind: "plan", value: nextPlan };
      }
    }

    set({ persisted: nextPersisted, repersonalizePrompt });
  },

  dismissRepersonalize: () => set({ repersonalizePrompt: null }),

  acceptRepersonalize: () => {
    // Re-open the guided onboarding so the user can pick a fresh persona/goal;
    // never silently mutate their persona without explicit confirmation.
    const nextPersisted = persist(get, { hasSeenWelcome: false });
    set({ persisted: nextPersisted, showWelcome: true, repersonalizePrompt: null });
  },

  setReengagementCandidate: (tourId) => set({ reengagementCandidate: tourId }),

  dismissReengagement: () => {
    // Session-scoped only: we intentionally don't persist a "reminded" flag so the
    // nudge stays a single gentle, transient suggestion rather than another thing to track forever.
    set({ reengagementCandidate: null });
  },

  startTour: (tourId, stepIndex, force = false) => {
    const { stepContext, persisted } = get();
    const tour = getTourWithDynamic(tourId);
    if (!tour) return false;

    const isSkipped = persisted.skippedTours?.includes(tourId);
    const isCompleted = persisted.completedTours.includes(tourId);

    if (!force && (isSkipped || isCompleted) && stepIndex === undefined) {
      return false;
    }

    const resumeIndex =
      stepIndex ??
      (persisted.activeTourId === tourId ? persisted.activeStepIndex : 0);

    const engine = createEngineState(tourId, stepContext, resumeIndex);
    if (!engine) return false;

    const nextPersisted = persist(get, {
      activeTourId: tourId,
      activeStepIndex: engine.stepIndex,
    });

    set({
      engine,
      isOpen: true,
      persisted: nextPersisted,
      showWelcome: false,
      reengagementCandidate: null,
    });
    return true;
  },

  endTour: (markComplete = true) => {
    const { engine, persisted, pendingXpCallback } = get();
    if (!engine) {
      set({ isOpen: false });
      return;
    }

    const tour = getTourWithDynamic(engine.tourId);
    let nextPersisted = { ...persisted };
    let celebration: CelebrationPayload | null = null;

    if (markComplete && tour && !persisted.completedTours.includes(engine.tourId)) {
      nextPersisted = {
        ...nextPersisted,
        completedTours: [...nextPersisted.completedTours, engine.tourId],
        activeTourId: null,
        activeStepIndex: 0,
      };
      const checklistId = `checklist-${engine.tourId}`;
      if (!nextPersisted.completedChecklistItems.includes(checklistId)) {
        nextPersisted.completedChecklistItems = [
          ...nextPersisted.completedChecklistItems,
          checklistId,
        ];
      }
      nextPersisted = persist(get, {
        completedTours: nextPersisted.completedTours,
        activeTourId: null,
        activeStepIndex: 0,
        completedChecklistItems: nextPersisted.completedChecklistItems,
      });
      queueTourProgressSync({ xpDelta: tour.xpReward });
      pendingXpCallback?.(tour.xpReward, `تکمیل تور: ${tour.title}`);
      celebration = {
        tourId: tour.id,
        tourTitle: tour.title,
        xpReward: tour.xpReward,
      };
    } else {
      nextPersisted = persist(get, { activeTourId: null, activeStepIndex: 0 });
    }

    set({
      engine: null,
      isOpen: false,
      persisted: nextPersisted,
      showCelebration: !!celebration,
      celebration,
    });
  },

  skipTour: () => {
    const { engine, persisted } = get();
    if (!engine) return;
    const skippedTours = persisted.skippedTours || [];
    const nextSkipped = skippedTours.includes(engine.tourId)
      ? skippedTours
      : [...skippedTours, engine.tourId];
    const nextPersisted = persist(get, {
      activeTourId: null,
      activeStepIndex: 0,
      skippedTours: nextSkipped,
    });
    set({ engine: null, isOpen: false, persisted: nextPersisted });
  },

  skipTourById: (tourId) => {
    const { persisted, engine } = get();
    const skippedTours = persisted.skippedTours || [];
    if (skippedTours.includes(tourId)) return;
    const isActive = engine?.tourId === tourId;
    const nextPersisted = persist(get, {
      skippedTours: [...skippedTours, tourId],
      ...(isActive ? { activeTourId: null, activeStepIndex: 0 } : {}),
    });
    set({
      persisted: nextPersisted,
      ...(isActive ? { engine: null, isOpen: false } : {}),
    });
  },

  nextStep: () => {
    const { engine } = get();
    if (!engine) return;
    if (engine.stepIndex >= engine.steps.length - 1) {
      get().endTour(true);
      return;
    }
    const nextIndex = engine.stepIndex + 1;
    const nextPersisted = persist(get, { activeStepIndex: nextIndex });
    set({
      engine: {
        ...engine,
        stepIndex: nextIndex,
        isInteractiveWaiting: false,
      },
      persisted: nextPersisted,
    });
  },

  prevStep: () => {
    const { engine } = get();
    if (!engine || engine.stepIndex <= 0) return;
    const prevIndex = engine.stepIndex - 1;
    const nextPersisted = persist(get, { activeStepIndex: prevIndex });
    set({
      engine: {
        ...engine,
        stepIndex: prevIndex,
        isInteractiveWaiting: false,
      },
      persisted: nextPersisted,
    });
  },

  jumpToStep: (index) => {
    const { engine } = get();
    if (!engine) return;
    const clamped = Math.max(0, Math.min(index, engine.steps.length - 1));
    const nextPersisted = persist(get, { activeStepIndex: clamped });
    set({
      engine: { ...engine, stepIndex: clamped, isInteractiveWaiting: false },
      persisted: nextPersisted,
    });
  },

  setPaused: (paused) => {
    const { engine } = get();
    if (!engine) return;
    set({ engine: { ...engine, paused } });
  },

  setInteractiveWaiting: (waiting) => {
    const { engine } = get();
    if (!engine) return;
    set({ engine: { ...engine, isInteractiveWaiting: waiting } });
  },

  completeChecklistItem: (itemId) => {
    const { persisted, pendingXpCallback } = get();
    if (persisted.completedChecklistItems.includes(itemId)) return;
    const next = persist(get, {
      completedChecklistItems: [...persisted.completedChecklistItems, itemId],
    });
    set({ persisted: next });
    queueTourProgressSync({ xpDelta: 15 });
    pendingXpCallback?.(15, "تکمیل آیتم چک‌لیست");
  },

  dismissBeacon: (targetId) => {
    const { persisted } = get();
    if (persisted.dismissedBeacons.includes(targetId)) return;
    const next = persist(get, {
      dismissedBeacons: [...persisted.dismissedBeacons, targetId],
    });
    set({ persisted: next });
  },

  setBeaconsEnabled: (enabled) => set({ beaconsEnabled: enabled }),

  closeWelcome: () => {
    const persisted = persist(get, { hasSeenWelcome: true });
    set({ showWelcome: false, persisted });
  },

  closeCelebration: () => set({ showCelebration: false, celebration: null }),

  markWhatsNewSeen: (version) => {
    const persisted = persist(get, { lastSeenWhatsNewVersion: version });
    set({ persisted });
  },

  hasSeenTour: (tourId) =>
    get().persisted.completedTours.includes(tourId) ||
    (get().persisted.skippedTours ?? []).includes(tourId),
  hasCompletedChecklistItem: (itemId) =>
    get().persisted.completedChecklistItems.includes(itemId),
}));
