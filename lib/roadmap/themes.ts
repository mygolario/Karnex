/**
 * Roadmap Visual Themes
 * Each business type gets a distinct visual personality applied
 * across the timeline, step nodes, cards, and celebration overlays.
 */

export type RoadmapThemeKey = "startup" | "traditional" | "creator" | "default";

export interface RoadmapTheme {
  /** Primary accent color (hex) */
  primary: string;
  /** Secondary accent color (hex) */
  accent: string;
  /** Timeline gradient CSS classes */
  timelineGradient: string;
  /** Glow color for timeline (CSS color) */
  timelineGlow: string;
  /** Node style identifier */
  nodeStyle: "glow-orb" | "gold-medallion" | "colorful-pill";
  /** Card glass style class additions */
  cardGlass: string;
  /** Phase banner gradient */
  phaseBanner: string;
  /** Milestone celebration gradient */
  celebrationGradient: string;
  /** Persian rank titles by level */
  rankTitles: string[];
  /** Emoji for streaks */
  streakEmoji: string;
  /** Label for the "completed" milestone */
  completionLabel: string;
}

export const ROADMAP_THEMES: Record<RoadmapThemeKey, RoadmapTheme> = {
  startup: {
    primary: "#3b82f6",
    accent: "#8b5cf6",
    timelineGradient:
      "from-blue-500/30 via-violet-500/50 to-blue-500/30",
    timelineGlow: "rgba(139,92,246,0.4)",
    nodeStyle: "glow-orb",
    cardGlass:
      "bg-gradient-to-br from-slate-900/80 to-blue-950/60 backdrop-blur-xl border-blue-500/20 hover:border-blue-400/40",
    phaseBanner:
      "from-blue-600/10 via-violet-600/10 to-transparent border-blue-500/20",
    celebrationGradient:
      "from-blue-900 via-violet-900 to-slate-900",
    rankTitles: [
      "ایده‌پرداز",
      "سازنده",
      "بنیان‌گذار",
      "کارآفرین",
      "نوآور",
      "پیشگام",
      "استاد استارتاپ",
      "افسانه‌ای",
      "معمار رشد",
      "فاتح بازار",
      "رهبر تیم",
      "استراتژیست",
      "مقیاس‌دهنده",
      "نخبه کسب‌وکار",
      "غول استارتاپ",
      "اسطوره فناوری",
    ],
    streakEmoji: "⚡",
    completionLabel: "ماموریت کامل شد!",
  },
  traditional: {
    primary: "#d97706",
    accent: "#92400e",
    timelineGradient:
      "from-amber-500/30 via-orange-500/50 to-amber-500/30",
    timelineGlow: "rgba(217,119,6,0.4)",
    nodeStyle: "gold-medallion",
    cardGlass:
      "bg-gradient-to-br from-amber-50/80 to-orange-50/60 dark:from-amber-950/60 dark:to-orange-950/40 backdrop-blur-xl border-amber-500/20 hover:border-amber-400/50",
    phaseBanner:
      "from-amber-500/10 via-orange-500/10 to-transparent border-amber-500/20",
    celebrationGradient:
      "from-amber-900 via-orange-800 to-yellow-900",
    rankTitles: [
      "کارآموز",
      "تاجر نوپا",
      "بازرگان",
      "صاحب کسب",
      "استاد بازار",
      "بازرگان برجسته",
      "شاه تجارت",
      "افسانه بازار",
      "سرمایه‌گذار هوشمند",
      "مدیر عملیات",
      "رهبر بازار",
      "استراتژیست کسب‌وکار",
      "مقیاس‌دهنده",
      "نخبه بازار",
      "غول تجاری",
      "اسطوره کسب‌وکار",
    ],
    streakEmoji: "🔥",
    completionLabel: "کسب‌وکار شکل گرفت!",
  },
  creator: {
    primary: "#ec4899",
    accent: "#14b8a6",
    timelineGradient:
      "from-pink-500/30 via-teal-400/50 to-pink-500/30",
    timelineGlow: "rgba(236,72,153,0.4)",
    nodeStyle: "colorful-pill",
    cardGlass:
      "bg-gradient-to-br from-pink-50/80 to-teal-50/60 dark:from-pink-950/60 dark:to-teal-950/40 backdrop-blur-xl border-pink-500/20 hover:border-pink-400/50",
    phaseBanner:
      "from-pink-500/10 via-teal-500/10 to-transparent border-pink-500/20",
    celebrationGradient:
      "from-pink-900 via-teal-800 to-violet-900",
    rankTitles: [
      "محتواساز تازه‌کار",
      "سازنده محتوا",
      "اینفلوئنسر",
      "کریتور حرفه‌ای",
      "پادشاه محتوا",
      "برند شخصی",
      "مگا کریتور",
      "افسانه دیجیتال",
      "استراتژیست محتوا",
      "جامعه‌ساز",
      "کارآفرین خلاق",
      "رهبر رسانه",
      "مقیاس‌دهنده محتوا",
      "نخبه دیجیتال",
      "غول محتوا",
      "اسطوره خلاقیت",
    ],
    streakEmoji: "✨",
    completionLabel: "محتوا شما درخشید!",
  },
  default: {
    primary: "#6366f1",
    accent: "#8b5cf6",
    timelineGradient:
      "from-indigo-500/30 via-violet-500/50 to-indigo-500/30",
    timelineGlow: "rgba(99,102,241,0.4)",
    nodeStyle: "glow-orb",
    cardGlass:
      "bg-card backdrop-blur-xl border-border hover:border-primary/30",
    phaseBanner:
      "from-indigo-500/10 via-violet-500/10 to-transparent border-indigo-500/20",
    celebrationGradient:
      "from-indigo-900 via-violet-900 to-slate-900",
    rankTitles: [
      "تازه‌کار",
      "پیشرو",
      "کارشناس",
      "حرفه‌ای",
      "متخصص",
      "استاد",
      "نخبه",
      "افسانه‌ای",
      "معمار",
      "رهبر",
      "استراتژیست",
      "مقیاس‌دهنده",
      "نخبه برتر",
      "غول",
      "اسطوره",
      "قهرمان نهایی",
    ],
    streakEmoji: "🔥",
    completionLabel: "پروژه تکمیل شد!",
  },
};

export function getRoadmapTheme(projectType?: string): RoadmapTheme {
  if (projectType === "startup") return ROADMAP_THEMES.startup;
  if (projectType === "traditional") return ROADMAP_THEMES.traditional;
  if (projectType === "creator") return ROADMAP_THEMES.creator;
  return ROADMAP_THEMES.default;
}

export function getRankTitle(
  level: number,
  projectType?: string
): string {
  const theme = getRoadmapTheme(projectType);
  const idx = Math.min(level - 1, theme.rankTitles.length - 1);
  return theme.rankTitles[Math.max(idx, 0)];
}
