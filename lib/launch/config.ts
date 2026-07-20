/**
 * Launch scope — single source of truth for what is visible at first official launch.
 * Startup-focused: other pillars soft-gated as "coming soon".
 *
 * Runtime overrides (admin): hydrate via hydrateLaunchOverrides / lib/launch/effective.ts
 */

import type { ProjectType } from "@/app/new-project/genesis-constants";

export const LAUNCH_CONFIG = {
  /** Official launch positioning */
  positioning: "کارنکس؛ هم‌بنیان‌گذار هوشمند برای استارتاپ‌های ایرانی",

  /** Genesis: only Startup is selectable; others show as coming soon */
  availablePillars: ["startup"] as const satisfies readonly ProjectType[],
  comingSoonPillars: ["traditional", "creator"] as const satisfies readonly ProjectType[],

  /**
   * Dashboard routes allowed in nav for each pillar at launch.
   * Routes not listed stay in codebase but are hidden from sidebar / mobile more.
   */
  navRoutes: {
    common: [
      "/dashboard/overview",
      "/dashboard/roadmap",
      "/dashboard/canvas",
      "/dashboard/copilot",
      "/dashboard/account",
      "/dashboard/help",
      "/dashboard/support",
    ],
    startup: [
      "/dashboard/pitch-deck",
      "/dashboard/validation",
      "/dashboard/competitors",
    ],
    /** Thin traditional surface — hide ops stubs (POS, loyalty, SMS, etc.) */
    traditional: [
      "/dashboard/competitors",
      "/dashboard/health",
      "/dashboard/finance",
      "/dashboard/expenses",
      "/dashboard/goals",
    ],
    /** Creator soft surface — no demo analytics */
    creator: [
      "/dashboard/content-calendar",
      "/dashboard/scripts",
      "/dashboard/sponsor-rates",
    ],
  },

  /** Marketing homepage: startup-only story */
  marketingStartupOnly: true,

  /** Roadmap UI: hide noisy modes for v1 */
  roadmap: {
    defaultView: "journey" as const,
    hideViews: ["gantt", "kanban", "analytics"] as const,
    hideGamification: true,
  },
} as const;

export type LaunchPillar = (typeof LAUNCH_CONFIG.availablePillars)[number];

export type LaunchOverrides = {
  availablePillars?: ProjectType[];
  comingSoonPillars?: ProjectType[];
  marketingStartupOnly?: boolean;
  hideGamification?: boolean;
};

export type EffectiveLaunchConfig = {
  availablePillars: ProjectType[];
  comingSoonPillars: ProjectType[];
  marketingStartupOnly: boolean;
  hideGamification: boolean;
  navRoutes: typeof LAUNCH_CONFIG.navRoutes;
  positioning: string;
  roadmap: {
    defaultView: "journey";
    hideViews: readonly string[];
    hideGamification: boolean;
  };
};

/** Client-side hydrate cache (set after fetching /api/launch-config). */
let clientOverrides: LaunchOverrides | null = null;

export function hydrateLaunchOverrides(overrides: LaunchOverrides | null) {
  clientOverrides = overrides;
}

export function getClientLaunchOverrides(): LaunchOverrides | null {
  return clientOverrides;
}

export function mergeLaunchConfig(
  overrides?: LaunchOverrides | null,
): EffectiveLaunchConfig {
  const o = overrides ?? {};
  const availablePillars = (o.availablePillars ??
    ([...LAUNCH_CONFIG.availablePillars] as ProjectType[])) as ProjectType[];
  const allPillars: ProjectType[] = ["startup", "traditional", "creator"];
  const comingSoonPillars =
    o.comingSoonPillars ??
    (allPillars.filter((p) => !availablePillars.includes(p)) as ProjectType[]);

  const hideGamification =
    o.hideGamification ?? LAUNCH_CONFIG.roadmap.hideGamification;

  return {
    availablePillars,
    comingSoonPillars,
    marketingStartupOnly:
      o.marketingStartupOnly ?? LAUNCH_CONFIG.marketingStartupOnly,
    hideGamification,
    navRoutes: LAUNCH_CONFIG.navRoutes,
    positioning: LAUNCH_CONFIG.positioning,
    roadmap: {
      defaultView: LAUNCH_CONFIG.roadmap.defaultView,
      hideViews: LAUNCH_CONFIG.roadmap.hideViews,
      hideGamification,
    },
  };
}

export function getLaunchConfigSync(): EffectiveLaunchConfig {
  return mergeLaunchConfig(clientOverrides);
}

export function isPillarAvailableAtLaunch(pillar: ProjectType): boolean {
  return getLaunchConfigSync().availablePillars.includes(pillar);
}

export function isPillarComingSoon(pillar: ProjectType): boolean {
  return getLaunchConfigSync().comingSoonPillars.includes(pillar);
}

export function isLaunchNavRoute(
  href: string,
  projectType: ProjectType | undefined,
): boolean {
  const config = getLaunchConfigSync();
  const common = config.navRoutes.common as readonly string[];
  if (common.some((r) => href === r || href.startsWith(r + "/"))) {
    return true;
  }

  const type = projectType ?? "startup";
  const typed = config.navRoutes[type] as readonly string[];
  return typed.some((r) => href === r || href.startsWith(r + "/"));
}
