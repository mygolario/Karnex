import { describe, it, expect } from "vitest";
import {
  stateToSyncPayload,
  dbCardsToState,
  parseCanvasLayout,
  buildCanvasLayout,
  countCardsInState,
  defaultCanvasTypeForProject,
} from "@/lib/canvas/persistence";
import { migrateLegacyState } from "@/lib/canvas/store";
import type { CanvasState } from "@/lib/canvas/types";

describe("Canvas persistence helpers", () => {
  const sampleState: CanvasState = {
    problem: [
      {
        id: "card-abc123",
        section: "problem",
        content: "مشکل تست",
        cardType: "NOTE",
        color: "blue",
        order: 0,
        tags: ["startup"],
        isAIGenerated: true,
      },
    ],
    solution: [
      {
        id: "card-def456",
        section: "solution",
        content: "راه‌حل",
        cardType: "CHECKLIST",
        color: "green",
        order: 0,
        metadata: { items: [{ text: "قدم ۱", done: false }] },
      },
    ],
  };

  it("converts state to sync payload with metadata", () => {
    const payload = stateToSyncPayload(sampleState);
    expect(payload).toHaveLength(2);
    expect(payload[0].id).toBe("card-abc123");
    expect(payload[0].metadata?.tags).toEqual(["startup"]);
    expect(payload[0].metadata?.isAIGenerated).toBe(true);
    expect(payload[1].metadata?.items).toBeDefined();
  });

  it("round-trips DB rows back to canvas state", () => {
    const payload = stateToSyncPayload(sampleState);
    const rows = payload.map((p) => ({
      ...p,
      x: p.x ?? null,
      y: p.y ?? null,
      width: p.width ?? null,
      height: p.height ?? null,
      metadata: p.metadata ?? null,
    }));
    const restored = dbCardsToState(rows);
    expect(restored.problem[0].content).toBe("مشکل تست");
    expect(restored.problem[0].tags).toEqual(["startup"]);
    expect(restored.solution[0].cardType).toBe("CHECKLIST");
  });

  it("parses canvas layout JSON", () => {
    const layout = buildCanvasLayout(
      [{ id: "c1", fromId: "a", toId: "b" }],
      "freeform"
    );
    const parsed = parseCanvasLayout(layout);
    expect(parsed.viewMode).toBe("freeform");
    expect(parsed.connections).toHaveLength(1);
  });

  it("migrates legacy string arrays to card state", () => {
    const legacy = {
      problem: ["مشکل ۱", "مشکل ۲"],
      solution: "راه‌حل تکی",
    };
    const state = migrateLegacyState(legacy, "LEAN");
    expect(countCardsInState(state)).toBeGreaterThan(0);
    expect(state.problem).toHaveLength(2);
    expect(state.solution[0].content).toBe("راه‌حل تکی");
  });

  it("defaults canvas type by project pillar", () => {
    expect(defaultCanvasTypeForProject("creator")).toBe("BRAND");
    expect(defaultCanvasTypeForProject("startup")).toBe("BMC");
  });
});
