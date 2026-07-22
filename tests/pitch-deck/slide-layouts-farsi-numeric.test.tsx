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

    const circles = container.querySelectorAll("circle");
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

  it("correctly parses Farsi decimal point (momayyez ٫) and calculates radii", () => {
    const { container } = renderSlide({
      type: "market",
      metadata: {
        tam: "۳٫۵", // Farsi momayyez ٫
        sam: "1.5",
        som: "0.5",
      },
    });

    const circles = container.querySelectorAll("circle");
    const rSam = parseFloat(circles[1].getAttribute("r") || "0");
    const rSom = parseFloat(circles[2].getAttribute("r") || "0");

    // It should parse correctly as 3.5, meaning rSam is ~78.52 and rSom is ~45.35
    expect(rSam).toBeCloseTo(78.52, 1);
    expect(rSom).toBeCloseTo(45.35, 1);
  });

  it("correctly parses Farsi thousand separator comma (،)", () => {
    const { container } = renderSlide({
      type: "market",
      metadata: {
        tam: "۱،۰۰۰", // Farsi comma thousands separator
        sam: "۵۰۰",
        som: "۲۰۰",
      },
    });

    const circles = container.querySelectorAll("circle");
    const rSam = parseFloat(circles[1].getAttribute("r") || "0");
    const rSom = parseFloat(circles[2].getAttribute("r") || "0");

    // 120 * Math.sqrt(500 / 1000) = 84.85...
    expect(rSam).toBeCloseTo(84.85, 1);
    // 120 * Math.sqrt(200 / 1000) = 53.66...
    expect(rSom).toBeCloseTo(53.66, 1);
  });
});
