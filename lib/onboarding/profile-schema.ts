import { z } from "zod";

export const OnboardingProfileSchema = z.object({
  role: z.string().min(1).max(80),
  industry: z.string().min(1).max(80),
  businessStage: z.enum(["idea", "validation", "mvp", "launch", "growth"]),
  expertiseLevel: z.enum(["beginner", "intermediate", "expert"]),
  preferredTone: z.enum(["formal", "casual", "balanced"]),
  goals: z.array(z.string()).min(1).max(6),
  budgetBand: z.string().min(1).max(80),
  audienceSketch: z.string().min(3).max(500),
  locationScope: z.string().min(1).max(120),
});

export type OnboardingProfileInput = z.infer<typeof OnboardingProfileSchema>;

export const PROFILE_ROLE_OPTIONS = [
  { id: "founder", label: "بنیان‌گذار / کارآفرین" },
  { id: "creator", label: "تولیدکننده محتوا" },
  { id: "marketer", label: "بازاریاب / رشد" },
  { id: "consultant", label: "مشاور کسب‌وکار" },
  { id: "student", label: "دانشجو / یادگیرنده" },
  { id: "operator", label: "مدیر عملیات" },
];

export const PROFILE_INDUSTRY_OPTIONS = [
  "فناوری",
  "خرده‌فروشی",
  "خدمات",
  "تولید محتوا",
  "آموزش",
  "سلامت",
  "غذا و نوشیدنی",
  "املاک",
  "سایر",
];

export const PROFILE_STAGE_OPTIONS = [
  { id: "idea", label: "فقط ایده" },
  { id: "validation", label: "اعتبارسنجی" },
  { id: "mvp", label: "نمونه اولیه (MVP)" },
  { id: "launch", label: "راه‌اندازی" },
  { id: "growth", label: "رشد و مقیاس" },
];

export const PROFILE_GOAL_OPTIONS = [
  "جذب سرمایه",
  "افزایش درآمد",
  "ساخت MVP",
  "رشد مخاطب",
  "بهینه‌سازی عملیات",
  "ورود به بازار جدید",
  "برندسازی",
  "اتوماسیون",
];

export const BUDGET_BAND_OPTIONS = [
  { id: "under_10m", label: "زیر ۱۰ میلیون تومان" },
  { id: "10_50m", label: "۱۰ تا ۵۰ میلیون" },
  { id: "50_200m", label: "۵۰ تا ۲۰۰ میلیون" },
  { id: "200m_plus", label: "بالای ۲۰۰ میلیون" },
  { id: "unknown", label: "هنوز مشخص نیست" },
];

export const LOCATION_SCOPE_OPTIONS = [
  { id: "local", label: "محلی / شهری" },
  { id: "national", label: "سراسری (ایران)" },
  { id: "online", label: "آنلاین / بدون مرز" },
  { id: "hybrid", label: "ترکیبی" },
];

export function profileRoleToTourPersona(role: string): string {
  if (role === "founder" || role === "consultant" || role === "operator") return "founder";
  if (role === "creator") return "creator";
  if (role === "marketer") return "marketer";
  return "general";
}
