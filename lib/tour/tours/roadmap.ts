import type { TourDefinition } from "../types";

export const roadmapTour: TourDefinition = {
  id: "roadmap",
  title: "تور نقشه راه",
  description: "مسیر گام‌به‌گام موفقیت پروژه",
  accent: "indigo",
  route: "/dashboard/roadmap",
  helpCenterHref: "/dashboard/help",
  xpReward: 40,
  checklistItem: true,
  estimatedTime: "۱ دقیقه",
  steps: [
    {
      id: "roadmap-welcome",
      target: "roadmap-header",
      title: "نقشه راه کسب‌وکار",
      description: "اینجا می‌توانید مسیر موفقیت پروژه خود را مرحله به مرحله ببینید.",
      route: "/dashboard/roadmap",
      mood: "welcome",
      position: "bottom",
    },
    {
      id: "roadmap-phases",
      target: "phases-container",
      title: "فازهای پروژه",
      description: "پروژه شما به فازهای مشخص تقسیم شده است که باید یکی‌یکی تکمیل شوند.",
      mood: "tip",
      position: "bottom",
    },
    {
      id: "roadmap-kanban",
      target: "roadmap-toolbar",
      title: "مدیریت تسک‌ها",
      description: "با تغییر نما می‌توانید تسک‌ها را در Kanban، لیست یا تقویم مدیریت کنید.",
      mood: "action",
      position: "bottom",
    },
  ],
};
