import type { TourDefinition } from "../types";

export const healthTour: TourDefinition = {
  id: "health",
  title: "تور سلامت کسب‌وکار",
  description: "امتیاز زنده کسب‌وکار سنتی",
  accent: "teal",
  route: "/dashboard/health",
  helpCenterHref: "/dashboard/help",
  xpReward: 35,
  checklistItem: true,
  estimatedTime: "۱ دقیقه",
  projectTypes: ["traditional"],
  steps: [
    {
      id: "health-welcome",
      target: "sidebar-nav",
      title: "سلامت کسب‌وکار",
      description: "اینجا امتیاز زنده کسب‌وکارت از مالی، موجودی، نقشه راه و مشتریان محاسبه می‌شود.",
      route: "/dashboard/health",
      mood: "welcome",
      position: "left",
    },
    {
      id: "health-score",
      target: "sidebar-nav",
      title: "امتیاز و رتبه",
      description: "رتبه S تا D و وضعیت (سالم / نیاز به توجه / بحرانی) را یک‌جا ببین.",
      mood: "tip",
      position: "left",
    },
  ],
};

export const financeTour: TourDefinition = {
  id: "finance",
  title: "تور سود و زیان",
  description: "ثبت درآمد و هزینه",
  accent: "amber",
  route: "/dashboard/finance",
  helpCenterHref: "/dashboard/help",
  xpReward: 35,
  checklistItem: true,
  estimatedTime: "۱ دقیقه",
  projectTypes: ["traditional"],
  steps: [
    {
      id: "finance-welcome",
      target: "sidebar-nav",
      title: "سود و زیان",
      description: "درآمد، هزینه و بهای تمام‌شده را ثبت کن تا حاشیه سود ماهانه محاسبه شود.",
      route: "/dashboard/finance",
      mood: "welcome",
      position: "left",
    },
  ],
};

export const inventoryTour: TourDefinition = {
  id: "inventory",
  title: "تور موجودی و انبار",
  description: "مدیریت کالا و هشدار کم‌موجودی",
  accent: "emerald",
  route: "/dashboard/inventory",
  helpCenterHref: "/dashboard/help",
  xpReward: 35,
  checklistItem: true,
  estimatedTime: "۱ دقیقه",
  projectTypes: ["traditional"],
  steps: [
    {
      id: "inventory-welcome",
      target: "sidebar-nav",
      title: "موجودی و انبار",
      description: "محصولات، موجودی و حد هشدار را مدیریت کن. ورود و خروج کالا را یک‌ضرب ثبت کن.",
      route: "/dashboard/inventory",
      mood: "welcome",
      position: "left",
    },
  ],
};
