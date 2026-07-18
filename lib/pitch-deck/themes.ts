export type PitchThemeKey =
  | "karnex_pink"
  | "midnight_pro"
  | "clean_light"
  // Legacy aliases (existing decks)
  | "midnight_cyan"
  | "amethyst_glow"
  | "sleek_slate";

export interface PitchTheme {
  id: PitchThemeKey;
  label: string;
  bg: string;
  fg: string;
  muted: string;
  card: string;
  border: string;
  primary: string;
  secondary: string;
  glow1: string;
  glow2: string;
  accentGradient: string;
  badgeBg: string;
  isLight?: boolean;
  /** Hex without # for pptxgenjs */
  pptxBg: string;
  pptxPrimary: string;
  pptxFg: string;
  pptxMuted: string;
}

export const SlideThemes: Record<string, PitchTheme> = {
  karnex_pink: {
    id: "karnex_pink",
    label: "کارنکس پینک",
    bg: "#1a0612",
    fg: "#ffffff",
    muted: "#fbcfe8",
    card: "rgba(236, 72, 153, 0.08)",
    border: "rgba(236, 72, 153, 0.25)",
    primary: "#EC4899",
    secondary: "#FB923C",
    glow1: "rgba(236, 72, 153, 0.18)",
    glow2: "rgba(251, 146, 60, 0.12)",
    accentGradient: "linear-gradient(to right, #EC4899, #F97316, #FB923C)",
    badgeBg: "rgba(236, 72, 153, 0.15)",
    pptxBg: "1A0612",
    pptxPrimary: "EC4899",
    pptxFg: "FFFFFF",
    pptxMuted: "FBCFE8",
  },
  midnight_pro: {
    id: "midnight_pro",
    label: "میدنایت حرفه‌ای",
    bg: "#0B1220",
    fg: "#ffffff",
    muted: "#94A3B8",
    card: "rgba(15, 23, 42, 0.7)",
    border: "rgba(148, 163, 184, 0.2)",
    primary: "#F472B6",
    secondary: "#38BDF8",
    glow1: "rgba(244, 114, 182, 0.12)",
    glow2: "rgba(56, 189, 248, 0.08)",
    accentGradient: "linear-gradient(to right, #F472B6, #A78BFA, #38BDF8)",
    badgeBg: "rgba(244, 114, 182, 0.12)",
    pptxBg: "0B1220",
    pptxPrimary: "F472B6",
    pptxFg: "FFFFFF",
    pptxMuted: "94A3B8",
  },
  clean_light: {
    id: "clean_light",
    label: "لایت سرمایه‌گذار",
    bg: "#FAFAFA",
    fg: "#18181B",
    muted: "#71717A",
    card: "rgba(255, 255, 255, 0.9)",
    border: "rgba(236, 72, 153, 0.2)",
    primary: "#DB2777",
    secondary: "#EA580C",
    glow1: "rgba(236, 72, 153, 0.08)",
    glow2: "rgba(251, 146, 60, 0.06)",
    accentGradient: "linear-gradient(to right, #DB2777, #EA580C)",
    badgeBg: "rgba(219, 39, 119, 0.08)",
    isLight: true,
    pptxBg: "FAFAFA",
    pptxPrimary: "DB2777",
    pptxFg: "18181B",
    pptxMuted: "71717A",
  },
  // Legacy → map visuals close to new palette so old decks still render
  midnight_cyan: {
    id: "midnight_cyan",
    label: "Midnight Cyan (قدیمی)",
    bg: "#020617",
    fg: "#ffffff",
    muted: "#94A3B8",
    card: "rgba(15, 23, 42, 0.6)",
    border: "rgba(34, 211, 238, 0.15)",
    primary: "#22D3EE",
    secondary: "#60A5FA",
    glow1: "rgba(6, 182, 212, 0.12)",
    glow2: "rgba(109, 40, 217, 0.08)",
    accentGradient: "linear-gradient(to right, #22D3EE, #4F46E5, #D946EF)",
    badgeBg: "rgba(34, 211, 238, 0.1)",
    pptxBg: "020617",
    pptxPrimary: "22D3EE",
    pptxFg: "FFFFFF",
    pptxMuted: "94A3B8",
  },
  amethyst_glow: {
    id: "amethyst_glow",
    label: "Amethyst Glow (قدیمی)",
    bg: "#09090B",
    fg: "#ffffff",
    muted: "#A1A1AA",
    card: "rgba(24, 24, 27, 0.6)",
    border: "rgba(168, 85, 247, 0.15)",
    primary: "#C084FC",
    secondary: "#F472B6",
    glow1: "rgba(168, 85, 247, 0.15)",
    glow2: "rgba(236, 72, 153, 0.08)",
    accentGradient: "linear-gradient(to right, #A855F7, #EC4899, #F43F5E)",
    badgeBg: "rgba(192, 132, 252, 0.1)",
    pptxBg: "09090B",
    pptxPrimary: "C084FC",
    pptxFg: "FFFFFF",
    pptxMuted: "A1A1AA",
  },
  sleek_slate: {
    id: "sleek_slate",
    label: "Sleek Slate (قدیمی)",
    bg: "#0B0F10",
    fg: "#ffffff",
    muted: "#94A3B8",
    card: "rgba(30, 30, 30, 0.6)",
    border: "rgba(52, 211, 153, 0.15)",
    primary: "#34D399",
    secondary: "#94A3B8",
    glow1: "rgba(52, 211, 153, 0.08)",
    glow2: "rgba(148, 163, 184, 0.05)",
    accentGradient: "linear-gradient(to right, #34D399, #64748B, #CBD5E1)",
    badgeBg: "rgba(52, 211, 153, 0.1)",
    pptxBg: "0B0F10",
    pptxPrimary: "34D399",
    pptxFg: "FFFFFF",
    pptxMuted: "94A3B8",
  },
};

export const PRIMARY_THEME_KEYS: PitchThemeKey[] = [
  "karnex_pink",
  "midnight_pro",
  "clean_light",
];

export const DEFAULT_THEME_KEY: PitchThemeKey = "karnex_pink";

export function resolveTheme(key?: string): PitchTheme {
  if (key && SlideThemes[key]) return SlideThemes[key];
  return SlideThemes[DEFAULT_THEME_KEY];
}
