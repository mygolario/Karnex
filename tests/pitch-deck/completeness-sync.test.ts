import { describe, it, expect } from "vitest";
import {
  buildCompletenessChecklist,
  buildSyncProposals,
  applySyncProposals,
  getVisibleSlides,
  createEmptySlide,
} from "@/lib/pitch-deck";
import type { PitchDeckSlide, BusinessPlan } from "@/lib/db";

describe("Pitch Deck completeness", () => {
  it("flags missing ask amount", () => {
    const slides: PitchDeckSlide[] = [
      createEmptySlide("ask", { title: "درخواست", bullets: [], metadata: {} }),
    ];
    const items = buildCompletenessChecklist(slides);
    expect(items.some((i) => i.id.includes("ask-amount"))).toBe(true);
  });

  it("flags empty traction metrics", () => {
    const slides: PitchDeckSlide[] = [
      createEmptySlide("traction", {
        title: "تراکشن",
        bullets: ["رشد"],
        metadata: { metrics: [] },
      }),
    ];
    const items = buildCompletenessChecklist(slides);
    expect(items.some((i) => i.id.includes("traction"))).toBe(true);
  });

  it("ignores hidden slides for checklist content", () => {
    const slides: PitchDeckSlide[] = [
      createEmptySlide("ask", {
        title: "",
        bullets: [],
        isHidden: true,
        metadata: {},
      }),
    ];
    const items = buildCompletenessChecklist(slides);
    expect(items.every((i) => i.slideIndex !== 0 || i.id === "missing-ask")).toBe(true);
  });
});

describe("Pitch Deck visibility", () => {
  it("filters hidden slides", () => {
    const slides: PitchDeckSlide[] = [
      createEmptySlide("title", { isHidden: false }),
      createEmptySlide("problem", { isHidden: true }),
      createEmptySlide("solution", { isHidden: false }),
    ];
    expect(getVisibleSlides(slides)).toHaveLength(2);
  });
});

describe("Pitch Deck sync", () => {
  it("builds competition proposals from project competitors", () => {
    const slides: PitchDeckSlide[] = [
      createEmptySlide("competition", { id: "c1", title: "رقبا", metadata: {} }),
    ];
    const project = {
      competitors: [
        { name: "رقیب الف", strength: "برند", weakness: "قیمت" },
      ],
    } as BusinessPlan;

    const proposals = buildSyncProposals(slides, project);
    expect(proposals).toHaveLength(1);
    expect(proposals[0].slideId).toBe("c1");

    const applied = applySyncProposals(slides, proposals, new Set(["c1"]));
    expect(applied[0].metadata?.competitors).toHaveLength(1);
    expect(applied[0].metadata?.competitors[0].name).toBe("رقیب الف");
  });

  it("does not apply unaccepted proposals", () => {
    const slides: PitchDeckSlide[] = [
      createEmptySlide("competition", { id: "c1", metadata: { competitors: [] } }),
    ];
    const project = {
      competitors: [{ name: "X", strength: "a", weakness: "b" }],
    } as BusinessPlan;
    const proposals = buildSyncProposals(slides, project);
    const applied = applySyncProposals(slides, proposals, new Set());
    expect(applied[0].metadata?.competitors).toEqual([]);
  });
});
