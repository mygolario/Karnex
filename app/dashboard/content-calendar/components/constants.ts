import {
  Instagram, Youtube, Linkedin, Twitter, Music2, Send, Globe, Mic,
  Lightbulb, PenTool, Camera, Scissors, Clock, CheckCircle2
} from "lucide-react";

// ─────────────────────────────────────────
// Platform Config
// ─────────────────────────────────────────
export const PLATFORMS = [
  {
    id: "instagram" as const,
    label: "Instagram",
    Icon: Instagram,
    color: "text-pink-400",
    bg: "bg-pink-500/15",
    border: "border-pink-500/30",
    glow: "shadow-pink-500/20",
    chipClass: "bg-pink-500/20 border-pink-500/40 text-pink-300 hover:bg-pink-500/30",
    dot: "bg-pink-500",
    gradient: "from-pink-500/10 to-rose-500/5",
  },
  {
    id: "youtube" as const,
    label: "YouTube",
    Icon: Youtube,
    color: "text-red-400",
    bg: "bg-red-500/15",
    border: "border-red-500/30",
    glow: "shadow-red-500/20",
    chipClass: "bg-red-500/20 border-red-500/40 text-red-300 hover:bg-red-500/30",
    dot: "bg-red-500",
    gradient: "from-red-500/10 to-red-500/5",
  },
  {
    id: "linkedin" as const,
    label: "LinkedIn",
    Icon: Linkedin,
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    glow: "shadow-blue-500/20",
    chipClass: "bg-blue-500/20 border-blue-500/40 text-blue-300 hover:bg-blue-500/30",
    dot: "bg-blue-500",
    gradient: "from-blue-500/10 to-blue-500/5",
  },
  {
    id: "twitter" as const,
    label: "Twitter/X",
    Icon: Twitter,
    color: "text-sky-400",
    bg: "bg-sky-500/15",
    border: "border-sky-500/30",
    glow: "shadow-sky-500/20",
    chipClass: "bg-sky-500/20 border-sky-500/40 text-sky-300 hover:bg-sky-500/30",
    dot: "bg-sky-400",
    gradient: "from-sky-500/10 to-sky-500/5",
  },
  {
    id: "tiktok" as const,
    label: "TikTok",
    Icon: Music2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
    glow: "shadow-cyan-500/20",
    chipClass: "bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30",
    dot: "bg-cyan-400",
    gradient: "from-cyan-500/10 to-cyan-500/5",
  },
  {
    id: "telegram" as const,
    label: "Telegram",
    Icon: Send,
    color: "text-sky-300",
    bg: "bg-sky-400/15",
    border: "border-sky-400/30",
    glow: "shadow-sky-400/20",
    chipClass: "bg-sky-400/20 border-sky-400/40 text-sky-200 hover:bg-sky-400/30",
    dot: "bg-sky-300",
    gradient: "from-sky-400/10 to-sky-400/5",
  },
  {
    id: "blog" as const,
    label: "Blog",
    Icon: Globe,
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    glow: "shadow-orange-500/20",
    chipClass: "bg-orange-500/20 border-orange-500/40 text-orange-300 hover:bg-orange-500/30",
    dot: "bg-orange-500",
    gradient: "from-orange-500/10 to-orange-500/5",
  },
  {
    id: "podcast" as const,
    label: "Podcast",
    Icon: Mic,
    color: "text-violet-400",
    bg: "bg-violet-500/15",
    border: "border-violet-500/30",
    glow: "shadow-violet-500/20",
    chipClass: "bg-violet-500/20 border-violet-500/40 text-violet-300 hover:bg-violet-500/30",
    dot: "bg-violet-500",
    gradient: "from-violet-500/10 to-violet-500/5",
  },
];

export const PLATFORM_MAP = Object.fromEntries(PLATFORMS.map((p) => [p.id, p]));

// ─────────────────────────────────────────
// Content Types
// ─────────────────────────────────────────
export const CONTENT_TYPES = [
  { id: "post", label: "Post (عکس)" },
  { id: "reel", label: "Reel / ریلز" },
  { id: "story", label: "Story / استوری" },
  { id: "video", label: "ویدیوی بلند" },
  { id: "thread", label: "Thread / متن" },
  { id: "short", label: "Short / شورت" },
  { id: "episode", label: "اپیزود پادکست" },
  { id: "article", label: "مقاله / پست وبلاگ" },
];

// ─────────────────────────────────────────
// Status Config
// ─────────────────────────────────────────
export const STATUSES = [
  {
    id: "idea" as const,
    label: "ایده خام",
    Icon: Lightbulb,
    color: "text-slate-400",
    bg: "bg-slate-500/15",
    border: "border-slate-500/30",
    headerGradient: "from-slate-700/40 to-slate-800/40",
  },
  {
    id: "scripting" as const,
    label: "در حال نگارش",
    Icon: PenTool,
    color: "text-blue-400",
    bg: "bg-blue-500/15",
    border: "border-blue-500/30",
    headerGradient: "from-blue-900/40 to-blue-800/30",
  },
  {
    id: "filming" as const,
    label: "ضبط و تولید",
    Icon: Camera,
    color: "text-amber-400",
    bg: "bg-amber-500/15",
    border: "border-amber-500/30",
    headerGradient: "from-amber-900/40 to-amber-800/30",
  },
  {
    id: "editing" as const,
    label: "تدوین و طراحی",
    Icon: Scissors,
    color: "text-purple-400",
    bg: "bg-purple-500/15",
    border: "border-purple-500/30",
    headerGradient: "from-purple-900/40 to-purple-800/30",
  },
  {
    id: "scheduled" as const,
    label: "زمان‌بندی شده",
    Icon: Clock,
    color: "text-orange-400",
    bg: "bg-orange-500/15",
    border: "border-orange-500/30",
    headerGradient: "from-orange-900/40 to-orange-800/30",
  },
  {
    id: "published" as const,
    label: "منتشر شده",
    Icon: CheckCircle2,
    color: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/30",
    headerGradient: "from-emerald-900/40 to-emerald-800/30",
  },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.id, s]));

// ─────────────────────────────────────────
// Jalali Day Names
// ─────────────────────────────────────────
export const JALALI_DAY_NAMES = ["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"];
