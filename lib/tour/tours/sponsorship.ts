import type { TourDefinition } from "../types";

export const sponsorshipTour: TourDefinition = {
  id: "sponsorship",
  title: "تور تعرفه اسپانسری",
  description: "محاسبه نرخ تبلیغات",
  accent: "rose",
  route: "/dashboard/sponsor-rates",
  helpCenterHref: "/dashboard/help",
  xpReward: 30,
  checklistItem: true,
  estimatedTime: "۳۰ ثانیه",
  projectTypes: ["creator"],
  personas: ["creator", "marketer"],
  steps: [
    {
      id: "sponsor-welcome",
      target: "sponsor-header",
      title: "تعرفه اسپانسری",
      description: "مدیریت و محاسبه نرخ تبلیغات و همکاری‌های شما.",
      route: "/dashboard/sponsor-rates",
      mood: "welcome",
      position: "bottom",
    },
    {
      id: "sponsor-calculator",
      target: "rate-calculator",
      title: "محاسبه‌گر نرخ",
      description: "بر اساس بازدید و تعامل، قیمت منصفانه تبلیغات خود را محاسبه کنید.",
      mood: "tip",
      position: "top",
    },
  ],
};
