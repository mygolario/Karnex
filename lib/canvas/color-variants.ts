import type { CardColor } from "./types";

export const CARD_COLOR_VARIANTS: Record<CardColor, {
  bg: string;
  border: string;
  text: string;
  darkBg: string;
  darkText: string;
  darkBorder: string;
  dot: string;
  gradient: string;
}> = {
  yellow: {
    bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-900",
    darkBg: "dark:bg-amber-950/40", darkText: "dark:text-amber-100", darkBorder: "dark:border-amber-700",
    dot: "bg-amber-400", gradient: "from-amber-50 to-amber-50/50",
  },
  blue: {
    bg: "bg-sky-50", border: "border-sky-300", text: "text-sky-900",
    darkBg: "dark:bg-sky-950/40", darkText: "dark:text-sky-100", darkBorder: "dark:border-sky-700",
    dot: "bg-sky-400", gradient: "from-sky-50 to-sky-50/50",
  },
  green: {
    bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-900",
    darkBg: "dark:bg-emerald-950/40", darkText: "dark:text-emerald-100", darkBorder: "dark:border-emerald-700",
    dot: "bg-emerald-400", gradient: "from-emerald-50 to-emerald-50/50",
  },
  pink: {
    bg: "bg-pink-50", border: "border-pink-300", text: "text-pink-900",
    darkBg: "dark:bg-pink-950/40", darkText: "dark:text-pink-100", darkBorder: "dark:border-pink-700",
    dot: "bg-pink-400", gradient: "from-pink-50 to-pink-50/50",
  },
  purple: {
    bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-900",
    darkBg: "dark:bg-purple-950/40", darkText: "dark:text-purple-100", darkBorder: "dark:border-purple-700",
    dot: "bg-purple-400", gradient: "from-purple-50 to-purple-50/50",
  },
  cyan: {
    bg: "bg-cyan-50", border: "border-cyan-300", text: "text-cyan-900",
    darkBg: "dark:bg-cyan-950/40", darkText: "dark:text-cyan-100", darkBorder: "dark:border-cyan-700",
    dot: "bg-cyan-400", gradient: "from-cyan-50 to-cyan-50/50",
  },
  red: {
    bg: "bg-red-50", border: "border-red-300", text: "text-red-900",
    darkBg: "dark:bg-red-950/40", darkText: "dark:text-red-100", darkBorder: "dark:border-red-700",
    dot: "bg-red-400", gradient: "from-red-50 to-red-50/50",
  },
  orange: {
    bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-900",
    darkBg: "dark:bg-orange-950/40", darkText: "dark:text-orange-100", darkBorder: "dark:border-orange-700",
    dot: "bg-orange-400", gradient: "from-orange-50 to-orange-50/50",
  },
  indigo: {
    bg: "bg-indigo-50", border: "border-indigo-300", text: "text-indigo-900",
    darkBg: "dark:bg-indigo-950/40", darkText: "dark:text-indigo-100", darkBorder: "dark:border-indigo-700",
    dot: "bg-indigo-400", gradient: "from-indigo-50 to-indigo-50/50",
  },
  rose: {
    bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-900",
    darkBg: "dark:bg-rose-950/40", darkText: "dark:text-rose-100", darkBorder: "dark:border-rose-700",
    dot: "bg-rose-400", gradient: "from-rose-50 to-rose-50/50",
  },
  violet: {
    bg: "bg-violet-50", border: "border-violet-300", text: "text-violet-900",
    darkBg: "dark:bg-violet-950/40", darkText: "dark:text-violet-100", darkBorder: "dark:border-violet-700",
    dot: "bg-violet-400", gradient: "from-violet-50 to-violet-50/50",
  },
  emerald: {
    bg: "bg-emerald-50", border: "border-emerald-300", text: "text-emerald-900",
    darkBg: "dark:bg-emerald-950/40", darkText: "dark:text-emerald-100", darkBorder: "dark:border-emerald-700",
    dot: "bg-emerald-400", gradient: "from-emerald-50 to-emerald-50/50",
  },
  amber: {
    bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-900",
    darkBg: "dark:bg-amber-950/40", darkText: "dark:text-amber-100", darkBorder: "dark:border-amber-700",
    dot: "bg-amber-400", gradient: "from-amber-50 to-amber-50/50",
  },
};

export const SECTION_COLOR_VARIANTS: Record<string, {
  gradient: string;
  border: string;
  iconBg: string;
  iconText: string;
  darkGradient: string;
  darkBorder: string;
}> = {
  blue: {
    gradient: "from-blue-50/80 to-blue-50/20", border: "border-blue-200/60",
    iconBg: "bg-blue-100 dark:bg-blue-500/20", iconText: "text-blue-600 dark:text-blue-400",
    darkGradient: "dark:from-blue-950/30 dark:to-blue-950/5", darkBorder: "dark:border-blue-800/30",
  },
  green: {
    gradient: "from-emerald-50/80 to-emerald-50/20", border: "border-emerald-200/60",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20", iconText: "text-emerald-600 dark:text-emerald-400",
    darkGradient: "dark:from-emerald-950/30 dark:to-emerald-950/5", darkBorder: "dark:border-emerald-800/30",
  },
  red: {
    gradient: "from-red-50/80 to-red-50/20", border: "border-red-200/60",
    iconBg: "bg-red-100 dark:bg-red-500/20", iconText: "text-red-600 dark:text-red-400",
    darkGradient: "dark:from-red-950/30 dark:to-red-950/5", darkBorder: "dark:border-red-800/30",
  },
  yellow: {
    gradient: "from-amber-50/80 to-amber-50/20", border: "border-amber-200/60",
    iconBg: "bg-amber-100 dark:bg-amber-500/20", iconText: "text-amber-600 dark:text-amber-400",
    darkGradient: "dark:from-amber-950/30 dark:to-amber-950/5", darkBorder: "dark:border-amber-800/30",
  },
  purple: {
    gradient: "from-purple-50/80 to-purple-50/20", border: "border-purple-200/60",
    iconBg: "bg-purple-100 dark:bg-purple-500/20", iconText: "text-purple-600 dark:text-purple-400",
    darkGradient: "dark:from-purple-950/30 dark:to-purple-950/5", darkBorder: "dark:border-purple-800/30",
  },
  pink: {
    gradient: "from-pink-50/80 to-pink-50/20", border: "border-pink-200/60",
    iconBg: "bg-pink-100 dark:bg-pink-500/20", iconText: "text-pink-600 dark:text-pink-400",
    darkGradient: "dark:from-pink-950/30 dark:to-pink-950/5", darkBorder: "dark:border-pink-800/30",
  },
  orange: {
    gradient: "from-orange-50/80 to-orange-50/20", border: "border-orange-200/60",
    iconBg: "bg-orange-100 dark:bg-orange-500/20", iconText: "text-orange-600 dark:text-orange-400",
    darkGradient: "dark:from-orange-950/30 dark:to-orange-950/5", darkBorder: "dark:border-orange-800/30",
  },
  cyan: {
    gradient: "from-cyan-50/80 to-cyan-50/20", border: "border-cyan-200/60",
    iconBg: "bg-cyan-100 dark:bg-cyan-500/20", iconText: "text-cyan-600 dark:text-cyan-400",
    darkGradient: "dark:from-cyan-950/30 dark:to-cyan-950/5", darkBorder: "dark:border-cyan-800/30",
  },
  indigo: {
    gradient: "from-indigo-50/80 to-indigo-50/20", border: "border-indigo-200/60",
    iconBg: "bg-indigo-100 dark:bg-indigo-500/20", iconText: "text-indigo-600 dark:text-indigo-400",
    darkGradient: "dark:from-indigo-950/30 dark:to-indigo-950/5", darkBorder: "dark:border-indigo-800/30",
  },
  rose: {
    gradient: "from-rose-50/80 to-rose-50/20", border: "border-rose-200/60",
    iconBg: "bg-rose-100 dark:bg-rose-500/20", iconText: "text-rose-600 dark:text-rose-400",
    darkGradient: "dark:from-rose-950/30 dark:to-rose-950/5", darkBorder: "dark:border-rose-800/30",
  },
  violet: {
    gradient: "from-violet-50/80 to-violet-50/20", border: "border-violet-200/60",
    iconBg: "bg-violet-100 dark:bg-violet-500/20", iconText: "text-violet-600 dark:text-violet-400",
    darkGradient: "dark:from-violet-950/30 dark:to-violet-950/5", darkBorder: "dark:border-violet-800/30",
  },
  emerald: {
    gradient: "from-emerald-50/80 to-emerald-50/20", border: "border-emerald-200/60",
    iconBg: "bg-emerald-100 dark:bg-emerald-500/20", iconText: "text-emerald-600 dark:text-emerald-400",
    darkGradient: "dark:from-emerald-950/30 dark:to-emerald-950/5", darkBorder: "dark:border-emerald-800/30",
  },
  amber: {
    gradient: "from-amber-50/80 to-amber-50/20", border: "border-amber-200/60",
    iconBg: "bg-amber-100 dark:bg-amber-500/20", iconText: "text-amber-600 dark:text-amber-400",
    darkGradient: "dark:from-amber-950/30 dark:to-amber-950/5", darkBorder: "dark:border-amber-800/30",
  },
};
