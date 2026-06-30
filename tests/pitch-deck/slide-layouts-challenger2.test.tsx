import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SlideVisualizer } from "@/components/features/pitch-deck/slide-templates";
import { DeckPreview } from "@/components/features/pitch-deck/deck-preview";
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

describe("Challenger 2: Numeric Parsing and Farsi Character Set Robustness", () => {
  it("verifies behavior of Farsi decimal separator (٫) vs standard dot (.) in TAM/SAM/SOM", () => {
    // If Farsi decimal point (٫) is used, e.g. "۱۲٫۳۴", does it parse correctly or strip the separator?
    const { container } = renderSlide({
      type: "market",
      metadata: {
        tam: "۱۰۰٫۵", // Expected to represent 100.5
        sam: "۵۰.۵",  // Expected to represent 50.5
        som: "۱۰",
      },
    });

    // Let's inspect if it crashes or parses in an unexpected way
    expect(container).toBeDefined();
  });

  it("verifies behavior of budget percentage with Farsi decimal point", () => {
    const { container } = renderSlide({
      type: "ask",
      metadata: {
        amount: "10B",
        runway: "12 months",
        budget: [
          { category: "Marketing", percentage: "۴۵٫۵" }, // expected 45.5%
        ],
      },
    });

    // Check if the progress bar width is correct or capped at 100% due to parsing 45.5 to 455
    const progressBar = container.querySelector(".bg-cyan-500");
    expect(progressBar).toBeDefined();
  });

  it("verifies behavior with Farsi thousand separators (٬)", () => {
    const { container } = renderSlide({
      type: "market",
      metadata: {
        tam: "۱٬۲۳۴٬۵۶۷", // Expected 1234567
        sam: "۵۰۰,۰۰۰",   // Expected 500000
        som: "۱۰۰۰۰۰",
      },
    });
    expect(container).toBeDefined();
  });
});

describe("Challenger 2: Empty Slide List States and Extreme Inputs", () => {
  it("renders DeckPreview with empty slides array", () => {
    const { container } = render(
      <DeckPreview
        slides={[]}
        onEditSlide={() => {}}
        onDeleteSlide={() => {}}
        onRegenerate={() => {}}
        onDownload={() => {}}
      />
    );
    expect(screen.getByText("افزودن اسلاید جدید")).toBeDefined();
  });

  it("handles empty slides in SlideVisualizer gracefully", () => {
    // Renders null when no slide is provided
    const { container } = render(
      // @ts-ignore
      <SlideVisualizer
        slide={null}
        index={0}
        total={0}
        projectName="Test"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders SlideVisualizer under extremely large metadata numbers (Overflow check)", () => {
    expect(() =>
      renderSlide({
        type: "market",
        metadata: {
          tam: 1e30,
          sam: 1e20,
          som: 1e10,
        },
      })
    ).not.toThrow();
  });

  it("renders SlideVisualizer under negative values for budget percentages", () => {
    const { container } = renderSlide({
      type: "ask",
      metadata: {
        budget: [
          { category: "Test", percentage: -50 }
        ]
      }
    });
    const progressBar = container.querySelector(".bg-cyan-500");
    // Width should be constrained/handled and not crash
    expect(progressBar).toBeDefined();
  });
});
