import {
  Code,
  Globe,
  Zap,
  Lightbulb,
  Hammer,
  TrendingUp,
  User,
  Users,
  Building2,
  Wallet,
  PiggyBank,
  BadgeDollarSign,
  MapPin,
  Wifi,
  Flag,
  HeartPulse,
  ShoppingBag,
  GraduationCap,
  Utensils,
  Briefcase,
  Car,
  Home,
  Gamepad2,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { UNKNOWN_ANSWER, type GenesisAnswerKey } from "@/lib/genesis/types";

export interface GenesisOption {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
}

export interface GenesisFieldDef {
  id: GenesisAnswerKey;
  /** Deep-path interview/context order */
  question: string;
  helper: string;
  jargonTip?: string;
  /** text | choice | chips (multi-pick stored as single primary) */
  kind: "text" | "choice" | "chips";
  options?: GenesisOption[];
  placeholder?: string;
  minChars?: number;
  allowUnknown?: boolean;
  /** Express path includes this field */
  express?: boolean;
}

/** Industry chips for draft-from-sparks (beginner blank-page fix). */
export const INDUSTRY_CHIPS: GenesisOption[] = [
  { id: "health", label: "سلامت و پزشکی", icon: HeartPulse },
  { id: "shop", label: "فروش و فروشگاه", icon: ShoppingBag },
  { id: "edu", label: "آموزش", icon: GraduationCap },
  { id: "food", label: "غذا و رستوران", icon: Utensils },
  { id: "saas", label: "نرم‌افزار و سرویس", icon: Briefcase },
  { id: "mobility", label: "حمل‌ونقل", icon: Car },
  { id: "realestate", label: "ملک و مسکن", icon: Home },
  { id: "entertainment", label: "سرگرمی و محتوا", icon: Gamepad2 },
  { id: "other", label: "سایر / هنوز نمی‌دانم", icon: Sparkles },
];

export const PAIN_CHIPS: Record<string, string[]> = {
  health: ["نوبت‌دهی سخت", "پیگیری درمان", "هزینه نامشخص", "اطلاعات پراکنده"],
  shop: ["فروش کم", "موجودی نامنظم", "اعتماد مشتری", "ارسال کند"],
  edu: ["یادگیری پراکنده", "انگیزه کم", "محتوای ضعیف", "پیدا کردن معلم"],
  food: ["سفارش نامنظم", "هدررفت مواد", "رزرو میز", "کشف منو"],
  saas: ["کار دستی زیاد", "هماهنگی تیم", "پیگیری مشتری", "گزارش‌گیری سخت"],
  mobility: ["ترافیک", "هزینه سفر", "زمان‌بندی", "امنیت"],
  realestate: ["پیدا کردن ملک", "قیمت مبهم", "اسناد پیچیده", "اعتماد طرفین"],
  entertainment: ["کشف محتوا", "تعامل کم", "درآمد ناپایدار", "تولید وقت‌گیر"],
  other: ["وقت کم", "هزینه بالا", "اطلاعات ناقص", "اعتماد پایین"],
};

export const INTERVIEW_FIELDS: GenesisFieldDef[] = [
  {
    id: "industry",
    question: "ایده‌ات بیشتر به کدام حوزه نزدیک است؟",
    helper: "اگر دقیق نمی‌دانی، «سایر» را بزن — بعداً عوض می‌شود.",
    kind: "chips",
    options: INDUSTRY_CHIPS,
    allowUnknown: true,
    express: true,
  },
  {
    id: "problem",
    question: "چه مشکلی آزارت می‌دهد؟",
    helper: "با یک جمله ساده بگو؛ لازم نیست کامل باشد.",
    jargonTip: "مشکل = دردی که مشتری هر روز حس می‌کند.",
    kind: "text",
    placeholder: "مثلاً: پیدا کردن نوبت پزشک خیلی طول می‌کشد…",
    minChars: 8,
    allowUnknown: true,
    express: true,
  },
  {
    id: "audience_who",
    question: "این مشکل بیشتر مال کیست؟",
    helper: "مخاطب یعنی کسی که پول یا زمان می‌دهد تا مشکلش حل شود.",
    jargonTip: "مخاطب هدف = گروهی که محصول را برایشان می‌سازی.",
    kind: "text",
    placeholder: "مثلاً: مادران شاغل در تهران / صاحبان فروشگاه کوچک…",
    minChars: 5,
    allowUnknown: true,
    express: true,
  },
  {
    id: "solution",
    question: "راه‌حل ساده‌ات چیست؟",
    helper: "حتی اگر مبهم است بنویس؛ کارنکس کمکت می‌کند شفاف‌تر شود.",
    jargonTip: "راه‌حل = محصول یا خدمتی که مشکل را کم می‌کند.",
    kind: "text",
    placeholder: "مثلاً: اپی که نوبت پزشک را سریع رزرو می‌کند…",
    minChars: 8,
    allowUnknown: true,
    express: true,
  },
];

export const CONTEXT_FIELDS: GenesisFieldDef[] = [
  {
    id: "stage",
    question: "الان در چه مرحله‌ای هستی؟",
    helper: "صادق باش — نقشه راه بر اساس همین تنظیم می‌شود.",
    jargonTip: "MVP یعنی کوچک‌ترین نسخه قابل‌آزمایش محصول.",
    kind: "choice",
    express: true,
    options: [
      { id: "idea", label: "فقط ایده", hint: "هنوز چیزی نساخته‌ام", icon: Lightbulb },
      { id: "mvp", label: "دارم می‌سازم", hint: "نمونه اولیه / تست", icon: Hammer },
      { id: "growth", label: "فروش یا رشد", hint: "کاربر یا درآمد دارم", icon: TrendingUp },
    ],
  },
  {
    id: "team",
    question: "با چه تیمی پیش می‌روی؟",
    helper: "اندازه تیم روی سرعت نقشه راه اثر می‌گذارد.",
    kind: "choice",
    allowUnknown: true,
    options: [
      { id: "solo", label: "تنهایی", icon: User },
      { id: "small", label: "۲ تا ۳ نفر", icon: Users },
      { id: "team", label: "تیم بزرگ‌تر", icon: Building2 },
    ],
  },
  {
    id: "goal",
    question: "هدف نزدیک‌مدت چیست؟",
    helper: "این مشخص می‌کند نقشه راه بیشتر روی بقا باشد یا جذب سرمایه.",
    kind: "choice",
    allowUnknown: true,
    options: [
      { id: "bootstrap", label: "با سرمایه خودم جلو بروم", icon: PiggyBank },
      { id: "fundraising", label: "به‌دنبال سرمایه هستم", icon: BadgeDollarSign },
      { id: "validate", label: "اول ایده را بسنجم", icon: Lightbulb },
    ],
  },
  {
    id: "budget",
    question: "بودجه تقریبی شروع چقدر است؟",
    helper: "عدد دقیق لازم نیست؛ یک بازه کافی است.",
    kind: "choice",
    allowUnknown: true,
    options: [
      { id: "none", label: "تقریباً صفر", hint: "زمان بیشتر از پول", icon: Wallet },
      { id: "low", label: "زیر ۵۰ میلیون تومان", icon: Wallet },
      { id: "mid", label: "۵۰ تا ۲۰۰ میلیون", icon: Wallet },
      { id: "high", label: "بیش از ۲۰۰ میلیون", icon: Wallet },
    ],
  },
  {
    id: "geo",
    question: "بازارت کجاست؟",
    helper: "جغرافیا روی کانال‌ها و رقبا اثر دارد.",
    kind: "choice",
    allowUnknown: true,
    options: [
      { id: "online", label: "عمدتاً آنلاین / سراسر ایران", icon: Wifi },
      { id: "city", label: "یک شهر مشخص", icon: MapPin },
      { id: "iran", label: "چند شهر / ملی", icon: Flag },
    ],
  },
  {
    id: "tech_stack",
    question: "چطور می‌خواهی بسازی؟",
    helper: "اگر نمی‌دانی، «کم‌کد» معمولاً برای شروع امن‌تر است.",
    jargonTip: "No-Code یعنی ساخت با ابزار آماده، بدون کدنویسی سنگین.",
    kind: "choice",
    allowUnknown: true,
    options: [
      { id: "code", label: "کدنویسی اختصاصی", icon: Code },
      { id: "nocode", label: "کم‌کد / No-Code", icon: Zap },
      { id: "cms", label: "سیستم آماده (مثل وردپرس)", icon: Globe },
    ],
  },
];

/** Express: industry+problem merged screen handled in UI; these are the context subset. */
export const EXPRESS_CONTEXT_IDS: GenesisAnswerKey[] = ["stage", "audience_who"];

/** Deep interview field order */
export const DEEP_INTERVIEW_IDS: GenesisAnswerKey[] = [
  "industry",
  "problem",
  "audience_who",
  "solution",
];

/** Deep context field order */
export const DEEP_CONTEXT_IDS: GenesisAnswerKey[] = [
  "stage",
  "team",
  "goal",
  "budget",
  "geo",
  "tech_stack",
];

/** Human labels for prompt + storage */
export const ANSWER_KEY_LABELS: Record<string, string> = {
  industry: "حوزه",
  problem: "مشکل",
  audience_who: "مخاطب",
  solution: "راه‌حل",
  stage: "مرحله",
  team: "تیم",
  goal: "هدف",
  budget: "بودجه",
  geo: "بازار جغرافیایی",
  geo_detail: "شهر / جزئیات مکان",
  tech_stack: "نحوه ساخت",
  location_type: "نوع مکان",
  platform: "پلتفرم",
  unknown: "هنوز مشخص نیست",
};

const OPTION_LABEL_INDEX: Record<string, string> = (() => {
  const map: Record<string, string> = { [UNKNOWN_ANSWER]: "هنوز مشخص نیست" };
  for (const field of [...INTERVIEW_FIELDS, ...CONTEXT_FIELDS]) {
    for (const opt of field.options || []) {
      map[`${field.id}:${opt.id}`] = opt.label;
      map[opt.id] = opt.label;
    }
  }
  return map;
})();

export function resolveOptionLabel(fieldId: string, optionId: string): string {
  if (optionId === UNKNOWN_ANSWER) return "هنوز مشخص نیست";
  return (
    OPTION_LABEL_INDEX[`${fieldId}:${optionId}`] ||
    OPTION_LABEL_INDEX[optionId] ||
    optionId
  );
}

export function getFieldDef(id: string): GenesisFieldDef | undefined {
  return (
    INTERVIEW_FIELDS.find((f) => f.id === id) ||
    CONTEXT_FIELDS.find((f) => f.id === id)
  );
}

/** Max light AI assists per draft before generate (Free-friendly). */
export const GENESIS_ASSIST_CAP = 3;

/** Base generate cost: core heavy (5) + two roadmap chunks (1+1). */
export const GENESIS_CORE_CREDITS = 5;
export const GENESIS_ROADMAP_CREDITS = 2;
export const GENESIS_ASSIST_CREDIT = 1;
