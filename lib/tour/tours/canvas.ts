import type { TourDefinition } from "../types";

export const canvasTour: TourDefinition = {
  id: "canvas",
  title: "تور بوم کسب‌وکار",
  description: "طراحی استراتژی در یک نگاه",
  accent: "violet",
  route: "/dashboard/canvas",
  helpCenterHref: "/dashboard/help",
  xpReward: 40,
  checklistItem: true,
  estimatedTime: "۱ دقیقه",
  steps: [
    {
      id: "canvas-welcome",
      target: "canvas-header",
      title: "بوم مدل کسب‌وکار",
      description: "قلب استراتژی بیزینس شما. تمام اجزای کلیدی را اینجا طراحی کنید.",
      route: "/dashboard/canvas",
      mood: "welcome",
      position: "bottom",
    },
    {
      id: "canvas-board",
      target: "canvas-board",
      title: "بلوک‌های بوم",
      description: "روی هر بلوک کلیک کنید تا جزئیات آن (مثل مشتریان یا ارزش پیشنهادی) را ویرایش کنید.",
      mood: "tip",
      position: "top",
    },
    {
      id: "canvas-ai",
      target: "ai-auto-fill",
      title: "راهنمای هوشمند",
      description: "با پاسخ به چند سوال ساده، دستیار کارنکس تمام بخش‌های بوم شما را به صورت حرفه‌ای تکمیل می‌کند.",
      type: "interactive",
      actionTarget: "ai-auto-fill",
      mood: "action",
      position: "bottom",
      proTip: "می‌توانید بعداً هم از این دکمه برای بازنویسی بخش‌ها استفاده کنید.",
    },
  ],
};
