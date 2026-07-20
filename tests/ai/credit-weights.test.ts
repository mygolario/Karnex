import { describe, expect, it } from "vitest";
import { getAiCreditCost } from "@/lib/ai/credit-weights";

describe("getAiCreditCost market research", () => {
  it("charges standard for generate-market-research", () => {
    expect(getAiCreditCost("generate-market-research")).toBe(2);
    expect(getAiCreditCost("market-research")).toBe(2);
  });

  it("charges deep_research for deep market research keys", () => {
    expect(getAiCreditCost("market-research-deep")).toBe(8);
    expect(getAiCreditCost("generate-market-research-deep")).toBe(8);
  });

  it("maps refine-text and enhance-bio to light", () => {
    expect(getAiCreditCost("refine-text")).toBe(1);
    expect(getAiCreditCost("enhance-bio")).toBe(1);
    expect(getAiCreditCost("generate-content-ideas")).toBe(1);
  });

  it("charges stt as light (1), not standard", () => {
    expect(getAiCreditCost("stt")).toBe(1);
  });

  it("maps previously unmapped dashboard actions to standard", () => {
    expect(getAiCreditCost("content-brief")).toBe(2);
    expect(getAiCreditCost("content-strategy")).toBe(2);
    expect(getAiCreditCost("generate-canvas-critique")).toBe(2);
    expect(getAiCreditCost("pitch-slide-ai")).toBe(2);
    expect(getAiCreditCost("health-diagnosis")).toBe(2);
    expect(getAiCreditCost("pnl-narrative")).toBe(2);
    expect(getAiCreditCost("monthly-review")).toBe(2);
  });
});
