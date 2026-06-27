import { describe, it, expect, beforeEach, vi } from "vitest";
import { useTourStore } from "@/lib/tour/store";

describe("Tour Store", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset store state
    const store = useTourStore.getState();
    store.initialize("test-user");
  });

  it("should initialize with default values", () => {
    const state = useTourStore.getState();
    expect(state.initialized).toBe(true);
    expect(state.userId).toBe("test-user");
    expect(state.persisted.completedTours).toEqual([]);
    expect(state.persisted.skippedTours).toEqual([]);
  });

  it("should skip tour and store it in skippedTours", () => {
    const store = useTourStore.getState();
    
    // Start dashboard tour
    const started = store.startTour("dashboard", 0, true);
    expect(started).toBe(true);
    
    let activeState = useTourStore.getState();
    expect(activeState.isOpen).toBe(true);
    expect(activeState.engine?.tourId).toBe("dashboard");

    // Skip the tour
    activeState.skipTour();

    const nextState = useTourStore.getState();
    expect(nextState.isOpen).toBe(false);
    expect(nextState.engine).toBeNull();
    expect(nextState.persisted.skippedTours).toContain("dashboard");
    expect(nextState.persisted.activeTourId).toBeNull();
  });

  it("should skip a specific tour by ID", () => {
    const store = useTourStore.getState();
    store.skipTourById("canvas");

    const nextState = useTourStore.getState();
    expect(nextState.persisted.skippedTours).toContain("canvas");
  });

  it("should not duplicate tour in skippedTours if skipped multiple times", () => {
    const store = useTourStore.getState();
    store.skipTourById("canvas");

    const nextState = useTourStore.getState();
    nextState.skipTourById("canvas");

    const finalState = useTourStore.getState();
    expect(finalState.persisted.skippedTours).toEqual(["canvas"]);
  });

  it("should update persisted state in memory for nextStep and prevStep", () => {
    const store = useTourStore.getState();
    const started = store.startTour("dashboard", 0, true);
    expect(started).toBe(true);
    
    let currentState = useTourStore.getState();
    expect(currentState.engine?.stepIndex).toBe(0);

    // Call nextStep
    currentState.nextStep();
    let nextState = useTourStore.getState();
    expect(nextState.engine?.stepIndex).toBe(1);
    expect(nextState.persisted.activeStepIndex).toBe(1);

    // Call prevStep
    nextState.prevStep();
    let prevState = useTourStore.getState();
    expect(prevState.engine?.stepIndex).toBe(0);
    expect(prevState.persisted.activeStepIndex).toBe(0);
  });
});
