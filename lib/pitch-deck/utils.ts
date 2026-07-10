import type { PitchDeckSlide, PitchDeckSlideType } from "./types";
import { OPTIONAL_SLIDE_TYPES, SLIDE_INTENT } from "./types";

export function convertPersianArabicDigits(val: unknown): string {
  if (typeof val === "symbol") return "";
  if (typeof val === "number") return String(val);
  if (!val) return "";
  const pMap = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const aMap = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  let str = String(val);
  for (let i = 0; i < 10; i++) {
    str = str
      .replace(new RegExp(pMap[i], "g"), String(i))
      .replace(new RegExp(aMap[i], "g"), String(i));
  }
  return str;
}

export function safeString(val: unknown): string {
  if (typeof val === "symbol") return "";
  if (val === null || val === undefined) return "";
  if (typeof val === "object") {
    try {
      return JSON.stringify(val);
    } catch {
      return "";
    }
  }
  return String(val);
}

export function parseNum(val: unknown): number {
  if (typeof val === "symbol") return 0;
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = convertPersianArabicDigits(val).replace(/,/g, "");
  const cleanStr = cleaned.replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleanStr);
  return isNaN(parsed) ? 0 : parsed;
}

export function createEmptySlide(type: PitchDeckSlideType = "generic"): PitchDeckSlide {
  return {
    id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    title: SLIDE_INTENT[type] || "اسلاید جدید",
    bullets: [],
    intent: SLIDE_INTENT[type] || "پیام تکمیلی",
    notes: "",
    isHidden: false,
    theme: "karnex_light",
    metadata: { theme: "karnex_light" },
    blocks: [],
    sources: [],
    claims: [],
    userOverrides: [],
  };
}

export const OPTIONAL_SLIDE_LABELS: Record<string, string> = {
  traction: "تراکشن / اثبات",
  product: "محصول / دمو",
  gtm: "ورود به بازار",
  financials: "مالی",
  use_of_funds: "مصرف بودجه",
  vision: "چشم‌انداز",
  moat: "موأت",
};

export function listAddableSlideTypes(existing: PitchDeckSlide[]): { type: PitchDeckSlideType; label: string }[] {
  const have = new Set(existing.map((s) => s.type));
  return OPTIONAL_SLIDE_TYPES.filter((t) => !have.has(t)).map((type) => ({
    type,
    label: OPTIONAL_SLIDE_LABELS[type] || String(type),
  }));
}

export function markEstimateClaims(slide: PitchDeckSlide, fields: string[]): PitchDeckSlide {
  const claims = [...(slide.claims || [])];
  for (const field of fields) {
    const val = slide.metadata?.[field];
    if (val && !claims.some((c) => c.text.includes(String(val)))) {
      claims.push({ text: `${field}: ${val}`, status: "estimate" });
    }
  }
  return { ...slide, claims };
}
