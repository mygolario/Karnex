import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { SlideVisualizer } from "@/components/features/pitch-deck/slide-templates";
import { PitchDeckSlide } from "@/lib/db";

// Helper to render SlideVisualizer with custom slide properties
const renderSlide = (slide: Partial<PitchDeckSlide>) => {
  const fullSlide: PitchDeckSlide = {
    id: "test-slide-id",
    type: "generic",
    title: "Test Slide Title",
    bullets: [],
    ...slide,
  };
  return render(
    <SlideVisualizer
      slide={fullSlide}
      index={0}
      total={10}
      projectName="Test Project"
    />
  );
};

describe("Adversarial Testing: Market Layout (TAM/SAM/SOM)", () => {
  it("should not crash with division by zero or zeroes", () => {
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {
          tam: 0,
          sam: 0,
          som: 0,
        },
      })
    ).not.toThrow();
  });

  it("should not crash with negative numbers", () => {
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {
          tam: -1000000,
          sam: -500000,
          som: -100000,
        },
      })
    ).not.toThrow();
  });

  it("should not crash with null/undefined values", () => {
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {
          tam: null,
          sam: undefined,
          som: null,
        },
      })
    ).not.toThrow();
  });

  it("should not crash with non-numeric strings", () => {
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {
          tam: "not-a-number",
          sam: "invalid",
          som: "",
        },
      })
    ).not.toThrow();
  });

  it("should not crash with objects or arrays", () => {
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {
          tam: {},
          sam: [],
          som: { value: 100 },
        },
      })
    ).not.toThrow();
  });

  it("should not crash with Symbol", () => {
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {
          tam: Symbol("tam-symbol"),
        },
      })
    ).not.toThrow();
  });

  it("should not crash with extremely long strings", () => {
    const longString = "A".repeat(10000);
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {
          tam: longString,
          sam: longString,
          som: longString,
          tamDesc: longString,
          samDesc: longString,
          somDesc: longString,
        },
      })
    ).not.toThrow();
  });
});

describe("Adversarial Testing: Team Layout", () => {
  it("should not crash when team is a string instead of an array", () => {
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: "not-an-array",
        },
      })
    ).not.toThrow();
  });

  it("should not crash when members is a string instead of an array", () => {
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          members: "not-an-array",
        },
      })
    ).not.toThrow();
  });

  it("should not crash when team is an object instead of an array", () => {
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: { member1: { name: "Alice" } },
        },
      })
    ).not.toThrow();
  });

  it("should not crash when team contains null or undefined elements", () => {
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: [null, undefined],
        },
      })
    ).not.toThrow();
  });

  it("should not crash when team member fields are missing", () => {
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: [{}, { name: "Bob" }, { role: "Developer" }],
        },
      })
    ).not.toThrow();
  });

  it("should not crash when role is a number", () => {
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: [{ name: "Charlie", role: 12345 }],
        },
      })
    ).not.toThrow();
  });

  it("should not crash when role is an object", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: [{ name: "Dave", role: { title: "Designer" } }],
        },
      })
    ).not.toThrow();
    spy.mockRestore();
  });

  it("should not crash when name is an object", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: [{ name: { first: "Eve" }, role: "CTO" }],
        },
      })
    ).not.toThrow();
    spy.mockRestore();
  });

  it("should not crash with extremely long strings", () => {
    const longString = "A".repeat(10000);
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: [{ name: longString, role: longString }],
        },
      })
    ).not.toThrow();
  });
});

describe("Adversarial Testing: SWOT / Competition Layout", () => {
  it("should not crash when competitors is a string instead of an array", () => {
    expect(() =>
      renderSlide({
        type: "competition",
        metadata: {
          competitors: "not-an-array",
        },
      })
    ).not.toThrow();
  });

  it("should not crash when competitors contains null/undefined", () => {
    expect(() =>
      renderSlide({
        type: "competition",
        metadata: {
          competitors: [null, undefined],
        },
      })
    ).not.toThrow();
  });

  it("should not crash when competitors fields are missing", () => {
    expect(() =>
      renderSlide({
        type: "competition",
        metadata: {
          competitors: [{}, { name: "Rival A" }],
        },
      })
    ).not.toThrow();
  });

  it("should not crash when competitor name is an object", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      renderSlide({
        type: "competition",
        metadata: {
          competitors: [{ name: { brand: "Rival" }, weakness: "Slow" }],
        },
      })
    ).not.toThrow();
    spy.mockRestore();
  });

  it("should not crash with extremely long strings", () => {
    const longString = "A".repeat(10000);
    expect(() =>
      renderSlide({
        type: "competition",
        metadata: {
          competitors: [{ name: longString, strength: longString, weakness: longString }],
        },
      })
    ).not.toThrow();
  });
});

describe("Adversarial Testing: Ask Budget Breakdown Layout", () => {
  it("should not crash when budget is a string instead of an array", () => {
    expect(() =>
      renderSlide({
        type: "ask",
        metadata: {
          budget: "not-an-array",
        },
      })
    ).not.toThrow();
  });

  it("should not crash when budget contains null/undefined", () => {
    expect(() =>
      renderSlide({
        type: "ask",
        metadata: {
          budget: [null, undefined],
        },
      })
    ).not.toThrow();
  });

  it("should not crash when budget fields are missing", () => {
    expect(() =>
      renderSlide({
        type: "ask",
        metadata: {
          budget: [{}, { category: "R&D" }, { percentage: 50 }],
        },
      })
    ).not.toThrow();
  });

  it("should not crash when budget category is an object", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      renderSlide({
        type: "ask",
        metadata: {
          budget: [{ category: { name: "Marketing" }, percentage: 50 }],
        },
      })
    ).not.toThrow();
    spy.mockRestore();
  });

  it("should not crash with negative or extreme percentage values", () => {
    expect(() =>
      renderSlide({
        type: "ask",
        metadata: {
          budget: [
            { category: "Marketing", percentage: -100 },
            { category: "Sales", percentage: 100000 },
          ],
        },
      })
    ).not.toThrow();
  });

  it("should not crash with non-numeric percentages", () => {
    expect(() =>
      renderSlide({
        type: "ask",
        metadata: {
          budget: [
            { category: "Marketing", percentage: "50%" },
            { category: "Sales", percentage: NaN },
            { category: "Engineering", percentage: undefined },
            { category: "Operations", percentage: null },
          ],
        },
      })
    ).not.toThrow();
  });

  it("should not crash with extremely long strings", () => {
    const longString = "A".repeat(10000);
    expect(() =>
      renderSlide({
        type: "ask",
        metadata: {
          amount: longString,
          runway: longString,
          budget: [{ category: longString, percentage: 50 }],
        },
      })
    ).not.toThrow();
  });
});
