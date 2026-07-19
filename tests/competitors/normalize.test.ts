import { describe, expect, it } from "vitest";
import {
  acceptProposedCompetitors,
  createManualCompetitor,
  discoveryItemToIntel,
  emptyCompetitorIntel,
  ensureActionableMoves,
  hydrateCompetitorIntel,
  mergeDiscoveryIntoIntel,
  nextMovesFromStrings,
  projectActiveCompetitors,
} from "@/lib/competitors/normalize";
import type { CompetitorDiscoveryResult } from "@/lib/competitors/types";
import { getAiCreditCost } from "@/lib/ai/credit-weights";

describe("competitors normalize", () => {
  it("hydrates legacy nextMoves into actionableMoves", () => {
    const intel = hydrateCompetitorIntel({
      ...emptyCompetitorIntel(),
      nextMoves: ["گام یک", "گام دو"],
      actionableMoves: undefined,
    });
    expect(ensureActionableMoves(intel)).toHaveLength(2);
    expect(intel.actionableMoves?.[0].status).toBe("todo");
  });

  it("merges discovery without clobbering manual competitors", () => {
    const manual = createManualCompetitor({ name: "دستی‌کو" });
    const base = {
      ...emptyCompetitorIntel(),
      competitors: [manual],
    };
    const discovery: CompetitorDiscoveryResult = {
      competitors: [
        {
          name: "دستی‌کو",
          strength: "نباید جایگزین شود",
          weakness: "x",
          competitorType: "direct",
          threatScore: 5,
        },
        {
          name: "رقیب AI",
          strength: "قوی",
          weakness: "ضعیف",
          url: "https://example.com",
          citations: [{ url: "https://example.com", title: "site" }],
          competitorType: "indirect",
          threatScore: 3,
        },
      ],
      swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
      brief: "خلاصه",
      wedge: "wedge",
      nextMoves: ["قدم الف"],
    };

    const { intel, proposed } = mergeDiscoveryIntoIntel(base, discovery, {
      autoAccept: false,
      model: "perplexity/sonar-pro",
      discoveryOptions: { geography: "both", focus: "all", count: 6 },
    });

    expect(intel.competitors.find((c) => c.id === manual.id)?.strength).toBe("");
    expect(proposed.some((p) => p.name === "رقیب AI")).toBe(true);
    expect(intel.discoveryMeta?.model).toBe("perplexity/sonar-pro");
    expect(ensureActionableMoves(intel)[0].text).toBe("قدم الف");
  });

  it("auto-accepts new rivals and projects legacy list", () => {
    const discovery: CompetitorDiscoveryResult = {
      competitors: [
        {
          name: "GlobalCo",
          isIranian: false,
          scope: "global",
          strength: "s",
          weakness: "w",
          threatScore: 4,
        },
      ],
      swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
    };
    const { intel, updatedIds } = mergeDiscoveryIntoIntel(
      emptyCompetitorIntel(),
      discovery,
      { autoAccept: true }
    );
    expect(updatedIds).toHaveLength(1);
    expect(projectActiveCompetitors(intel)).toEqual([
      {
        name: "GlobalCo",
        strength: "s",
        weakness: "w",
        channel: "وب‌سایت",
        isIranian: false,
      },
    ]);
  });

  it("acceptProposedCompetitors reactivates dismissed match", () => {
    const item = discoveryItemToIntel({
      name: "X",
      strength: "a",
      weakness: "b",
    });
    item.status = "dismissed";
    const intel = {
      ...emptyCompetitorIntel(),
      competitors: [item],
    };
    const proposed = [{ ...item, strength: "updated", status: "dismissed" as const }];
    const next = acceptProposedCompetitors(intel, proposed);
    expect(next.competitors[0].status).toBe("active");
    expect(next.competitors[0].strength).toBe("updated");
  });

  it("nextMovesFromStrings creates todo items", () => {
    const moves = nextMovesFromStrings([" یک ", "", "دو"]);
    expect(moves).toHaveLength(2);
    expect(moves.every((m) => m.status === "todo")).toBe(true);
  });
});

describe("analyze-competitors credits", () => {
  it("charges heavy credits for Sonar Pro path", () => {
    expect(getAiCreditCost("analyze-competitors")).toBe(5);
  });
});
