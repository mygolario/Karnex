export const SLIDE_TYPE_LABELS: Record<string, string> = {
  title: "عنوان",
  problem: "مشکل",
  solution: "راه‌حل",
  market: "بازار",
  market_size: "بازار",
  business_model: "مدل درآمدی",
  competition: "رقبا",
  traction: "تراکشن",
  roadmap: "نقشه راه",
  team: "تیم",
  ask: "درخواست سرمایه",
  generic: "عمومی",
};

export const SLIDE_TYPE_OPTIONS = [
  { value: "title", label: "عنوان" },
  { value: "problem", label: "بیان مشکل" },
  { value: "solution", label: "راه‌حل" },
  { value: "market", label: "اندازه بازار (TAM/SAM/SOM)" },
  { value: "business_model", label: "مدل درآمدی" },
  { value: "competition", label: "رقبا" },
  { value: "traction", label: "تراکشن و شاخص‌ها" },
  { value: "roadmap", label: "نقشه راه" },
  { value: "team", label: "تیم" },
  { value: "ask", label: "درخواست سرمایه" },
  { value: "generic", label: "اسلاید ساده" },
] as const;

export function getSlideTypeLabel(type: string): string {
  return SLIDE_TYPE_LABELS[type] || type;
}
