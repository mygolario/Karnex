/** @vitest-environment jsdom */
import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

const wizardState = {
  answers: {} as Record<string, string>,
  setAnswer: vi.fn(),
  activeSubStep: 2,
  nextSubStep: vi.fn(),
  prevSubStep: vi.fn(),
  advance: vi.fn(),
  retreat: vi.fn(),
  interviewFieldIds: ["industry", "problem", "solution"],
  consumeAssist: () => true,
  assistsRemaining: 3,
  pathMode: "express" as const,
};

vi.mock("@/components/features/new-project/genesis-wizard-context", () => ({
  useGenesisWizard: () => wizardState,
}));

vi.mock("@/lib/ai-actions", () => ({
  genesisDraftFromChipsAction: vi.fn(),
  genesisCoachTipAction: vi.fn(),
}));

import { StepInterview } from "@/components/features/new-project/step-interview";

describe("StepInterview heading", () => {
  beforeEach(() => {
    wizardState.activeSubStep = 2;
    wizardState.pathMode = "express";
    wizardState.interviewFieldIds = ["industry", "problem", "solution"];
    wizardState.answers = {};
  });

  it("shows only solution question without duplicate React keys", () => {
    const errors: string[] = [];
    const prev = console.error;
    console.error = (...args: unknown[]) => {
      errors.push(String(args[0] ?? ""));
      prev(...args);
    };
    try {
      const { container } = render(React.createElement(StepInterview));
      const h2s = container.querySelectorAll("h2");
      expect(h2s.length).toBe(1);
      expect(h2s[0].textContent?.trim()).toBe("راه‌حل ساده‌ات چیست؟");
      expect(
        (container.textContent?.match(/چه مشکلی آزارت می‌دهد؟/g) || []).length
      ).toBe(0);
      expect(
        errors.some((e) => e.includes("two children with the same key"))
      ).toBe(false);
    } finally {
      console.error = prev;
    }
  });

  it("shows only problem question on problem substep", () => {
    wizardState.activeSubStep = 1;
    const { container } = render(React.createElement(StepInterview));
    const h2s = container.querySelectorAll("h2");
    expect(h2s.length).toBe(1);
    expect(h2s[0].textContent?.trim()).toBe("چه مشکلی آزارت می‌دهد؟");
    expect(
      (container.textContent?.match(/راه‌حل ساده‌ات چیست؟/g) || []).length
    ).toBe(0);
  });

  it("replaces heading when substep changes", () => {
    wizardState.activeSubStep = 1;
    const { container, rerender } = render(React.createElement(StepInterview));
    wizardState.activeSubStep = 2;
    rerender(React.createElement(StepInterview));
    const h2s = container.querySelectorAll("h2");
    expect(h2s.length).toBe(1);
    expect(h2s[0].textContent?.trim()).toBe("راه‌حل ساده‌ات چیست؟");
    expect(
      (container.textContent?.match(/چه مشکلی آزارت می‌دهد؟/g) || []).length
    ).toBe(0);
  });
});
