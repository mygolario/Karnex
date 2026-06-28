import type { ProjectType } from "@/lib/account/types";

export const STARTUP_GLOSSARY: Record<string, string> = {
  "North Star Metric":
    "یک متریک واحد که موفقیت محصول را نشان می‌دهد (مثلاً کاربر فعال هفتگی)",
  PMF: "Product-Market Fit — وقتی مشتریان واقعاً محصول را می‌خواهند",
  Runway: "مدت زمانی که با سرمایه فعلی می‌توانید ادامه دهید",
  CAC: "هزینه جذب هر مشتری",
  LTV: "ارزش کل یک مشتری در طول عمر",
  "TAM/SAM/SOM": "اندازه کل بازار / بازار قابل دسترس / سهم واقع‌بینانه",
};

export const TRADITIONAL_GLOSSARY: Record<string, string> = {
  پاخور: "تعداد افرادی که از جلوی مغازه عبور می‌کنند",
  "سر به سری": "نقطه‌ای که درآمد برابر هزینه‌های ثابت می‌شود",
  "اجاره به درآمد":
    "نسبت اجاره ماهانه به درآمد — بالای ۱۵٪ معمولاً پرریسک است",
  "Blue Ocean": "بازاری با رقابت کم و فرصت بالا",
  "Red Ocean": "بازار اشباع با رقابت شدید",
};

export const CREATOR_GLOSSARY: Record<string, string> = {
  Hook: "۳ ثانیه اول محتوا که مخاطب را نگه می‌دارد",
  CTA: "فراخوان به اقدام — مثل «لایک کن» یا «لینک در بیو»",
  "Engagement Rate": "نسبت تعامل (لایک+کامنت) به تعداد فالوور",
  Repurpose: "بازاستفاده از یک محتوا در پلتفرم‌های مختلف",
  "Rate Card": "جدول تعرفه همکاری تبلیغاتی",
};

export function getPillarGlossary(
  projectType: ProjectType | string
): Record<string, string> {
  switch (projectType) {
    case "traditional":
      return TRADITIONAL_GLOSSARY;
    case "creator":
      return CREATOR_GLOSSARY;
    default:
      return STARTUP_GLOSSARY;
  }
}

export function formatGlossaryBlock(glossary: Record<string, string>): string {
  return Object.entries(glossary)
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");
}
