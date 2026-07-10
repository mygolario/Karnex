import type { PitchDeckSlide, PitchDeckV2, SlideSource } from "./types";
import { getSlideBullets } from "./migrate";

type ProjectLike = Record<string, any>;

function now() {
  return new Date().toISOString();
}

function asList(val: unknown): string[] {
  if (Array.isArray(val)) return val.map((v) => String(v ?? "")).filter(Boolean);
  if (typeof val === "string" && val.trim()) {
    return val
      .split(/[\n،,]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function hasOverride(slide: PitchDeckSlide, field: string) {
  return (slide.userOverrides || []).includes(field);
}

function source(field: string, path: string): SlideSource {
  return { field, path, syncedAt: now() };
}

/**
 * Continuously sync project data into grounded slide fields.
 * Respects userOverrides — those fields are not overwritten.
 */
export function syncDeckFromProject(
  deck: PitchDeckV2,
  project: ProjectLike | null | undefined
): { deck: PitchDeckV2; changed: boolean; syncedFields: string[] } {
  if (!project) return { deck, changed: false, syncedFields: [] };

  const syncedFields: string[] = [];
  let changed = false;

  const slides = deck.slides.map((slide) => {
    const updated = { ...slide, metadata: { ...(slide.metadata || {}) } };
    const sources: SlideSource[] = [...(slide.sources || [])];

    const mark = (field: string, path: string) => {
      syncedFields.push(`${slide.type}.${field}`);
      const idx = sources.findIndex((s) => s.field === field);
      const entry = source(field, path);
      if (idx >= 0) sources[idx] = entry;
      else sources.push(entry);
      changed = true;
    };

    switch (slide.type) {
      case "title": {
        if (!hasOverride(slide, "title") && project.projectName) {
          if (updated.title !== project.projectName) {
            updated.title = project.projectName;
            mark("title", "projectName");
          }
        }
        if (!hasOverride(slide, "tagline")) {
          const tag = project.tagline || deck.meta.tagline;
          if (tag && (!updated.bullets?.[0] || updated.bullets[0] !== tag)) {
            updated.bullets = [tag, ...(updated.bullets || []).slice(1)];
            mark("tagline", "tagline");
          }
        }
        break;
      }
      case "problem": {
        if (!hasOverride(slide, "bullets")) {
          const problems = asList(project.leanCanvas?.problem);
          if (problems.length > 0) {
            updated.bullets = problems.slice(0, 5);
            mark("bullets", "leanCanvas.problem");
          }
        }
        break;
      }
      case "solution": {
        if (!hasOverride(slide, "bullets")) {
          const sols = asList(project.leanCanvas?.solution);
          if (sols.length > 0) {
            updated.bullets = sols.slice(0, 5);
            mark("bullets", "leanCanvas.solution");
          }
        }
        break;
      }
      case "market": {
        if (!hasOverride(slide, "samDesc")) {
          const segs = asList(project.leanCanvas?.customerSegments);
          if (segs.length > 0) {
            updated.metadata!.samDesc = segs.slice(0, 2).join("، ");
            mark("samDesc", "leanCanvas.customerSegments");
          }
        }
        // Market research if stored loosely on project
        const research = project.marketResearch || project.assistantData?.marketResearch;
        if (research && !hasOverride(slide, "tam")) {
          if (research.tam) {
            updated.metadata!.tam = research.tam;
            mark("tam", "marketResearch.tam");
          }
          if (research.sam) {
            updated.metadata!.sam = research.sam;
            mark("sam", "marketResearch.sam");
          }
          if (research.som) {
            updated.metadata!.som = research.som;
            mark("som", "marketResearch.som");
          }
        }
        if (!hasOverride(slide, "audience") && project.audience) {
          updated.metadata!.audience = project.audience;
          mark("audience", "audience");
        }
        break;
      }
      case "business_model": {
        if (!hasOverride(slide, "models")) {
          const streams = asList(project.leanCanvas?.revenueStream);
          if (streams.length > 0) {
            updated.metadata!.models = streams.slice(0, 3).map((s) => ({
              title: s,
              desc: "جریان درآمدی از بوم ناب",
            }));
            mark("models", "leanCanvas.revenueStream");
          }
        }
        break;
      }
      case "competition": {
        if (!hasOverride(slide, "competitors") && Array.isArray(project.competitors) && project.competitors.length > 0) {
          updated.metadata!.competitors = project.competitors.map((c: any) => ({
            name: c.name || "",
            strength: c.strength || "مزیت",
            weakness: c.weakness || "شکاف",
          }));
          mark("competitors", "competitors");
        }
        break;
      }
      case "roadmap": {
        if (!hasOverride(slide, "phases") && Array.isArray(project.roadmap) && project.roadmap.length > 0) {
          updated.metadata!.phases = project.roadmap.slice(0, 6).map((r: any, i: number) => ({
            phase: `فاز ${i + 1}`,
            title: r.title || r.name || `مرحله ${i + 1}`,
            date: r.timeline || r.date || "",
          }));
          mark("phases", "roadmap");
        }
        break;
      }
      case "ask":
      case "financials":
      case "use_of_funds": {
        const runway = project.financials?.runway;
        if (runway && !hasOverride(slide, "runway")) {
          if (runway.runwayMonths != null) {
            updated.metadata!.runway = `${runway.runwayMonths} ماه`;
            mark("runway", "financials.runway.runwayMonths");
          }
          if (runway.monthlyBurn != null && !hasOverride(slide, "burn")) {
            updated.metadata!.burn = String(runway.monthlyBurn);
            mark("burn", "financials.runway.monthlyBurn");
          }
        }
        if (project.budget && !hasOverride(slide, "amount") && slide.type === "ask") {
          if (!updated.metadata!.amount) {
            updated.metadata!.amount = project.budget;
            mark("amount", "budget");
          }
        }
        if (deck.meta.raiseSize && !hasOverride(slide, "amount") && slide.type === "ask") {
          updated.metadata!.amount = updated.metadata!.amount || deck.meta.raiseSize;
          mark("amount", "meta.raiseSize");
        }
        break;
      }
      case "gtm": {
        if (!hasOverride(slide, "bullets")) {
          const channels = asList(project.leanCanvas?.channels);
          const marketing = asList(project.marketingStrategy);
          const combined = [...channels, ...marketing].slice(0, 5);
          if (combined.length > 0) {
            updated.bullets = combined;
            mark("bullets", "leanCanvas.channels|marketingStrategy");
          }
        }
        break;
      }
      case "traction": {
        // Validation / growth leftovers if present on project JSON
        const validation = project.validation || project.ideaValidation;
        if (validation && !hasOverride(slide, "score")) {
          const score = validation.score ?? validation.overallScore;
          if (score != null) {
            updated.metadata!.validationScore = score;
            mark("score", "validation.score");
          }
        }
        const growth = project.growth || project.growthPlan;
        if (growth?.northStarMetric && !hasOverride(slide, "northStar")) {
          updated.metadata!.northStar = growth.northStarMetric;
          mark("northStar", "growth.northStarMetric");
        }
        break;
      }
      case "team": {
        // Keep user team; only seed if empty
        const members = updated.metadata?.members || updated.metadata?.team;
        if ((!members || members.length === 0) && !hasOverride(slide, "members")) {
          updated.metadata!.members = [{ name: "تیم موسس", role: "بنیان‌گذار" }];
          mark("members", "default");
        }
        break;
      }
      default:
        break;
    }

    // Keep bullets/blocks in sync when bullets changed
    if (changed) {
      const bullets = getSlideBullets(updated);
      updated.bullets = bullets;
      if (!updated.blocks?.length || updated.blocks.every((b) => b.type === "bullets")) {
        updated.blocks = [
          {
            id: `blk-sync-${slide.id}`,
            type: "bullets",
            items: bullets,
          },
        ];
      }
    }

    updated.sources = sources;
    return updated;
  });

  return {
    deck: { ...deck, slides },
    changed,
    syncedFields: [...new Set(syncedFields)],
  };
}

/** Build a fingerprint of sync-relevant project fields for change detection */
export function projectSyncFingerprint(project: ProjectLike | null | undefined): string {
  if (!project) return "";
  try {
    return JSON.stringify({
      name: project.projectName,
      tagline: project.tagline,
      audience: project.audience,
      budget: project.budget,
      lean: project.leanCanvas,
      competitors: project.competitors,
      roadmap: project.roadmap,
      financials: project.financials,
      marketing: project.marketingStrategy,
      validation: project.validation || project.ideaValidation,
      growth: project.growth || project.growthPlan,
      marketResearch: project.marketResearch,
    });
  } catch {
    return String(Date.now());
  }
}
