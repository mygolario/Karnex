import type { TourDefinition } from "../types";
import { TOUR_VERSION } from "../version";

export const whatsNewTour: TourDefinition = {
  id: "whats-new",
  title: "تازه‌های کارنکس",
  description: "راهنمای کاملاً بازطراحی‌شده نسخه ۲",
  accent: "primary",
  route: "/dashboard/overview",
  xpReward: 25,
  version: TOUR_VERSION,
  estimatedTime: "۳۰ ثانیه",
  steps: [
    {
      id: "whats-new-welcome",
      target: "dashboard-root",
      title: "راهنمای کاملاً نو کارنکس!",
      description: "راهنمای تعاملی از صفر بازطراحی شد: شخصی‌سازی هوشمندتر، مرکز تورهای یکپارچه و ظاهری تازه در حالت روشن و تاریک.",
      type: "centered",
      mood: "celebrate",
      position: "bottom",
    },
    {
      id: "whats-new-hub",
      target: "help-button",
      title: "مرکز تورهای یکپارچه",
      description: "همه تورها با وضعیت پیشرفت، زمان تقریبی و پیشنهاد گام بعدی، یک‌جا در مرکز راهنما.",
      mood: "tip",
      position: "bottom",
    },
    {
      id: "whats-new-checklist",
      target: "setup-checklist",
      title: "چک‌لیست راه‌اندازی",
      description: "پیشرفت خود را دنبال کنید و با تکمیل هر بخش XP بگیرید.",
      mood: "tip",
      position: "top",
    },
    {
      id: "whats-new-launcher",
      target: "help-button",
      title: "مرکز تورها",
      description: "از دکمه راهنما می‌توانید هر تور را دوباره اجرا کنید.",
      mood: "success",
      position: "bottom",
    },
  ],
};
