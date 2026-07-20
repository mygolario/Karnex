import { describe, it, expect } from "vitest";
import {
  normalizeEmail,
  hashEmail,
  mergeAiRequestMaps,
  extractAiRequests,
} from "@/lib/auth/email-ai-quota";

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Foo@Example.COM ")).toBe("foo@example.com");
  });
});

describe("hashEmail", () => {
  it("is stable for equivalent emails", () => {
    expect(hashEmail("User@Example.com")).toBe(hashEmail("  user@example.com "));
  });

  it("differs for different emails", () => {
    expect(hashEmail("a@example.com")).not.toBe(hashEmail("b@example.com"));
  });

  it("returns a 64-char hex sha256", () => {
    expect(hashEmail("test@example.com")).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("mergeAiRequestMaps", () => {
  it("takes per-month max, not sum", () => {
    expect(
      mergeAiRequestMaps(
        { "2026-07": 30, "2026-06": 5 },
        { "2026-07": 12, "2026-08": 3 },
      ),
    ).toEqual({
      "2026-07": 30,
      "2026-06": 5,
      "2026-08": 3,
    });
  });

  it("floors and clamps non-finite values", () => {
    expect(
      mergeAiRequestMaps({ "2026-07": 10.9 }, { "2026-07": Number.NaN }),
    ).toEqual({ "2026-07": 10 });
  });

  it("handles nullish inputs", () => {
    expect(mergeAiRequestMaps(null, undefined)).toEqual({});
    expect(mergeAiRequestMaps({ "2026-07": 4 }, null)).toEqual({
      "2026-07": 4,
    });
  });
});

describe("extractAiRequests", () => {
  it("reads aiRequests from credits JSON", () => {
    expect(
      extractAiRequests({
        aiTokens: 10,
        projectsUsed: 0,
        aiRequests: { "2026-07": 22 },
      }),
    ).toEqual({ "2026-07": 22 });
  });

  it("returns empty for missing or invalid credits", () => {
    expect(extractAiRequests(null)).toEqual({});
    expect(extractAiRequests({})).toEqual({});
    expect(extractAiRequests({ aiRequests: "nope" })).toEqual({});
  });
});

describe("credits seed shape", () => {
  it("merge result is valid seed aiRequests payload", () => {
    const aiRequests = mergeAiRequestMaps({}, { "2026-07": 40 });
    const seed = {
      aiTokens: 10,
      projectsUsed: 0,
      aiRequests,
    };
    expect(seed.aiRequests["2026-07"]).toBe(40);
    expect(seed.projectsUsed).toBe(0);
  });
});
