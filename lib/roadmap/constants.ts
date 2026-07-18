export type StepStatus =
  | "todo"
  | "in-progress"
  | "blocked"
  | "done"
  | "skipped";

export type StepDisplayState =
  | "locked"
  | "available"
  | "current"
  | "in-progress"
  | "blocked"
  | "completed"
  | "skipped";

export type StepPriority = "high" | "medium" | "low";

export type RoadmapView = "journey" | "kanban" | "list" | "calendar" | "analytics" | "gantt";

export interface RoadmapFilter {
  status: StepStatus | "all";
  priority: string | "all";
  category: string | "all";
  search: string;
}

export interface StepRuntimeStatus {
  status: Exclude<StepStatus, "done">;
  startedAt?: string;
  completedAt?: string;
  blockedReason?: string;
  actualHours?: number;
}

export const STATUS_CONFIG: Record<
  StepStatus,
  {
    label: string;
    badgeClass: string;
    dotClass: string;
    cardBorderClass: string;
    cardBgClass: string;
    icon: string;
  }
> = {
  todo: {
    label: "در صف",
    badgeClass: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    dotClass: "bg-slate-400",
    cardBorderClass: "border-s-slate-300 dark:border-s-slate-600",
    cardBgClass: "bg-card",
    icon: "circle",
  },
  "in-progress": {
    label: "در حال انجام",
    badgeClass: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    dotClass: "bg-blue-500",
    cardBorderClass: "border-s-blue-500",
    cardBgClass: "bg-gradient-to-br from-card to-blue-500/5",
    icon: "loader",
  },
  blocked: {
    label: "مسدود",
    badgeClass: "bg-red-500/10 text-red-600 dark:text-red-400",
    dotClass: "bg-red-500",
    cardBorderClass: "border-s-red-500",
    cardBgClass: "bg-gradient-to-br from-card to-red-500/5",
    icon: "alert",
  },
  done: {
    label: "تکمیل شده",
    badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dotClass: "bg-emerald-500",
    cardBorderClass: "border-s-emerald-500",
    cardBgClass:
      "bg-gradient-to-br from-emerald-50 to-emerald-100/20 dark:from-emerald-950/20 dark:to-emerald-900/10",
    icon: "check",
  },
  skipped: {
    label: "رد شده",
    badgeClass: "bg-muted text-muted-foreground",
    dotClass: "bg-muted-foreground/40",
    cardBorderClass: "border-s-muted-foreground/30",
    cardBgClass: "bg-muted/30 opacity-60",
    icon: "skip",
  },
};

export const KANBAN_COLUMNS: StepStatus[] = [
  "todo",
  "in-progress",
  "blocked",
  "done",
];

export interface CategoryConfig {
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  product: {
    label: "محصول",
    color: "#8b5cf6",
    bgClass: "bg-violet-500/10",
    textClass: "text-violet-600 dark:text-violet-400",
    borderClass: "border-s-violet-500",
  },
  tech: {
    label: "فنی",
    color: "#3b82f6",
    bgClass: "bg-blue-500/10",
    textClass: "text-blue-600 dark:text-blue-400",
    borderClass: "border-s-blue-500",
  },
  marketing: {
    label: "بازاریابی",
    color: "#ec4899",
    bgClass: "bg-pink-500/10",
    textClass: "text-pink-600 dark:text-pink-400",
    borderClass: "border-s-pink-500",
  },
  legal: {
    label: "حقوقی",
    color: "#ef4444",
    bgClass: "bg-red-500/10",
    textClass: "text-red-600 dark:text-red-400",
    borderClass: "border-s-red-500",
  },
  design: {
    label: "طراحی",
    color: "#f59e0b",
    bgClass: "bg-amber-500/10",
    textClass: "text-amber-600 dark:text-amber-400",
    borderClass: "border-s-amber-500",
  },
  content: {
    label: "محتوا",
    color: "#14b8a6",
    bgClass: "bg-teal-500/10",
    textClass: "text-teal-600 dark:text-teal-400",
    borderClass: "border-s-teal-500",
  },
  sales: {
    label: "فروش",
    color: "#22c55e",
    bgClass: "bg-green-500/10",
    textClass: "text-green-600 dark:text-green-400",
    borderClass: "border-s-green-500",
  },
  finance: {
    label: "مالی",
    color: "#eab308",
    bgClass: "bg-yellow-500/10",
    textClass: "text-yellow-600 dark:text-yellow-400",
    borderClass: "border-s-yellow-500",
  },
  hr: {
    label: "منابع انسانی",
    color: "#a855f7",
    bgClass: "bg-purple-500/10",
    textClass: "text-purple-600 dark:text-purple-400",
    borderClass: "border-s-purple-500",
  },
  operations: {
    label: "عملیات",
    color: "#64748b",
    bgClass: "bg-slate-500/10",
    textClass: "text-slate-600 dark:text-slate-400",
    borderClass: "border-s-slate-500",
  },
  strategy: {
    label: "استراتژی",
    color: "#6366f1",
    bgClass: "bg-indigo-500/10",
    textClass: "text-indigo-600 dark:text-indigo-400",
    borderClass: "border-s-indigo-500",
  },
  startup: {
    label: "استارتاپ",
    color: "#06b6d4",
    bgClass: "bg-cyan-500/10",
    textClass: "text-cyan-600 dark:text-cyan-400",
    borderClass: "border-s-cyan-500",
  },
  growth: {
    label: "رشد",
    color: "#10b981",
    bgClass: "bg-emerald-500/10",
    textClass: "text-emerald-600 dark:text-emerald-400",
    borderClass: "border-s-emerald-500",
  },
  launch: {
    label: "راه‌اندازی",
    color: "#f97316",
    bgClass: "bg-orange-500/10",
    textClass: "text-orange-600 dark:text-orange-400",
    borderClass: "border-s-orange-500",
  },
};

export function getCategoryConfig(category?: string): CategoryConfig | null {
  if (!category) return null;
  const key = category.toLowerCase();
  return CATEGORY_CONFIG[key] || null;
}

export function getCategoryLabel(category?: string): string | null {
  return getCategoryConfig(category)?.label || category || null;
}

export const PRIORITY_CONFIG: Record<
  StepPriority,
  { label: string; badgeClass: string; icon: string }
> = {
  high: {
    label: "اولویت بالا",
    badgeClass: "bg-red-500/10 text-red-600 border-red-500/20",
    icon: "flame",
  },
  medium: {
    label: "اولویت متوسط",
    badgeClass: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    icon: "flag",
  },
  low: {
    label: "اولویت پایین",
    badgeClass: "bg-green-500/10 text-green-600 border-green-500/20",
    icon: "arrow-down",
  },
};

export function getPriorityLabel(priority?: string): string {
  if (!priority) return "بدون اولویت";
  return PRIORITY_CONFIG[priority as StepPriority]?.label || "بدون اولویت";
}

export function getPriorityConfig(priority?: string) {
  if (!priority) return null;
  return PRIORITY_CONFIG[priority as StepPriority] || null;
}

export const VIEW_LABELS: Record<RoadmapView, string> = {
  journey: "مسیر سفر",
  kanban: "تابلوی کارت",
  list: "لیست",
  calendar: "تقویم",
  analytics: "تحلیل",
  gantt: "گانت",
};
