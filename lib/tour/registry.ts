import type { TourDefinition, ChecklistItem, TourStep, TourStepContext } from "./types";
import { TOUR_REGISTRY } from "./tours";

export { TOUR_VERSION } from "./version";
export { TOUR_REGISTRY };

export const ACCENT_CLASSES: Record<string, { gradient: string; ring: string; text: string; bg: string }> = {
  primary: { gradient: "from-primary to-violet-600", ring: "ring-primary/50", text: "text-primary", bg: "bg-primary/10" },
  indigo: { gradient: "from-indigo-500 to-indigo-700", ring: "ring-indigo-500/50", text: "text-indigo-500", bg: "bg-indigo-500/10" },
  violet: { gradient: "from-violet-500 to-purple-700", ring: "ring-violet-500/50", text: "text-violet-500", bg: "bg-violet-500/10" },
  emerald: { gradient: "from-emerald-500 to-teal-600", ring: "ring-emerald-500/50", text: "text-emerald-500", bg: "bg-emerald-500/10" },
  amber: { gradient: "from-amber-500 to-orange-600", ring: "ring-amber-500/50", text: "text-amber-500", bg: "bg-amber-500/10" },
  sky: { gradient: "from-sky-500 to-blue-600", ring: "ring-sky-500/50", text: "text-sky-500", bg: "bg-sky-500/10" },
  rose: { gradient: "from-rose-500 to-pink-600", ring: "ring-rose-500/50", text: "text-rose-500", bg: "bg-rose-500/10" },
  fuchsia: { gradient: "from-fuchsia-500 to-purple-600", ring: "ring-fuchsia-500/50", text: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
  teal: { gradient: "from-teal-500 to-cyan-600", ring: "ring-teal-500/50", text: "text-teal-500", bg: "bg-teal-500/10" },
};

function filterSteps(steps: TourStep[], ctx: TourStepContext): TourStep[] {
  return steps.filter((step) => {
    if (step.showIf && !step.showIf(ctx)) return false;
    if (step.personas?.length && ctx.persona !== "general" && !step.personas.includes(ctx.persona)) {
      return false;
    }
    if (step.plans?.length && ctx.subscriptionPlan && !step.plans.includes(ctx.subscriptionPlan)) {
      return false;
    }
    if (step.roles?.length && (!ctx.role || !step.roles.includes(ctx.role))) {
      return false;
    }
    return true;
  });
}

export const CHECKLIST_ITEMS: ChecklistItem[] = Object.values(TOUR_REGISTRY)
  .filter((t) => t.checklistItem)
  .map((t, i) => ({
    id: `checklist-${t.id}`,
    tourId: t.id,
    title: t.title.replace("تور ", ""),
    description: t.description,
    xpReward: t.xpReward,
    order: i,
    personas: t.personas,
    projectTypes: t.projectTypes,
  }))
  .sort((a, b) => a.order - b.order);

export function getTour(tourId: string): TourDefinition | undefined {
  return TOUR_REGISTRY[tourId];
}

export function getAllTours(): TourDefinition[] {
  return Object.values(TOUR_REGISTRY);
}

export function getVisibleSteps(tourId: string, ctx: TourStepContext): TourStep[] {
  const tour = getTourWithDynamic(tourId);
  if (!tour) return [];
  if (
    tour.projectTypes?.length &&
    ctx.projectType &&
    !tour.projectTypes.includes(ctx.projectType as "startup" | "traditional" | "creator")
  ) {
    return [];
  }
  if (
    tour.personas?.length &&
    ctx.persona !== "general" &&
    !tour.personas.includes(ctx.persona)
  ) {
    return [];
  }
  return filterSteps(tour.steps, ctx);
}

export function getToursForProjectType(projectType?: string): TourDefinition[] {
  return getAllTours().filter((t) => {
    if (!t.projectTypes?.length) return true;
    if (!projectType) return true;
    return t.projectTypes.includes(projectType as "startup" | "traditional" | "creator");
  });
}

export function getNextRecommendedTour(
  completedTours: string[],
  projectType?: string
): TourDefinition | null {
  const available = getToursForProjectType(projectType).filter(
    (t) => t.id !== "whats-new" && !completedTours.includes(t.id)
  );
  const priority = ["dashboard", "roadmap", "canvas", "copilot"];
  for (const id of priority) {
    const found = available.find((t) => t.id === id);
    if (found) return found;
  }
  return available[0] ?? null;
}

/** Dynamic micro-tours registered at runtime */
const dynamicRegistry: Record<string, TourDefinition> = {};

export function registerTour(definition: TourDefinition) {
  dynamicRegistry[definition.id] = definition;
}

export function unregisterTour(tourId: string) {
  delete dynamicRegistry[tourId];
}

export function getTourWithDynamic(tourId: string): TourDefinition | undefined {
  return dynamicRegistry[tourId] ?? TOUR_REGISTRY[tourId];
}

export function getAllToursWithDynamic(): TourDefinition[] {
  const ids = new Set<string>();
  const result: TourDefinition[] = [];
  for (const t of [...Object.values(TOUR_REGISTRY), ...Object.values(dynamicRegistry)]) {
    if (!ids.has(t.id)) {
      ids.add(t.id);
      result.push(t);
    }
  }
  return result;
}
