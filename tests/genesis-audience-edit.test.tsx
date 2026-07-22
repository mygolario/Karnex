/** @vitest-environment jsdom */
import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, fireEvent } from "@testing-library/react";

const wizardState = {
  answers: {
    industry: "food",
    problem: "قیمت بالا",
    solution: "مغازه ارزان",
    stage: "idea",
    audience_who: "ggg",
  } as Record<string, string>,
  setAnswer: vi.fn(),
  setName: vi.fn(),
  setVision: vi.fn(),
  projectName: "",
  projectVision: "",
  confidence: { score: 54, level: "ok" as const, tips: [] as string[] },
  creditEstimate: { total: 7, core: 5, roadmap: 2, assistsUsed: 0 },
  consumeAssist: () => true,
  assistsRemaining: 3,
  advance: vi.fn(),
  retreat: vi.fn(),
  goToAnswerField: vi.fn(),
  goToStep: vi.fn(),
  activeSubStep: 1,
  nextSubStep: vi.fn(),
  prevSubStep: vi.fn(),
  contextFieldIds: ["stage", "audience_who"],
  pathMode: "express" as const,
};

vi.mock("@/components/features/new-project/genesis-wizard-context", () => ({
  useGenesisWizard: () => wizardState,
}));

vi.mock("@/lib/ai-actions", () => ({
  genesisPolishBriefAction: vi.fn(),
  suggestProjectNameAction: vi.fn(),
}));

describe("genesis audience typing + brief edit", () => {
  beforeEach(() => {
    wizardState.setAnswer.mockClear();
    wizardState.goToAnswerField.mockClear();
    wizardState.advance.mockClear();
    wizardState.answers = {
      industry: "food",
      problem: "قیمت بالا",
      solution: "مغازه ارزان",
      stage: "idea",
      audience_who: "ggg",
    };
    wizardState.contextFieldIds = ["stage", "audience_who"];
    wizardState.activeSubStep = 1;
  });

  it("keeps audience context field while typing (does not auto-advance)", async () => {
    const { StepContext } = await import(
      "@/components/features/new-project/step-context"
    );
    const { container } = render(React.createElement(StepContext));
    const textarea = container.querySelector("textarea");
    expect(textarea).toBeTruthy();
    fireEvent.change(textarea!, { target: { value: "مشتریان محلی" } });
    expect(wizardState.setAnswer).toHaveBeenCalledWith(
      "audience_who",
      "مشتریان محلی"
    );
    expect(wizardState.advance).not.toHaveBeenCalled();
    expect(container.textContent).toContain("این مشکل بیشتر مال کیست؟");
    expect(container.textContent).not.toContain("میز هم‌بنیان‌گذار");
  });

  it("allows inline edit of audience on brief confirmation", async () => {
    const { StepBrief } = await import(
      "@/components/features/new-project/step-brief"
    );
    const { container, getByDisplayValue } = render(
      React.createElement(StepBrief)
    );
    expect(container.textContent).toContain("مخاطب");
    const audienceInput = getByDisplayValue("ggg");
    fireEvent.change(audienceInput, {
      target: { value: "صاحبان رستوران" },
    });
    expect(wizardState.setAnswer).toHaveBeenCalledWith(
      "audience_who",
      "صاحبان رستوران"
    );
  });
});
