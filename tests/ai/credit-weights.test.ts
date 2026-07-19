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
});
