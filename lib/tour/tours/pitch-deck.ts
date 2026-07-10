import type { TourDefinition } from "../types";

export const pitchDeckTour: TourDefinition = {
  id: "pitch-deck",
  title: "تور پیچ‌دک",
  description: "داستان استارتاپ برای جذب سرمایه",
  accent: "fuchsia",
  route: "/dashboard/pitch-deck",
  helpCenterHref: "/dashboard/help",
  xpReward: 40,
  checklistItem: true,
  estimatedTime: "۲ دقیقه",
  projectTypes: ["startup"],
  personas: ["founder"],
  steps: [
    {
      id: "deck-welcome",
      target: "deck-header",
      title: "هاب پیچ‌دک کارنکس",
      description:
        "اینجا آمادگی سرمایه‌گذاری، ارائه، اشتراک و خروجی را یک‌جا می‌بینید. داستان شما با ویزارد و داده پروژه ساخته می‌شود.",
      route: "/dashboard/pitch-deck",
      mood: "welcome",
      position: "bottom",
    },
    {
      id: "deck-grid",
      target: "deck-grid",
      title: "استوری‌بورد روایت",
      description:
        "جریان داستان سرمایه‌گذار را ببینید، اسلاید ضعیف را پیدا کنید و با کلیک وارد استودیو شوید.",
      mood: "tip",
      position: "top",
    },
    {
      id: "add-slide",
      target: "add-slide-btn",
      title: "اسلایدهای اختیاری",
      description:
        "تراکشن، محصول، GTM، مالی و مصرف بودجه را در صورت نیاز اضافه کنید.",
      mood: "action",
      position: "left",
    },
    {
      id: "deck-actions",
      target: "deck-actions",
      title: "خروجی و مربی",
      description:
        "PPTX و PDF بگیرید، اسکریپت ارائه بسازید، یا با مربی سرمایه‌گذار اسلایدها را قوی‌تر کنید.",
      mood: "success",
      position: "bottom",
    },
  ],
};
