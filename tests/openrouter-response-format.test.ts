import { describe, expect, it } from "vitest";
import { resolveResponseFormatForModel } from "@/lib/openrouter";

describe("resolveResponseFormatForModel", () => {
  it("strips json_object for Perplexity models", () => {
    expect(
      resolveResponseFormatForModel("perplexity/sonar-pro", { type: "json_object" })
    ).toBeUndefined();
    expect(
      resolveResponseFormatForModel("perplexity/sonar", { type: "json_object" })
    ).toBeUndefined();
  });

  it("keeps json_object for non-Perplexity models", () => {
    expect(
      resolveResponseFormatForModel("google/gemini-3.5-flash", { type: "json_object" })
    ).toEqual({ type: "json_object" });
  });

  it("passes through undefined", () => {
    expect(resolveResponseFormatForModel("perplexity/sonar-pro")).toBeUndefined();
  });
});
