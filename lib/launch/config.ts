/**
 * Launch scope — single source of truth for what is visible at first official launch.
 * Startup-focused: other pillars soft-gated as "coming soon".
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

export function isPillarAvailableAtLaunch(pillar: ProjectType): boolean {
  return (LAUNCH_CONFIG.availablePillars as readonly string[]).includes(pillar);
}

export function isPillarComingSoon(pillar: ProjectType): boolean {
  return (LAUNCH_CONFIG.comingSoonPillars as readonly string[]).includes(pillar);
}

export function isLaunchNavRoute(
  href: string,
  projectType: ProjectType | undefined,
): boolean {
  const common = LAUNCH_CONFIG.navRoutes.common as readonly string[];
  if (common.some((r) => href === r || href.startsWith(r + "/"))) {
    return true;
  }

  const type = projectType ?? "startup";
  const typed = LAUNCH_CONFIG.navRoutes[type] as readonly string[];
  return typed.some((r) => href === r || href.startsWith(r + "/"));
}
