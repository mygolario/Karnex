import { describe, it, expect, beforeEach } from "vitest";
import { useTourStore } from "@/lib/tour/store";
import { defaultPersistedState } from "@/lib/tour/migration";

describe("Tour Store", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Reset store state fully (initialize alone doesn't clear isOpen/engine)
    useTourStore.setState({
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
    });

    // Initialize for test-user
    useTourStore.getState().initialize("test-user");
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
    
    const activeState = useTourStore.getState();
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
    
    const currentState = useTourStore.getState();
    expect(currentState.engine?.stepIndex).toBe(0);

    // Call nextStep
    currentState.nextStep();
    const nextState = useTourStore.getState();
    expect(nextState.engine?.stepIndex).toBe(1);
    expect(nextState.persisted.activeStepIndex).toBe(1);

    // Call prevStep
    nextState.prevStep();
    const prevState = useTourStore.getState();
    expect(prevState.engine?.stepIndex).toBe(0);
    expect(prevState.persisted.activeStepIndex).toBe(0);
  });

  it("should not start a skipped tour without force", () => {
    const store = useTourStore.getState();

    store.skipTourById("roadmap");

    const started = store.startTour("roadmap");
    expect(started).toBe(false);

    const state = useTourStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.engine).toBeNull();
  });

  it("should start a skipped tour with force=true", () => {
    const store = useTourStore.getState();

    store.skipTourById("roadmap");

    const started = store.startTour("roadmap", 0, true);
    expect(started).toBe(true);

    const state = useTourStore.getState();
    expect(state.isOpen).toBe(true);
    expect(state.engine?.tourId).toBe("roadmap");
  });

  it("should not start a completed tour without force", () => {
    const store = useTourStore.getState();

    store.startTour("canvas", 0, true);
    store.endTour(true);

    const startedAgain = store.startTour("canvas");
    expect(startedAgain).toBe(false);
  });

  it("hasSeenTour should return true for skipped tours", () => {
    const store = useTourStore.getState();

    store.skipTourById("scripts");

    const state = useTourStore.getState();
    expect(state.hasSeenTour("scripts")).toBe(true);
  });

  it("skipTourById should clear active engine if it matches", () => {
    const store = useTourStore.getState();

    store.startTour("dashboard", 0, true);
    expect(useTourStore.getState().isOpen).toBe(true);

    store.skipTourById("dashboard");

    const state = useTourStore.getState();
    expect(state.isOpen).toBe(false);
    expect(state.engine).toBeNull();
    expect(state.persisted.activeTourId).toBeNull();
    expect(state.persisted.skippedTours).toContain("dashboard");
  });
});
