import { describe, it, expect } from "vitest";
import {
  IdeaValidationReportSchema,
  emptyValidationWorkspace,
  formatBriefForPrompt,
  hydrateValidationWorkspace,
  isBriefReady,
  preprocessValidationPayload,
  workspaceFromReport,
  type IdeaValidationReport,
} from "@/lib/validation/types";
import { getAiCreditCost } from "@/lib/ai/credit-weights";

describe("validation types", () => {
  it("accepts topWorry in brief formatting", () => {
    const text = formatBriefForPrompt({
      problem: "مشکل تست طولانی‌تر از هشت",
      whoSuffers: "مخاطب",
      currentSolution: "",
      unfairAdvantage: "",
      evidenceLevel: "talks",
      topWorry: "پرداخت نمی‌کنند",
    });
    expect(text).toContain("نگرانی اصلی");
    expect(text).toContain("پرداخت نمی‌کنند");
  });

  it("isBriefReady requires problem and whoSuffers", () => {
    expect(
      isBriefReady({
        problem: "کوتاه",
        whoSuffers: "ab",
        currentSolution: "",
        unfairAdvantage: "",
        evidenceLevel: "none",
      })
    ).toBe(false);
    expect(
      isBriefReady({
        problem: "مسئله‌ای واقعی و مشخص",
        whoSuffers: "فروشندگان",
        currentSolution: "",
        unfairAdvantage: "",
        evidenceLevel: "none",
      })
    ).toBe(true);
  });

  it("preprocessValidationPayload normalizes legacy score-only payloads", () => {
    const raw = preprocessValidationPayload({
      critique: { summary: "خلاصه", score: 62, strengths: ["a"], weaknesses: ["b"] },
      experiments: [{ title: "آزمایش ۱", steps: "گام" }],
      assumptions: [{ text: "فرض ۱", risk: "critical" }],
    });
    const parsed = IdeaValidationReportSchema.safeParse(raw);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.verdict).toBe("conditional_go");
      expect(parsed.data.overallScore).toBe(62);
      expect(parsed.data.experiments[0].id).toBe("exp-1");
      expect(parsed.data.assumptions[0].risk).toBe("critical");
    }
  });

  it("hydrateValidationWorkspace migrates legacy null workspace with report", () => {
    const report = IdeaValidationReportSchema.parse(
      preprocessValidationPayload({
        verdict: "go",
        overallScore: 80,
        critique: { summary: "خوب", strengths: [], weaknesses: [] },
        assumptions: [
          { id: "asm-1", text: "فرض", risk: "major", experimentId: "exp-1" },
        ],
        experiments: [
          {
            id: "exp-1",
            title: "لندینگ",
            steps: "بساز",
            metric: "۱۰ ثبت",
            isPrimary: true,
          },
        ],
      })
    ) as IdeaValidationReport;

    const ws = hydrateValidationWorkspace(null, report);
    expect(ws.journeyStage).toBe("snapshot");
    expect(ws.assumptionStatuses["asm-1"]).toBe("open");
    expect(ws.experiments.some((e) => e.experimentId === "exp-1")).toBe(true);
  });

  it("workspaceFromReport seeds assumption and experiment state", () => {
    const report = IdeaValidationReportSchema.parse(
      preprocessValidationPayload({
        verdict: "pivot",
        overallScore: 40,
        critique: { summary: "ضعیف", strengths: [], weaknesses: ["x"] },
        assumptions: [{ text: "فرض", risk: "critical" }],
        experiments: [{ title: "مصاحبه", isPrimary: true }],
        pivotOptions: [
          { title: "تغییر مخاطب", rationale: "بازار اشتباه", whatChanges: "B2B" },
        ],
      })
    );
    const ws = workspaceFromReport(report);
    expect(ws.journeyStage).toBe("snapshot");
    expect(Object.keys(ws.assumptionStatuses).length).toBe(1);
    expect(emptyValidationWorkspace().evidenceEntries).toEqual([]);
    expect(report.pivotOptions?.[0]?.title).toBe("تغییر مخاطب");
  });
});

describe("validation credit weights", () => {
  it("maps validate-idea to heavy (5)", () => {
    expect(getAiCreditCost("validate-idea")).toBe(5);
  });

  it("maps validate-idea-rescore to standard (2)", () => {
    expect(getAiCreditCost("validate-idea-rescore")).toBe(2);
  });

  it("maps validate-idea-script to light (1)", () => {
    expect(getAiCreditCost("validate-idea-script")).toBe(1);
  });
});
