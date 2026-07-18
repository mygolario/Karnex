import type { PitchDeckSlide } from "@/lib/db";
import { getSlideTypeLabel } from "./labels";

export interface CompletenessItem {
  id: string;
  slideIndex: number;
  label: string;
  severity: "warn" | "error";
  message: string;
}

export function buildCompletenessChecklist(
  slides: PitchDeckSlide[]
): CompletenessItem[] {
  const items: CompletenessItem[] = [];

  slides.forEach((slide, index) => {
    if (slide.isHidden) return;
    const typeLabel = getSlideTypeLabel(slide.type);

    if (!slide.title?.trim()) {
      items.push({
        id: `${slide.id}-title`,
        slideIndex: index,
        label: typeLabel,
        severity: "error",
        message: "عنوان اسلاید خالی است",
      });
    }

    if ((slide.bullets?.length ?? 0) === 0 && !["title", "ask"].includes(slide.type)) {
      items.push({
        id: `${slide.id}-bullets`,
        slideIndex: index,
        label: typeLabel,
        severity: "warn",
        message: "نکته‌ای برای این اسلاید ثبت نشده",
      });
    }

    if (slide.type === "ask") {
      if (!slide.metadata?.amount) {
        items.push({
          id: `${slide.id}-ask-amount`,
          slideIndex: index,
          label: typeLabel,
          severity: "error",
          message: "مبلغ درخواست سرمایه مشخص نیست",
        });
      }
    }

    if (slide.type === "team") {
      const members = slide.metadata?.team || slide.metadata?.members || [];
      if (!Array.isArray(members) || members.length === 0) {
        items.push({
          id: `${slide.id}-team`,
          slideIndex: index,
          label: typeLabel,
          severity: "warn",
          message: "اعضای تیم تعریف نشده‌اند",
        });
      }
    }

    if (slide.type === "competition") {
      const comps = slide.metadata?.competitors || [];
      if (!Array.isArray(comps) || comps.length === 0) {
        items.push({
          id: `${slide.id}-comp`,
          slideIndex: index,
          label: typeLabel,
          severity: "warn",
          message: "رقبای کلیدی خالی است",
        });
      }
    }

    if (slide.type === "traction") {
      const metrics = slide.metadata?.metrics || [];
      if (!Array.isArray(metrics) || metrics.length === 0) {
        items.push({
          id: `${slide.id}-traction`,
          slideIndex: index,
          label: typeLabel,
          severity: "warn",
          message: "شاخص‌های تراکشن ثبت نشده",
        });
      }
    }

    if (slide.type === "market" || slide.type === "market_size") {
      if (!slide.metadata?.tam && !slide.metadata?.sam && !slide.metadata?.som) {
        items.push({
          id: `${slide.id}-market`,
          slideIndex: index,
          label: typeLabel,
          severity: "warn",
          message: "مقادیر TAM/SAM/SOM خالی است",
        });
      }
    }
  });

  const hasAsk = slides.some((s) => s.type === "ask" && !s.isHidden);
  if (!hasAsk && slides.length > 0) {
    items.push({
      id: "missing-ask",
      slideIndex: -1,
      label: "ساختار ارائه",
      severity: "warn",
      message: "اسلاید درخواست سرمایه وجود ندارد",
    });
  }

  return items;
}
