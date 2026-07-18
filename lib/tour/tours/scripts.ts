import type { TourDefinition } from "../types";

export const scriptsTour: TourDefinition = {
  id: "scripts",
  title: "تور اسکریپت‌نویسی",
  description: "نوشتن سناریو و متن تبلیغاتی",
  accent: "sky",
  route: "/dashboard/scripts",
  helpCenterHref: "/dashboard/help",
  xpReward: 30,
  checklistItem: true,
  estimatedTime: "۳۰ ثانیه",
  projectTypes: ["creator"],
  personas: ["creator"],
  steps: [
    {
      id: "scripts-welcome",
      target: "scripts-header",
      title: "مدیریت اسکریپت‌ها",
      description: "سناریوی ویدیوها و متون تبلیغاتی خود را اینجا بنویسید.",
      route: "/dashboard/scripts",
      mood: "welcome",
      position: "bottom",
    },
    {
      id: "new-script",
      target: "new-script-btn",
      title: "نوشتن اسکریپت جدید",
      description: "با کمک قالب‌های آماده یا دستیار کارنکس، متن‌های حرفه‌ای بنویسید.",
      mood: "action",
      position: "left",
    },
  ],
};
