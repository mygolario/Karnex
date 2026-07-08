import type { TourDefinition } from "../types";

export const calendarTour: TourDefinition = {
  id: "calendar",
  title: "تور تقویم محتوا",
  description: "برنامه‌ریزی و انتشار محتوا",
  accent: "amber",
  route: "/dashboard/content-calendar",
  helpCenterHref: "/dashboard/help",
  xpReward: 35,
  checklistItem: true,
  estimatedTime: "۱ دقیقه",
  projectTypes: ["creator"],
  personas: ["creator", "marketer"],
  steps: [
    {
      id: "calendar-welcome",
      target: "calendar-header",
      title: "تقویم محتوا",
      description: "برنامه‌ریزی، تولید و انتشار محتوا را اینجا مدیریت کنید.",
      route: "/dashboard/content-calendar",
      mood: "welcome",
      position: "bottom",
    },
    {
      id: "calendar-view",
      target: "calendar-grid",
      title: "نمای تقویم",
      description: "رویدادهای خود را در نمای ماهانه ببینید و مدیریت کنید.",
      mood: "tip",
      position: "top",
    },
    {
      id: "calendar-ai",
      target: "ai-strategy-btn",
      title: "استراتژی هوشمند",
      description: "به کارنکس بگویید چه هدفی دارید تا برنامه محتوایی شما را بچیند.",
      mood: "action",
      position: "left",
    },
  ],
};
