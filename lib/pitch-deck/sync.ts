import type { BusinessPlan, PitchDeckSlide } from "@/lib/db";

export interface SyncProposal {
  slideId: string;
  slideIndex: number;
  slideType: string;
  slideTitle: string;
  description: string;
  patch: Record<string, unknown>;
}

/** Build proposed metadata patches from project context without applying them. */
export function buildSyncProposals(
  slides: PitchDeckSlide[],
  project: BusinessPlan
): SyncProposal[] {
  const proposals: SyncProposal[] = [];

  slides.forEach((slide, index) => {
    switch (slide.type) {
      case "competition": {
        if (project.competitors && project.competitors.length > 0) {
          proposals.push({
            slideId: slide.id,
            slideIndex: index,
            slideType: slide.type,
            slideTitle: slide.title,
            description: `به‌روزرسانی ${project.competitors.length} رقیب از ماژول رقبا`,
            patch: {
              competitors: project.competitors.map((c) => ({
                name: c.name || "",
                strength: c.strength || "مزیت رقابتی",
                weakness: c.weakness || "شکاف بازار",
              })),
            },
          });
        }
        break;
      }
      case "roadmap": {
        if (project.roadmap && project.roadmap.length > 0) {
          proposals.push({
            slideId: slide.id,
            slideIndex: index,
            slideType: slide.type,
            slideTitle: slide.title,
            description: `همگام‌سازی ${project.roadmap.length} فاز از نقشه راه`,
            patch: {
              phases: project.roadmap.map((r, i) => ({
                phase: r.phase || `فاز ${i + 1}`,
                title: r.theme || "دستاورد فاز",
                date: r.weekNumber ? `هفته ${r.weekNumber}` : "زمان‌بندی",
              })),
            },
          });
        }
        break;
      }
      case "business_model": {
        if (project.leanCanvas?.revenueStream) {
          const streams =
            typeof project.leanCanvas.revenueStream === "string"
              ? project.leanCanvas.revenueStream.split("\n").filter(Boolean)
              : [];
          if (streams.length > 0) {
            proposals.push({
              slideId: slide.id,
              slideIndex: index,
              slideType: slide.type,
              slideTitle: slide.title,
              description: "جریان‌های درآمدی از بوم ناب",
              patch: {
                models: streams.map((s) => ({
                  title: s.replace(/^•\s*/, "").slice(0, 30),
                  desc: s.replace(/^•\s*/, ""),
                })),
              },
            });
          }
        }
        break;
      }
      case "market":
      case "market_size": {
        if (project.leanCanvas?.customerSegments) {
          const seg =
            typeof project.leanCanvas.customerSegments === "string"
              ? project.leanCanvas.customerSegments.slice(0, 100)
              : String(project.leanCanvas.customerSegments).slice(0, 100);
          proposals.push({
            slideId: slide.id,
            slideIndex: index,
            slideType: slide.type,
            slideTitle: slide.title,
            description: "توضیح SAM از بخش مشتریان بوم",
            patch: { samDesc: seg },
          });
        }
        break;
      }
      default:
        break;
    }
  });

  return proposals;
}

export function applySyncProposals(
  slides: PitchDeckSlide[],
  proposals: SyncProposal[],
  acceptedIds: Set<string>
): PitchDeckSlide[] {
  const bySlide = new Map<string, Record<string, unknown>>();
  for (const p of proposals) {
    if (!acceptedIds.has(p.slideId)) continue;
    bySlide.set(p.slideId, { ...(bySlide.get(p.slideId) || {}), ...p.patch });
  }

  return slides.map((slide) => {
    const patch = bySlide.get(slide.id);
    if (!patch) return slide;
    return {
      ...slide,
      metadata: { ...(slide.metadata || {}), ...patch },
    };
  });
}

export function getProjectContextSummary(project: BusinessPlan): {
  hasCanvas: boolean;
  hasCompetitors: boolean;
  hasRoadmap: boolean;
  labels: string[];
} {
  const hasCanvas = Boolean(
    project.leanCanvas &&
      Object.values(project.leanCanvas).some(
        (v) => typeof v === "string" && v.trim().length > 0
      )
  );
  const hasCompetitors = Boolean(project.competitors && project.competitors.length > 0);
  const hasRoadmap = Boolean(project.roadmap && project.roadmap.length > 0);
  const labels: string[] = [];
  if (hasCanvas) labels.push("بوم ناب");
  if (hasCompetitors) labels.push("رقبا");
  if (hasRoadmap) labels.push("نقشه راه");
  return { hasCanvas, hasCompetitors, hasRoadmap, labels };
}
