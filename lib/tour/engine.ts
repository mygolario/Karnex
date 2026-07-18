import type { TourStep, TourStepContext } from "./types";
import { getVisibleSteps, getTourWithDynamic } from "./registry";

export interface TourEngineState {
  tourId: string;
  stepIndex: number;
  steps: TourStep[];
  isInteractiveWaiting: boolean;
  paused: boolean;
}

export function createEngineState(
  tourId: string,
  ctx: TourStepContext,
  startIndex = 0
): TourEngineState | null {
  const tour = getTourWithDynamic(tourId);
  if (!tour) return null;
  const steps = getVisibleSteps(tourId, ctx);
  if (!steps.length) return null;
  return {
    tourId,
    stepIndex: Math.min(startIndex, steps.length - 1),
    steps,
    isInteractiveWaiting: false,
    paused: false,
  };
}

export function getCurrentStep(state: TourEngineState | null): TourStep | null {
  if (!state) return null;
  return state.steps[state.stepIndex] ?? null;
}

export function canGoNext(state: TourEngineState | null): boolean {
  if (!state) return false;
  return state.stepIndex < state.steps.length - 1;
}

export function canGoPrev(state: TourEngineState | null): boolean {
  if (!state) return false;
  return state.stepIndex > 0;
}

export function advanceStep(state: TourEngineState): {
  state: TourEngineState;
  completed: boolean;
} {
  if (state.stepIndex >= state.steps.length - 1) {
    return { state, completed: true };
  }
  return {
    state: {
      ...state,
      stepIndex: state.stepIndex + 1,
      isInteractiveWaiting: false,
    },
    completed: false,
  };
}

export function retreatStep(state: TourEngineState): TourEngineState {
  if (state.stepIndex <= 0) return state;
  return {
    ...state,
    stepIndex: state.stepIndex - 1,
    isInteractiveWaiting: false,
  };
}

export function jumpToStep(state: TourEngineState, index: number): TourEngineState {
  return {
    ...state,
    stepIndex: Math.max(0, Math.min(index, state.steps.length - 1)),
    isInteractiveWaiting: false,
  };
}

export function setInteractiveWaiting(
  state: TourEngineState,
  waiting: boolean
): TourEngineState {
  return { ...state, isInteractiveWaiting: waiting };
}

export function isCenteredStep(step: TourStep | null): boolean {
  if (!step) return true;
  return (
    step.type === "centered" ||
    !step.target ||
    step.target === "center" ||
    step.target === "dashboard-root"
  );
}

export function getStepRoute(step: TourStep | null, tourDefaultRoute?: string): string | null {
  if (!step) return null;
  return step.route ?? tourDefaultRoute ?? null;
}
