/** Pitch Deck V2 types — investor-first fundraising deck */

export type PitchDeckThemeId =
  | "karnex_light"
  | "karnex_glass"
  | "karnex_stage"
  | "karnex_minimal"
  // Legacy aliases (migrated on load)
  | "midnight_cyan"
  | "amethyst_glow"
  | "sleek_slate";

export type PitchDeckArchetype =
  | "classic_seed"
  | "traction_led"
  | "marketplace"
  | "b2b_saas"
  | "deep_tech"
  | "social_impact";

export type PitchDeckStage = "idea" | "mvp" | "growth" | "scale";

export type PitchDeckAudience = "investor" | "accelerator" | "partner" | "internal";

export type SlideBlockType =
  | "headline"
  | "bullets"
  | "metric"
  | "chart"
  | "timeline"
  | "quote"
  | "image"
  | "text";

export type ClaimStatus = "grounded" | "user" | "estimate";

export type PitchDeckSlideType =
  | "title"
  | "problem"
  | "solution"
  | "market"
  | "business_model"
  | "competition"
  | "roadmap"
  | "team"
  | "ask"
  | "generic"
  | "closing"
  | "traction"
  | "product"
  | "gtm"
  | "financials"
  | "use_of_funds"
  | "vision"
  | "moat"
  | string;

export const CORE_SLIDE_TYPES: PitchDeckSlideType[] = [
  "title",
  "problem",
  "solution",
  "market",
  "business_model",
  "competition",
  "roadmap",
  "team",
  "ask",
  "closing",
];

export const OPTIONAL_SLIDE_TYPES: PitchDeckSlideType[] = [
  "traction",
  "product",
  "gtm",
  "financials",
  "use_of_funds",
  "vision",
  "moat",
];

export const SLIDE_INTENT: Record<string, string> = {
  title: "قلاب و معرفی",
  problem: "درد مشتری",
  solution: "راهکار",
  market: "اندازه فرصت",
  business_model: "مدل درآمد",
  competition: "مزیت رقابتی",
  roadmap: "مسیر اجرا",
  team: "تیم اجرا",
  ask: "درخواست سرمایه",
  closing: "جمع‌بندی",
  generic: "پیام تکمیلی",
  traction: "اثبات پیشرفت",
  product: "محصول / دمو",
  gtm: "ورود به بازار",
  financials: "اعداد مالی",
  use_of_funds: "مصرف بودجه",
  vision: "چشم‌انداز",
  moat: "موأت / دفاع‌پذیری",
};

export interface SlideBlock {
  id: string;
  type: SlideBlockType;
  content?: string;
  items?: string[];
  value?: string | number;
  label?: string;
  imageUrl?: string;
  chartData?: { label: string; value: number }[];
}

export interface SlideSource {
  field: string;
  path: string;
  syncedAt: string;
}

export interface SlideClaim {
  text: string;
  status: ClaimStatus;
}

export interface PitchDeckSlide {
  id: string;
  type: PitchDeckSlideType;
  title: string;
  /** Kept for AI/compat; prefer blocks when present */
  bullets: string[];
  intent?: string;
  notes?: string;
  isHidden?: boolean;
  theme?: PitchDeckThemeId | string;
  metadata?: Record<string, any>;
  blocks?: SlideBlock[];
  sources?: SlideSource[];
  claims?: SlideClaim[];
  /** Metadata keys the user edited — sync must not overwrite */
  userOverrides?: string[];
}

export interface PitchDeckMeta {
  archetype?: PitchDeckArchetype;
  stage?: PitchDeckStage;
  raiseSize?: string;
  sector?: string;
  voice?: string;
  audience?: PitchDeckAudience;
  tagline?: string;
}

export interface PitchDeckReadiness {
  score: number;
  tips: string[];
  updatedAt?: string;
}

export interface PitchDeckVersion {
  id: string;
  createdAt: string;
  label: string;
  slidesSnapshot: PitchDeckSlide[];
  metaSnapshot?: PitchDeckMeta;
}

export interface PitchDeckV2 {
  version: 2;
  meta: PitchDeckMeta;
  readiness?: PitchDeckReadiness;
  slides: PitchDeckSlide[];
  versions: PitchDeckVersion[];
  share?: { token: string; createdAt: string };
}

export type PitchDeckStored = PitchDeckV2 | PitchDeckSlide[];

export interface WizardAnswers {
  tagline?: string;
  problem?: string;
  solution?: string;
  market?: string;
  revenue?: string;
  team?: string;
  archetype?: PitchDeckArchetype;
  stage?: PitchDeckStage;
  raiseSize?: string;
  sector?: string;
  voice?: string;
  ask?: string;
  audience?: PitchDeckAudience;
}

export const MAX_VERSIONS = 20;
