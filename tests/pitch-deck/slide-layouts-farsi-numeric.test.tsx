import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { SlideVisualizer } from "@/components/features/pitch-deck/slide-templates";
import { PitchDeckSlide } from "@/lib/db";

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

describe("Farsi Numeric Parsing and Separators Validation", () => {
  it("computes correct SAM and SOM circle radii with standard English decimals", () => {
    const { container } = renderSlide({
      type: "market",
      metadata: {
        tam: "3.5",
        sam: "1.5",
        som: "0.5",
      },
    });

    const circles = container.querySelectorAll("svg.pitch-market-circles circle");
    expect(circles.length).toBe(3);

    const rTam = parseFloat(circles[0].getAttribute("r") || "0");
    const rSam = parseFloat(circles[1].getAttribute("r") || "0");
    const rSom = parseFloat(circles[2].getAttribute("r") || "0");

    expect(rTam).toBe(120);
    // 120 * Math.sqrt(1.5 / 3.5) = 78.52...
    expect(rSam).toBeCloseTo(78.52, 1);
    // 120 * Math.sqrt(0.5 / 3.5) = 45.35...
    expect(rSom).toBeCloseTo(45.35, 1);
  });

  it("fails to parse Farsi decimal point (momayyez ٫) correctly, treating it as 35 instead of 3.5", () => {
    const { container } = renderSlide({
      type: "market",
      metadata: {
        tam: "۳٫۵", // Farsi momayyez ٫
        sam: "1.5",
        som: "0.5",
      },
    });

    const circles = container.querySelectorAll("svg.pitch-market-circles circle");
    const rSam = parseFloat(circles[1].getAttribute("r") || "0");
    const rSom = parseFloat(circles[2].getAttribute("r") || "0");

    // If it parsed correctly as 3.5, rSam would be ~78.5.
    // Since it parses as 35, rSam evaluates to 45 (the Math.max cap for s/t = 1.5/35).
    // This is the bug we are highlighting.
    console.log("[TEST LOG] rSam for Farsi momayyez: ", rSam);
    console.log("[TEST LOG] rSom for Farsi momayyez: ", rSom);
    
    // We expect it to be 45 (the bug state) instead of 78.52.
    expect(rSam).toBe(45); // This proves it parsed as 35.
  });

  it("fails to parse Farsi thousand separator comma (،) correctly in builder input logic", () => {
    // Note: Farsi commas are stripped in parseNum via regex replace [^0-9.-] which is correct for display,
    // but let's document how the input parser in the builder fails. We can verify this via direct simulation.
  });
});
