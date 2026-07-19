import type { PitchDeckSlide } from "@/lib/db";

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
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function getVisibleSlides(slides: PitchDeckSlide[]): PitchDeckSlide[] {
  return slides.filter((s) => !s.isHidden);
}

export function createEmptySlide(
  type: string = "generic",
  overrides: Partial<PitchDeckSlide> = {}
): PitchDeckSlide {
  return {
    id: `slide-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    title: "اسلاید جدید",
    bullets: ["نکته اول"],
    notes: "",
    isHidden: false,
    metadata: { theme: "karnex_pink" },
    ...overrides,
  };
}

export function createBlankDeck(projectName: string): PitchDeckSlide[] {
  return [
    createEmptySlide("title", {
      title: projectName || "عنوان پروژه",
      bullets: ["ارائه استارتاپ ما"],
    }),
  ];
}
