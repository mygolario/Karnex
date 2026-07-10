import type { PitchDeckThemeId } from "./types";

export interface SlideThemeTokens {
  id: PitchDeckThemeId;
  label: string;
  bg: string;
  card: string;
  border: string;
  primary: string;
  secondary: string;
  text: string;
  muted: string;
  glow1: string;
  glow2: string;
  accentGradient: string;
  badgeBg: string;
  isDark: boolean;
}

/** Karnex v2 brand-aligned themes (pink #ec4899 / orange #f97316) */
export const SlideThemes: Record<string, SlideThemeTokens> = {
  karnex_light: {
    id: "karnex_light",
    label: "کارنکس روشن",
    bg: "#FFF7FB",
    card: "rgba(255, 255, 255, 0.85)",
    border: "rgba(236, 72, 153, 0.18)",
    primary: "#EC4899",
    secondary: "#F97316",
    text: "#1F1230",
    muted: "#6B5A72",
    glow1: "rgba(236, 72, 153, 0.12)",
    glow2: "rgba(249, 115, 22, 0.1)",
    accentGradient: "linear-gradient(to left, #EC4899, #F97316)",
    badgeBg: "rgba(236, 72, 153, 0.1)",
    isDark: false,
  },
  karnex_glass: {
    id: "karnex_glass",
    label: "شیشه‌ای کارنکس",
    bg: "#FDF2F8",
    card: "rgba(255, 255, 255, 0.55)",
    border: "rgba(236, 72, 153, 0.22)",
    primary: "#DB2777",
    secondary: "#EA580C",
    text: "#1F1230",
    muted: "#7A6478",
    glow1: "rgba(236, 72, 153, 0.18)",
    glow2: "rgba(249, 115, 22, 0.14)",
    accentGradient: "linear-gradient(135deg, #EC4899, #F97316)",
    badgeBg: "rgba(249, 115, 22, 0.12)",
    isDark: false,
  },
  karnex_stage: {
    id: "karnex_stage",
    label: "صحنه تاریک",
    bg: "#140A12",
    card: "rgba(36, 18, 32, 0.72)",
    border: "rgba(236, 72, 153, 0.22)",
    primary: "#F472B6",
    secondary: "#FB923C",
    text: "#FDF2F8",
    muted: "#C4B0BE",
    glow1: "rgba(236, 72, 153, 0.2)",
    glow2: "rgba(249, 115, 22, 0.12)",
    accentGradient: "linear-gradient(to left, #EC4899, #F97316)",
    badgeBg: "rgba(236, 72, 153, 0.15)",
    isDark: true,
  },
  karnex_minimal: {
    id: "karnex_minimal",
    label: "مینیمال",
    bg: "#FFFFFF",
    card: "#FAFAFA",
    border: "rgba(15, 15, 15, 0.08)",
    primary: "#EC4899",
    secondary: "#F97316",
    text: "#171717",
    muted: "#737373",
    glow1: "rgba(236, 72, 153, 0.06)",
    glow2: "rgba(249, 115, 22, 0.04)",
    accentGradient: "linear-gradient(to left, #EC4899, #F97316)",
    badgeBg: "rgba(236, 72, 153, 0.08)",
    isDark: false,
  },
};

/** Map legacy theme ids → Karnex themes */
export const LEGACY_THEME_MAP: Record<string, PitchDeckThemeId> = {
  midnight_cyan: "karnex_stage",
  amethyst_glow: "karnex_glass",
  sleek_slate: "karnex_minimal",
};

export const DEFAULT_THEME: PitchDeckThemeId = "karnex_light";

export function resolveTheme(themeId?: string | null): SlideThemeTokens {
  if (!themeId) return SlideThemes[DEFAULT_THEME];
  const mapped = LEGACY_THEME_MAP[themeId] || themeId;
  return SlideThemes[mapped] || SlideThemes[DEFAULT_THEME];
}

export const THEME_OPTIONS = [
  SlideThemes.karnex_light,
  SlideThemes.karnex_glass,
  SlideThemes.karnex_stage,
  SlideThemes.karnex_minimal,
];
