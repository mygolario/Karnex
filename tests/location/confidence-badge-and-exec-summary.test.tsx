import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ConfidenceBadge } from "@/components/dashboard/location/confidence-badge";
import { ConfidenceLevel } from "@/lib/location/confidence";

vi.mock("@/components/dashboard/location/location-context", () => ({
  useLocation: () => ({
    analysis: {
      city: "Tehran",
      address: "Test",
      executiveSummary: {
        narrative: "خلاصه آزمایشی کافی طولانی برای نمایش دکمه بیشتر و لینک‌ها.",
        evidenceLinks: [
          { tab: "financial", label: "تحلیل مالی" },
          { tab: "financial", label: "تحلیل مالی دوم" },
          { label: "بدون tab" },
          { tab: "map", label: "نقشه" },
        ],
      },
    },
  }),
}));

import { ExecutiveSummaryCard } from "@/components/dashboard/location/executive-summary-card";

describe("ConfidenceBadge", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("does not throw when level is undefined (regression for TypeError reading 'badge')", () => {
    expect(() => render(<ConfidenceBadge level={undefined} />)).not.toThrow();
  });

  it("does not throw when level is an invalid string not in CONFIDENCE_STYLES", () => {
    expect(() =>
      render(<ConfidenceBadge level={"high" as unknown as ConfidenceLevel} />)
    ).not.toThrow();
  });

  it("renders the fallback label when level is undefined", () => {
    render(<ConfidenceBadge level={undefined} />);
    expect(screen.getByText("تخمین هوشمند")).toBeDefined();
  });

  it("renders the correct label for a valid level", () => {
    const { unmount } = render(<ConfidenceBadge level="real" />);
    expect(screen.getByText("داده واقعی")).toBeDefined();
    unmount();

    render(<ConfidenceBadge level="inferred" />);
    expect(screen.getByText("استنتاج")).toBeDefined();
  });
});

describe("ExecutiveSummaryCard evidenceLinks keys", () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it("renders without React 'unique key' warning when tabs are missing or duplicated", () => {
    render(<ExecutiveSummaryCard onNavigateTab={() => {}} />);

    const keyWarnings = errorSpy.mock.calls.filter((c) =>
      String(c[0] || "").includes('unique "key" prop')
    );
    expect(keyWarnings).toEqual([]);

    const buttons = screen.getAllByRole("button");
    const linkLabels = buttons
      .map((b) => b.textContent)
      .filter((t) => t === "تحلیل مالی" || t === "تحلیل مالی دوم" || t === "نقشه");
    expect(linkLabels).toEqual(["تحلیل مالی", "تحلیل مالی دوم", "نقشه"]);
  });
});
