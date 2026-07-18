import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  normalizeRoadmapOnly,
  normalizeRoadmapChunk1to8,
  normalizeRoadmapChunk9to16,
} from "@/lib/roadmap-normalize";

const RoadmapStepSchema = z.object({
  title: z.string().default("گام"),
  description: z.string().optional().default(""),
  estimatedHours: z.coerce.number().optional().default(0),
  priority: z.string().default("medium"),
  category: z.string().default("general"),
  status: z.string().default("todo"),
  checklist: z.array(z.string()).default([]),
  tips: z.array(z.string()).default([]),
  resources: z.array(z.string()).optional().default([]),
  dependsOn: z.array(z.string()).optional().default([]),
});

const RoadmapPhaseSchema = z.object({
  phase: z.string().default("فاز"),
  weekNumber: z.coerce.number().int().min(1).max(16),
  theme: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  steps: z.array(RoadmapStepSchema).default([]),
});

const RoadmapOnlySchema = z.object({
  roadmap: z
    .array(RoadmapPhaseSchema)
    .default([])
    .refine((r) => r.length === 16, {
      message: "نقشه راه باید دقیقاً ۱۶ فاز (هفته) داشته باشد",
    }),
});

const RoadmapChunkSchema = z.object({
  roadmap: z
    .array(RoadmapPhaseSchema)
    .default([])
    .refine((r) => r.length === 8, {
      message: "هر بخش نقشه راه باید دقیقاً ۸ فاز داشته باشد",
    }),
});

describe("normalizeRoadmapOnly", () => {
  it("coerces string weekNumbers and pads to 16", () => {
    const result = normalizeRoadmapOnly({
      roadmap: [
        {
          phase: "هفته ۱: شروع",
          weekNumber: "1",
          steps: [{ title: "گام اول", checklist: "تنها مورد" }],
        },
        {
          phase: "هفته ۳",
          weekNumber: 3,
          steps: [{ title: "گام معتبر" }, { title: "" }, null],
        },
      ],
    });

    expect(result.roadmap).toHaveLength(16);
    expect(result.roadmap[0].weekNumber).toBe(1);
    expect(result.roadmap[0].steps).toHaveLength(1);
    expect((result.roadmap[0].steps as any[])[0].checklist).toEqual(["تنها مورد"]);
    expect(result.roadmap[2].weekNumber).toBe(3);
    expect(result.roadmap[2].steps).toHaveLength(1);
    expect(result.roadmap[15].weekNumber).toBe(16);
  });

  it("slices down when more than 16 phases are returned", () => {
    const roadmap = Array.from({ length: 18 }, (_, i) => ({
      phase: `هفته ${i + 1}`,
      weekNumber: i + 1,
      steps: [{ title: `گام ${i + 1}` }],
    }));
    const result = normalizeRoadmapOnly({ roadmap });
    expect(result.roadmap).toHaveLength(16);
    expect(result.roadmap[0].weekNumber).toBe(1);
    expect(result.roadmap[15].weekNumber).toBe(16);
  });

  it("passes RoadmapOnlySchema after normalize", () => {
    const normalized = normalizeRoadmapOnly({
      roadmap: [
        { phase: "A", weekNumber: "2", steps: [{ title: "x", estimatedHours: "3" }] },
      ],
    });
    const parsed = RoadmapOnlySchema.safeParse(normalized);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.roadmap).toHaveLength(16);
      expect(parsed.data.roadmap[1].weekNumber).toBe(2);
    }
  });
});

describe("normalizeRoadmapChunk helpers", () => {
  it("normalizes weeks 1–8", () => {
    const result = normalizeRoadmapChunk1to8({
      roadmap: [
        { phase: "w1", weekNumber: "1", steps: [{ title: "a" }] },
        { phase: "w5", weekNumber: 5, steps: [] },
      ],
    });
    expect(result.roadmap).toHaveLength(8);
    expect(result.roadmap.map((p) => p.weekNumber)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    const parsed = RoadmapChunkSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("normalizes weeks 9–16", () => {
    const result = normalizeRoadmapChunk9to16({
      roadmap: [
        { phase: "w9", weekNumber: 9, steps: [{ title: "a" }] },
        { phase: "w12", weekNumber: "12", steps: [{ title: "b" }] },
      ],
    });
    expect(result.roadmap).toHaveLength(8);
    expect(result.roadmap.map((p) => p.weekNumber)).toEqual([
      9, 10, 11, 12, 13, 14, 15, 16,
    ]);
    const parsed = RoadmapChunkSchema.safeParse(result);
    expect(parsed.success).toBe(true);
  });

  it("merges two chunks into a valid 16-week roadmap", () => {
    const a = normalizeRoadmapChunk1to8({
      roadmap: [{ weekNumber: 1, phase: "1", steps: [{ title: "a" }] }],
    });
    const b = normalizeRoadmapChunk9to16({
      roadmap: [{ weekNumber: 9, phase: "9", steps: [{ title: "b" }] }],
    });
    const merged = normalizeRoadmapOnly({
      roadmap: [...a.roadmap, ...b.roadmap],
    });
    expect(merged.roadmap).toHaveLength(16);
    expect(RoadmapOnlySchema.safeParse(merged).success).toBe(true);
  });
});
