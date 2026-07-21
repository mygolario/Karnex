import { describe, expect, it } from "vitest";
import {
  DEEP_CONTEXT_IDS,
  DEEP_INTERVIEW_IDS,
  EXPRESS_CONTEXT_IDS,
  GENESIS_ASSIST_CAP,
  GENESIS_CORE_CREDITS,
  GENESIS_ROADMAP_CREDITS,
  resolveOptionLabel,
} from "@/lib/genesis/intake-constants";
import {
  buildIdeaFromAnswers,
  estimateGenesisCredits,
  formatGenesisAnswersForPrompt,
  labeledGenesisAnswers,
  resolveAudience,
  resolveBudget,
  resolveGeoSummary,
  scoreGenesisConfidence,
} from "@/lib/genesis/format";
import { GENESIS_PHASES } from "@/lib/genesis/types";
import {
  isPillarAvailableAtLaunch,
  isPillarComingSoon,
} from "@/lib/launch/config";
import { getAiCreditCost } from "@/lib/ai/credit-weights";

describe("genesis path contracts", () => {
  it("has welcome→…→build phases", () => {
    expect(GENESIS_PHASES).toEqual([
      "welcome",
      "pillar",
      "interview",
      "context",
      "brief",
      "build",
    ]);
  });

  it("deep path collects required intake fields", () => {
    expect(DEEP_INTERVIEW_IDS).toEqual([
      "industry",
      "problem",
      "audience_who",
      "solution",
    ]);
    expect(DEEP_CONTEXT_IDS).toEqual([
      "stage",
      "team",
      "goal",
      "budget",
      "geo",
      "tech_stack",
    ]);
  });

  it("express path is shorter: stage + audience context", () => {
    expect(EXPRESS_CONTEXT_IDS).toEqual(["stage", "audience_who"]);
    expect(DEEP_INTERVIEW_IDS.length).toBeGreaterThan(2);
  });
});

describe("genesis launch pillar gates", () => {
  it("startup available; traditional/creator coming soon", () => {
    expect(isPillarAvailableAtLaunch("startup")).toBe(true);
    expect(isPillarComingSoon("traditional")).toBe(true);
    expect(isPillarComingSoon("creator")).toBe(true);
    expect(isPillarAvailableAtLaunch("traditional")).toBe(false);
    expect(isPillarAvailableAtLaunch("creator")).toBe(false);
  });
});

describe("genesis credit math", () => {
  it("matches weighted costs for generate + assists", () => {
    expect(getAiCreditCost("generate-plan")).toBe(GENESIS_CORE_CREDITS);
    expect(getAiCreditCost("generate-roadmap")).toBe(1);
    expect(getAiCreditCost("genesis-draft")).toBe(1);
    expect(getAiCreditCost("genesis-coach")).toBe(1);
    expect(getAiCreditCost("genesis-brief-polish")).toBe(1);
    expect(getAiCreditCost("suggest-name")).toBe(1);

    const base = estimateGenesisCredits(0);
    expect(base.total).toBe(GENESIS_CORE_CREDITS + GENESIS_ROADMAP_CREDITS);
    expect(base.total).toBe(7);

    const withAssists = estimateGenesisCredits(GENESIS_ASSIST_CAP);
    expect(withAssists.total).toBe(7 + GENESIS_ASSIST_CAP);
    expect(GENESIS_ASSIST_CAP).toBe(3);
  });
});

describe("genesis generate payload richness", () => {
  it("builds audience/budget/geo and labeled prompt answers", () => {
    const answers = {
      industry: "health",
      problem: "نوبت پزشک خیلی دیر پیدا می‌شود",
      audience_who: "بیماران تهرانی",
      solution: "اپ رزرو نوبت سریع",
      stage: "idea",
      team: "solo",
      goal: "validate",
      budget: "low",
      geo: "city",
      geo_detail: "تهران",
      tech_stack: "nocode",
    };

    expect(resolveAudience(answers)).toBe("بیماران تهرانی");
    expect(resolveBudget(answers)).toBe(resolveOptionLabel("budget", "low"));
    expect(resolveGeoSummary(answers)).toContain("تهران");

    const labeled = labeledGenesisAnswers(answers);
    expect(labeled["حوزه"]).toBe("سلامت و پزشکی");
    expect(labeled["مرحله"]).toBe("فقط ایده");
    expect(formatGenesisAnswersForPrompt(answers)).toContain("مخاطب");

    const idea = buildIdeaFromAnswers(answers, "");
    expect(idea).toContain("مشکل");
    expect(idea).toContain("راه‌حل");

    const conf = scoreGenesisConfidence(answers, "", "نوبت‌یار");
    expect(conf.level).not.toBe("weak");
  });
});
