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

describe("Market Layout (TAM/SAM/SOM)", () => {
  it("renders successfully with valid numeric/string metadata", () => {
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {
          tam: 1000000,
          sam: "500000",
          som: 100000,
          tamDesc: "Total addressable market",
          samDesc: "Serviceable addressable market",
          somDesc: "Serviceable obtainable market",
        },
      })
    ).not.toThrow();
  });

  it("renders successfully with empty metadata or empty arrays", () => {
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {},
      })
    ).not.toThrow();
  });

  it("renders successfully with null/undefined values", () => {
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

  it("renders successfully with invalid non-numeric strings", () => {
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {
          tam: "invalid-number",
          sam: "not-a-number",
          som: "som-value",
        },
      })
    ).not.toThrow();
  });

  it("renders successfully with negative numbers (numbers and strings)", () => {
    // String negative values get sanitized of the minus sign, number negative values don't.
    // However, neither should crash the component rendering.
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {
          tam: -1000,
          sam: "-500",
          som: -100,
        },
      })
    ).not.toThrow();
  });

  it("renders successfully with extreme differences (large SAM/SOM relative to TAM)", () => {
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {
          tam: 10,
          sam: 1000,
          som: 500,
        },
      })
    ).not.toThrow();
  });

  it("does not crash when metadata value is a Symbol", () => {
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {
          tam: Symbol("tam-symbol"),
        },
      })
    ).not.toThrow();
  });
});

describe("Team Layout", () => {
  it("renders successfully with valid team members", () => {
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: [
            { name: "علی رضایی", role: "CEO" },
            { name: "سارا احمدی", role: "CTO" },
          ],
        },
      })
    ).not.toThrow();
  });

  it("renders successfully with empty team or members lists", () => {
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: [],
        },
      })
    ).not.toThrow();

    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          members: [],
        },
      })
    ).not.toThrow();
  });

  it("does not crash if team is a string instead of an array", () => {
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: "not-an-array",
        },
      })
    ).not.toThrow();
  });

  it("does not crash if team contains null or undefined elements", () => {
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: [null],
        },
      })
    ).not.toThrow();

    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: [undefined],
        },
      })
    ).not.toThrow();
  });

  it("does not crash if a team member name is an object", () => {
    // Suppress console.error output during this test since we expect a React error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: [{ name: { first: "Ali", last: "Rezaci" }, role: "CEO" }],
        },
      })
    ).not.toThrow();
    spy.mockRestore();
  });

  it("does not crash if a team member role is an object", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: [{ name: "Ali Rezaci", role: { title: "CEO" } }],
        },
      })
    ).not.toThrow();
    spy.mockRestore();
  });

  it("does not crash if a team member role is a number", () => {
    expect(() =>
      renderSlide({
        type: "team",
        metadata: {
          team: [{ name: "Ali Rezaci", role: 123 }],
        },
      })
    ).not.toThrow();
  });
});

describe("SWOT / Competition Layout", () => {
  it("renders successfully with valid competitors list", () => {
    expect(() =>
      renderSlide({
        type: "competition",
        metadata: {
          competitors: [
            { name: "رقیب الف", weakness: "ضعف سرعت", strength: "قدمت زیاد" },
          ],
        },
      })
    ).not.toThrow();
  });

  it("renders successfully with empty competitors list", () => {
    expect(() =>
      renderSlide({
        type: "competition",
        metadata: {
          competitors: [],
        },
      })
    ).not.toThrow();
  });

  it("does not crash if competitors is a string instead of an array", () => {
    expect(() =>
      renderSlide({
        type: "competition",
        metadata: {
          competitors: "not-an-array",
        },
      })
    ).not.toThrow();
  });

  it("does not crash if competitors contains null/undefined", () => {
    expect(() =>
      renderSlide({
        type: "competition",
        metadata: {
          competitors: [null],
        },
      })
    ).not.toThrow();
  });

  it("does not crash if competitor name is an object", () => {
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
});

describe("Ask Budget Breakdown Layout", () => {
  it("renders successfully with valid budget breakdown", () => {
    expect(() =>
      renderSlide({
        type: "ask",
        metadata: {
          amount: "10 میلیارد تومان",
          runway: "18 ماه",
          budget: [
            { category: "توسعه محصول", percentage: 50 },
            { category: "بازاریابی", percentage: 50 },
          ],
        },
      })
    ).not.toThrow();
  });

  it("renders successfully with negative or extreme percentage values", () => {
    expect(() =>
      renderSlide({
        type: "ask",
        metadata: {
          budget: [
            { category: "منفی", percentage: -50 },
            { category: "بزرگ", percentage: 1000 },
          ],
        },
      })
    ).not.toThrow();
  });

  it("does not crash if budget is a string instead of an array", () => {
    expect(() =>
      renderSlide({
        type: "ask",
        metadata: {
          budget: "not-an-array",
        },
      })
    ).not.toThrow();
  });

  it("does not crash if budget contains null/undefined", () => {
    expect(() =>
      renderSlide({
        type: "ask",
        metadata: {
          budget: [null],
        },
      })
    ).not.toThrow();
  });

  it("does not crash if budget category is an object", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      renderSlide({
        type: "ask",
        metadata: {
          budget: [{ category: { name: "R&D" }, percentage: 50 }],
        },
      })
    ).not.toThrow();
    spy.mockRestore();
  });
});
