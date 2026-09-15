import { describe, expect, it } from "vitest";
import { getAiCreditCost } from "@/lib/ai/credit-weights";
import { agentsForPillar, creditFeatureForAgent } from "@/lib/workforce/catalog";
import { fallbackExecution, fallbackNightShift, fallbackResearch } from "@/lib/workforce/fallback";
import { normalizeResearch } from "@/lib/workforce/normalize";
import { buildProjectSnapshot } from "@/lib/workforce/snapshot";
import { isLaunchNavRoute } from "@/lib/launch/config";

const samplePlan = {
  projectName: "فیت‌یار",
  tagline: "سلامت ارزان",
  projectType: "startup",
  audience: "کارمند دفتر",
  description: "وعده سالم",
  leanCanvas: {
    problem: "غذای ناسالم اداره",
    solution: "باکس ناهار",
    uniqueValue: "قیمت باورنکردنی",
  },
  completedSteps: ["تحقیق بازار"],
  roadmap: [
    {
      title: "هفته ۱",
      steps: ["تحقیق بازار", "لیست تأمین‌کننده", "صفحه اینستاگرام"],
    },
  ],
  competitorIntel: {
    brief: "بازار شلوغ است",
    competitors: [
      { name: "اسنپ‌فود", status: "active", strength: "توزیع", weakness: "گران", threatScore: 5 },
      { name: "رقیب حذف‌شده", status: "dismissed", strength: "x" },
    ],
  },
};

describe("workforce snapshot", () => {
  it("extracts next incomplete roadmap steps and active competitors", () => {
    const snap = buildProjectSnapshot(samplePlan);
    expect(snap.projectName).toBe("فیت‌یار");
    expect(snap.problem).toContain("ناسالم");
    expect(snap.nextSteps[0]).toBe("لیست تأمین‌کننده");
    expect(snap.completedCount).toBe(1);
    expect(snap.competitors.map((c) => c.name)).toEqual(["اسنپ‌فود"]);
  });
});

describe("workforce fallbacks", () => {
  it("research fallback asks to fill competitors when none exist", () => {
    const snap = buildProjectSnapshot({ projectName: "آزمایش", projectType: "startup" });
    const out = fallbackResearch(snap);
    expect(out.kind).toBe("research");
    expect(out.competitorMoves[0]?.name).toBe("شکاف داده");
    expect(out.recommendedActions.some((a) => a.href === "/dashboard/competitors")).toBe(true);
  });

  it("execution fallback turns next steps into timed missions", () => {
    const snap = buildProjectSnapshot(samplePlan);
    const out = fallbackExecution(snap);
    expect(out.missions.length).toBeGreaterThan(0);
    expect(out.missions[0].roadmapStep).toBe("لیست تأمین‌کننده");
    expect(out.missions[0].copyPaste?.body).toContain("فیت‌یار");
  });

  it("night shift packs research + execution + growth (+ capital for startup)", () => {
    const snap = buildProjectSnapshot(samplePlan);
    const out = fallbackNightShift(snap);
    expect(out.children.research?.kind).toBe("research");
    expect(out.children.execution?.kind).toBe("execution");
    expect(out.children.growth?.kind).toBe("growth");
    expect(out.children.capital?.kind).toBe("capital");
  });
});

describe("workforce normalize", () => {
  it("keeps fallback moves when AI omits competitorMoves", () => {
    const snap = buildProjectSnapshot(samplePlan);
    const fallback = fallbackResearch(snap);
    const normalized = normalizeResearch({ headline: "تیتر AI" }, fallback);
    expect(normalized.headline).toBe("تیتر AI");
    expect(normalized.competitorMoves.length).toBeGreaterThan(0);
  });
});

describe("workforce catalog", () => {
  it("hides capital agent for creator pillar", () => {
    expect(agentsForPillar("creator").some((a) => a.id === "capital")).toBe(false);
    expect(agentsForPillar("startup").some((a) => a.id === "capital")).toBe(true);
  });

  it("maps credit features", () => {
    expect(creditFeatureForAgent("research")).toBe("agent-research");
    expect(creditFeatureForAgent("night_shift")).toBe("agent-night-shift");
  });
});

describe("workforce credits and nav", () => {
  it("charges standard for single agents and heavy for night shift", () => {
    expect(getAiCreditCost("agent-research")).toBe(2);
    expect(getAiCreditCost("agent-execution")).toBe(2);
    expect(getAiCreditCost("agent-growth")).toBe(2);
    expect(getAiCreditCost("agent-capital")).toBe(2);
    expect(getAiCreditCost("agent-night-shift")).toBe(5);
  });

  it("exposes workforce in launch nav", () => {
    expect(isLaunchNavRoute("/dashboard/workforce", "startup")).toBe(true);
  });
});
