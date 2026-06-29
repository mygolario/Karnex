import type { LocationAnalysis } from "@/lib/db";

const base = (partial: Partial<LocationAnalysis>): LocationAnalysis => ({
  city: "Tehran",
  address: "",
  score: 6.5,
  scoreReason: "",
  demographics: [],
  rentEstimate: "",
  successMatch: { label: "متوسط", color: "#888" },
  swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
  aiInsight: "",
  createdAt: new Date().toISOString(),
  ...partial,
});

export const DEMO_LOCATION_ANALYSES: Array<{
  id: string;
  label: string;
  analysis: LocationAnalysis;
}> = [
  {
    id: "tehran-cafe",
    label: "ولنجک تهران — کافه تخصصی",
    analysis: base({
      city: "Tehran",
      address: "ولنجک، خیابان فرشته",
      businessDescription: "کافه تخصصی قهوه با فضای کار",
      score: 7.2,
      scoreReason: "محله با قدرت خرید بالا و ترافیک پیاده مناسب کافه.",
      verdict: {
        decision: "go",
        headline: "موقعیت برای کافه تخصصی با قیمت متوسط تا بالا مناسب است.",
        confidence: 78,
      },
      verdictDetails: {
        dealBreakers: [],
        topReasons: [
          "ترافیک پیاده بالا در ساعات عصر",
          "رقابت متعادل بدون اشباع",
          "هم‌خوانی با مخاطب ۲۵-۴۰ سال",
        ],
      },
      executiveSummary: {
        narrative:
          "ولنجک یکی از محله‌های با قدرت خرید بالا در شمال تهران است. برای کافه تخصصی با تمرکز بر فضای کار، ترکیب پاخور عصرگاهی و مشتری مقصدی مناسب است. اجاره بالاتر از میانگین است اما با میانگین فاکتور ۲۵۰-۳۵۰ هزار تومان قابل توجیه است.",
        evidenceLinks: [
          { tab: "financial", label: "تحلیل مالی" },
          { tab: "map", label: "رقبا روی نقشه" },
        ],
      },
      metrics: {
        footfallIndex: "High",
        spendPower: "High",
        riskRewardRatio: 1.4,
        competitionDensity: "Medium",
      },
      coordinates: { lat: 35.8044, lon: 51.4247 },
    }),
  },
  {
    id: "shiraz-pharmacy",
    label: "شیراز — داروخانه",
    analysis: base({
      city: "Shiraz",
      address: "بلوار چمران",
      businessDescription: "داروخانه شبانه‌روزی",
      score: 5.8,
      scoreReason: "دسترسی خوب اما رقابت دارویی در شعاع ۵۰۰m بالاست.",
      verdict: {
        decision: "caution",
        headline: "قابل اجرا با شرط تمایز در خدمات شبانه‌روزی.",
        confidence: 72,
      },
      verdictDetails: {
        dealBreakers: ["۳ داروخانه در شعاع ۴۰۰m"],
        topReasons: ["ترافیک خودرو بالا", "نزدیکی بیمارستان"],
      },
      coordinates: { lat: 29.5918, lon: 52.5837 },
    }),
  },
  {
    id: "isfahan-clothing",
    label: "اصفهان — پوشاک",
    analysis: base({
      city: "Isfahan",
      address: "خیابان چهارباغ",
      businessDescription: "فروشگاه پوشاک زنانه میان‌رده",
      score: 6.1,
      verdict: {
        decision: "caution",
        headline: "منطقه تجاری قوی اما اجاره و رقابت بالا.",
        confidence: 70,
      },
      coordinates: { lat: 32.6546, lon: 51.668 },
    }),
  },
];

export function getDemoAnalysis(id: string): LocationAnalysis | undefined {
  return DEMO_LOCATION_ANALYSES.find((d) => d.id === id)?.analysis;
}
