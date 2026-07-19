import type {
  CompetitorConfidence,
  CompetitorScope,
  CompetitorType,
  StudioMode,
} from "./types-ui";
import type { PitchDeckSlide } from "@/lib/db";
import { projectActiveCompetitors } from "@/lib/competitors/normalize";
import { toPersianDigits } from "@/lib/utils";

export { ANALYZE_COMPETITORS_CREDIT_COST } from "@/lib/competitors/types";

export const CONFIDENCE_LABEL: Record<CompetitorConfidence, string> = {
  high: "اعتماد بالا",
  medium: "اعتماد متوسط",
  low: "اعتماد پایین",
};

export const SCOPE_LABEL: Record<CompetitorScope, string> = {
  local: "محلی",
  national: "ملی",
  regional: "منطقه‌ای",
  global: "جهانی",
};

export const TYPE_LABEL: Record<CompetitorType, string> = {
  direct: "مستقیم",
  indirect: "غیرمستقیم",
  substitute: "جایگزین",
};

export const STUDIO_MODES: { id: StudioMode; label: string }[] = [
  { id: "hub", label: "مرکز فرمان" },
  { id: "roster", label: "فهرست" },
  { id: "compare", label: "مقایسه" },
  { id: "map", label: "نقشه" },
  { id: "matrices", label: "ماتریس" },
  { id: "battle", label: "کارت نبرد" },
  { id: "moves", label: "قدم‌ها" },
];

export function formatRelativeFa(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return toPersianDigits(
    d.toLocaleString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

export function syncPitchCompetitionSlides(
  pitchDeck: PitchDeckSlide[] | undefined,
  competitors: ReturnType<typeof projectActiveCompetitors>
): PitchDeckSlide[] | undefined {
  if (!pitchDeck?.length || competitors.length === 0) return pitchDeck;
  return pitchDeck.map((slide) => {
    if (slide.type !== "competition") return slide;
    return {
      ...slide,
      metadata: {
        ...(slide.metadata || {}),
        competitors: competitors.map((c) => ({
          name: c.name,
          strength: c.strength,
          weakness: c.weakness,
        })),
      },
    };
  });
}
