import type { PitchDeckReadiness, PitchDeckSlide, PitchDeckV2 } from "./types";
import { CORE_SLIDE_TYPES } from "./types";
import { getSlideBullets } from "./migrate";

function slideHasContent(slide: PitchDeckSlide): boolean {
  const bullets = getSlideBullets(slide);
  if (bullets.length >= 2) return true;
  const meta = slide.metadata || {};
  if (slide.type === "market" && (meta.tam || meta.sam || meta.som)) return true;
  if (slide.type === "team" && (meta.members?.length || meta.team?.length)) return true;
  if (slide.type === "ask" && meta.amount) return true;
  if (slide.type === "competition" && meta.competitors?.length) return true;
  if (slide.type === "roadmap" && meta.phases?.length) return true;
  if (slide.type === "business_model" && meta.models?.length) return true;
  return bullets.length > 0 && !!slide.title;
}

/** Gentle investor-readiness tips — never blocks export */
export function computeReadiness(deck: PitchDeckV2): PitchDeckReadiness {
  const tips: string[] = [];
  const visible = deck.slides.filter((s) => !s.isHidden);
  let score = 20;

  if (visible.length === 0) {
    return {
      score: 0,
      tips: ["هنوز اسلایدی ندارید. ویزارد داستان را شروع کنید تا پیچ‌دک ساخته شود."],
      updatedAt: new Date().toISOString(),
    };
  }

  // Core coverage
  const types = new Set(visible.map((s) => s.type === "generic" ? "closing" : s.type));
  const missingCore = CORE_SLIDE_TYPES.filter((t) => !types.has(t));
  score += Math.min(30, (CORE_SLIDE_TYPES.length - missingCore.length) * 3);
  if (missingCore.length > 0) {
    tips.push(`اسلایدهای اصلی ناقص: ${missingCore.slice(0, 3).join("، ")}. افزودنشان داستان سرمایه‌گذار را کامل‌تر می‌کند.`);
  }

  // Content density
  const filled = visible.filter(slideHasContent).length;
  score += Math.min(25, Math.round((filled / Math.max(visible.length, 1)) * 25));
  const weak = visible.filter((s) => !slideHasContent(s));
  if (weak.length > 0) {
    tips.push(`اسلاید «${weak[0].title || weak[0].type}» هنوز شواهد کافی ندارد — ۲–۳ نکته قوی اضافه کنید.`);
  }

  // Ask realism
  const ask = visible.find((s) => s.type === "ask");
  if (ask?.metadata?.amount) {
    score += 10;
  } else {
    tips.push("مبلغ درخواست سرمایه (Ask) را مشخص کنید تا سرمایه‌گذار بداند چه می‌خواهید.");
  }
  if (ask?.metadata?.runway) score += 5;
  else tips.push("مدت Runway را روی اسلاید Ask بنویسید تا واقع‌بینانه‌تر به نظر برسد.");

  // Traction / proof
  const traction = visible.find((s) => s.type === "traction");
  if (traction && slideHasContent(traction)) {
    score += 8;
  } else if (deck.meta.stage && deck.meta.stage !== "idea") {
    tips.push("برای مرحله فعلی‌تان، یک اسلاید Traction با متریک واقعی اضافه کنید.");
  }

  // Team
  const team = visible.find((s) => s.type === "team");
  const members = team?.metadata?.members || team?.metadata?.team;
  if (members && members.length >= 2) score += 5;
  else tips.push("اسلاید تیم را با نقش‌های مشخص تکمیل کنید — سرمایه‌گذار روی تیم شرط می‌بندد.");

  // Grounded claims
  const estimates = visible.flatMap((s) => (s.claims || []).filter((c) => c.status === "estimate"));
  if (estimates.length > 2) {
    tips.push("چند عدد به‌عنوان «تخمینی» علامت خورده‌اند — در صورت امکان با داده واقعی جایگزین کنید.");
  } else {
    score += 5;
  }

  // Meta personalization
  if (deck.meta.raiseSize || deck.meta.stage) score += 5;
  else tips.push("مرحله استارتاپ و اندازه جذب سرمایه را در تنظیمات داستان مشخص کنید.");

  score = Math.max(0, Math.min(100, score));

  if (tips.length === 0) {
    tips.push("داستان شما برای ارائه اولیه آماده به نظر می‌رسد. یک بار با صدای بلند تمرین کنید.");
  }

  return {
    score,
    tips: tips.slice(0, 5),
    updatedAt: new Date().toISOString(),
  };
}

export function perSlideTips(slide: PitchDeckSlide): string[] {
  const tips: string[] = [];
  const bullets = getSlideBullets(slide);

  if (!slide.title?.trim()) tips.push("عنوان اسلاید را کوتاه و واضح بنویسید.");
  if (bullets.length < 2) tips.push("حداقل دو نکته کلیدی برای این اسلاید بنویسید.");
  if (bullets.some((b) => b.length > 120)) tips.push("نکات خیلی طولانی‌اند — برای ارائه کوتاه‌ترشان کنید.");

  switch (slide.type) {
    case "problem":
      if (bullets.length > 0 && !bullets.some((b) => /مشتری|کاربر|بازار|درد|مشکل/.test(b))) {
        tips.push("مشکل را از زاویه مشتری بیان کنید، نه فقط محصول.");
      }
      break;
    case "market":
      if (!slide.metadata?.tam) tips.push("TAM را اضافه کنید — حتی اگر تخمینی باشد و برچسب بخورد.");
      break;
    case "ask":
      if (!slide.metadata?.amount) tips.push("مبلغ Ask را مشخص کنید.");
      if (!slide.metadata?.use && !slide.metadata?.budgetBreakdown) {
        tips.push("محل مصرف بودجه را شفاف کنید.");
      }
      break;
    case "traction":
      if (!slide.metadata?.metrics?.length && bullets.length < 2) {
        tips.push("یک متریک قابل اندازه‌گیری (کاربر، درآمد، رشد) اضافه کنید.");
      }
      break;
    default:
      break;
  }

  return tips.slice(0, 3);
}
