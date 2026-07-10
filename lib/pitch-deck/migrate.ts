import type {
  PitchDeckSlide,
  PitchDeckStored,
  PitchDeckV2,
  PitchDeckMeta,
  SlideBlock,
  WizardAnswers,
} from "./types";
import { SLIDE_INTENT, MAX_VERSIONS } from "./types";
import { DEFAULT_THEME, LEGACY_THEME_MAP } from "./themes";

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function bulletsToBlocks(bullets: string[]): SlideBlock[] {
  const items = (bullets || []).filter(Boolean);
  if (items.length === 0) return [];
  return [
    {
      id: uid("blk"),
      type: "bullets",
      items,
    },
  ];
}

export function getSlideBullets(slide: PitchDeckSlide): string[] {
  if (Array.isArray(slide.bullets) && slide.bullets.length > 0) {
    return slide.bullets;
  }
  const bulletBlock = slide.blocks?.find((b) => b.type === "bullets");
  if (bulletBlock?.items?.length) return bulletBlock.items;
  const textBlocks = (slide.blocks || [])
    .filter((b) => b.type === "text" || b.type === "headline")
    .map((b) => b.content)
    .filter(Boolean) as string[];
  return textBlocks;
}

export function normalizeSlide(raw: any, index = 0): PitchDeckSlide {
  const type = String(raw?.type || "generic");
  const bullets = Array.isArray(raw?.bullets)
    ? raw.bullets.map((b: any) => String(b ?? "")).filter(Boolean)
    : [];
  const themeRaw = raw?.theme || raw?.metadata?.theme;
  const theme =
    (themeRaw && (LEGACY_THEME_MAP[themeRaw] || themeRaw)) || DEFAULT_THEME;

  const metadata = { ...(raw?.metadata || {}) };
  if (metadata.theme) {
    metadata.theme = LEGACY_THEME_MAP[metadata.theme] || metadata.theme;
  } else {
    metadata.theme = theme;
  }

  // Normalize closing: legacy used "generic" as last slide
  const normalizedType = type === "generic" && index >= 9 ? "closing" : type;

  return {
    id: raw?.id || uid("slide"),
    type: normalizedType,
    title: String(raw?.title || "بدون عنوان"),
    bullets,
    intent: raw?.intent || SLIDE_INTENT[normalizedType] || SLIDE_INTENT.generic,
    notes: raw?.notes || "",
    isHidden: Boolean(raw?.isHidden),
    theme,
    metadata,
    blocks:
      Array.isArray(raw?.blocks) && raw.blocks.length > 0
        ? raw.blocks
        : bulletsToBlocks(bullets),
    sources: Array.isArray(raw?.sources) ? raw.sources : [],
    claims: Array.isArray(raw?.claims) ? raw.claims : [],
    userOverrides: Array.isArray(raw?.userOverrides) ? raw.userOverrides : [],
  };
}

export function isPitchDeckV2(value: unknown): value is PitchDeckV2 {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (value as PitchDeckV2).version === 2 &&
    Array.isArray((value as PitchDeckV2).slides)
  );
}

export function emptyPitchDeck(meta: PitchDeckMeta = {}): PitchDeckV2 {
  return {
    version: 2,
    meta: {
      audience: "investor",
      stage: "idea",
      archetype: "classic_seed",
      ...meta,
    },
    readiness: { score: 0, tips: ["برای شروع، ویزارد داستان را تکمیل کنید."] },
    slides: [],
    versions: [],
  };
}

export function migratePitchDeck(
  stored: PitchDeckStored | null | undefined,
  metaFromWizard?: WizardAnswers
): PitchDeckV2 {
  if (!stored) {
    return emptyPitchDeck(wizardToMeta(metaFromWizard));
  }

  if (isPitchDeckV2(stored)) {
    return {
      ...stored,
      slides: stored.slides.map((s, i) => normalizeSlide(s, i)),
      versions: Array.isArray(stored.versions) ? stored.versions.slice(0, MAX_VERSIONS) : [],
      meta: { ...emptyPitchDeck().meta, ...stored.meta },
    };
  }

  if (Array.isArray(stored)) {
    const slides = stored.map((s, i) => normalizeSlide(s, i));
    return {
      version: 2,
      meta: wizardToMeta(metaFromWizard),
      readiness: undefined,
      slides,
      versions: [],
    };
  }

  return emptyPitchDeck();
}

export function wizardToMeta(answers?: WizardAnswers | null): PitchDeckMeta {
  if (!answers) {
    return { audience: "investor", stage: "idea", archetype: "classic_seed" };
  }
  return {
    archetype: answers.archetype || "classic_seed",
    stage: answers.stage || "idea",
    raiseSize: answers.raiseSize || answers.ask || "",
    sector: answers.sector || "",
    voice: answers.voice || "",
    audience: answers.audience || "investor",
    tagline: answers.tagline || "",
  };
}

export function snapshotVersion(
  deck: PitchDeckV2,
  label: string
): PitchDeckV2 {
  const snap = {
    id: uid("ver"),
    createdAt: new Date().toISOString(),
    label,
    slidesSnapshot: deck.slides.map((s) => ({ ...s, metadata: { ...s.metadata } })),
    metaSnapshot: { ...deck.meta },
  };
  const versions = [snap, ...(deck.versions || [])].slice(0, MAX_VERSIONS);
  return { ...deck, versions };
}

export function restoreVersion(deck: PitchDeckV2, versionId: string): PitchDeckV2 {
  const ver = deck.versions.find((v) => v.id === versionId);
  if (!ver) return deck;
  const withSnap = snapshotVersion(deck, "قبل از بازگردانی");
  return {
    ...withSnap,
    slides: ver.slidesSnapshot.map((s, i) => normalizeSlide(s, i)),
    meta: ver.metaSnapshot ? { ...deck.meta, ...ver.metaSnapshot } : deck.meta,
  };
}

export function getSlidesFromStored(stored: PitchDeckStored | null | undefined): PitchDeckSlide[] {
  return migratePitchDeck(stored).slides;
}
