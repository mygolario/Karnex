import { describe, it, expect } from "vitest";
import { promoteCanvasCardToRoadmapTask, syncChecklistItemFromRoadmapStep } from "@/lib/canvas/roadmap-sync";

describe("Canvas roadmap sync", () => {
  it("promotes checklist item to roadmap phase", () => {
    const { roadmap, stepId } = promoteCanvasCardToRoadmapTask([], "تست وظیفه");
    expect(roadmap).toHaveLength(1);
    expect(roadmap[0].steps).toHaveLength(1);
    expect(stepId).toBeTruthy();
  });

  it("syncs checklist done state from roadmap step", () => {
    const items = [{ id: "1", text: "کار", done: false, roadmapStepId: "step-1" }];
    const synced = syncChecklistItemFromRoadmapStep(items, "step-1", true);
    expect(synced[0].done).toBe(true);
  });
});
