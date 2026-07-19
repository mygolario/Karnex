export type CompetitorSource = "ai" | "manual" | "plan" | "brand" | "location" | "market";
export type CompetitorStatus = "active" | "dismissed";
export type CompetitorScope = "local" | "national" | "regional" | "global";
export type CompetitorConfidence = "high" | "medium" | "low";
export type CompetitorType = "direct" | "indirect" | "substitute";
export type FeatureCell = "yes" | "partial" | "no";
export type NextMoveStatus = "todo" | "done";

export type DiscoveryGeography = "iran" | "international" | "both";
export type DiscoveryFocus = "direct" | "indirect" | "substitutes" | "all";

export interface CompetitorPosition {
  x: number;
  y: number;
  xAxis: string;
  yAxis: string;
}

export interface CompetitorLocationRef {
  distance?: string;
  lat?: number;
  lng?: number;
}

export interface CompetitorCitation {
  title?: string;
  url: string;
}

export interface CompetitorIntelItem {
  id: string;
  name: string;
  source: CompetitorSource;
  status: CompetitorStatus;
  isIranian?: boolean;
  scope?: CompetitorScope;
  competitorType?: CompetitorType;
  channel?: string;
  url?: string;
  tagline?: string;
  productSummary?: string;
  pricingSignal?: string;
  targetSegment?: string;
  strength: string;
  weakness: string;
  entryPoints?: string[];
  citations?: CompetitorCitation[];
  threatScore?: 1 | 2 | 3 | 4 | 5;
  confidence?: CompetitorConfidence;
  ratings?: Record<string, 1 | 2 | 3 | 4 | 5>;
  position?: { x: number; y: number };
  locationRef?: CompetitorLocationRef;
}

export interface FeatureMatrixRow {
  id: string;
  label: string;
  cells: Record<string, FeatureCell>;
}

export interface CompetitorNextMove {
  id: string;
  text: string;
  status: NextMoveStatus;
  relatedCompetitorIds?: string[];
}

export interface CompetitorDiscoveryMeta {
  geography?: DiscoveryGeography;
  focus?: DiscoveryFocus;
  count?: number;
  model?: string;
  researchedAt?: string;
}

export interface CompetitorIntel {
  updatedAt: string;
  lastResearchedAt?: string;
  yourPosition?: CompetitorPosition;
  wedge?: string;
  /** @deprecated Prefer `actionableMoves`; kept for migration/read compatibility */
  nextMoves?: string[];
  actionableMoves?: CompetitorNextMove[];
  brief?: string;
  whiteSpace?: string[];
  competitors: CompetitorIntelItem[];
  matrixDimensions?: string[];
  yourRatings?: Record<string, 1 | 2 | 3 | 4 | 5>;
  featureRows?: FeatureMatrixRow[];
  discoveryMeta?: CompetitorDiscoveryMeta;
}

export interface CompetitorDiscoveryOptions {
  geography?: DiscoveryGeography;
  focus?: DiscoveryFocus;
  count?: number;
}

export interface CompetitorDiscoveryResult {
  competitors: Array<{
    name: string;
    channel?: string;
    strength?: string;
    weakness?: string;
    isIranian?: boolean;
    scope?: CompetitorScope;
    competitorType?: CompetitorType;
    url?: string;
    tagline?: string;
    productSummary?: string;
    pricingSignal?: string;
    targetSegment?: string;
    entryPoints?: string[];
    citations?: CompetitorCitation[];
    threatScore?: number;
    confidence?: CompetitorConfidence;
    ratings?: Record<string, number>;
    position?: { x: number; y: number };
  }>;
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  brief?: string;
  wedge?: string;
  nextMoves?: string[];
  whiteSpace?: string[];
  matrixDimensions?: string[];
  yourPosition?: CompetitorPosition;
  yourRatings?: Record<string, number>;
  reasoning?: string;
}

export const DEFAULT_MATRIX_DIMENSIONS = [
  "عمق محصول",
  "دسترسی قیمت",
  "حضور محلی",
  "اعتماد برند",
  "توزیع و کانال",
] as const;

export const DEFAULT_POSITION_AXES = {
  xAxis: "قیمت (ارزان ← گران)",
  yAxis: "تخصص (عمومی ← تخصصی)",
} as const;

/** Credits charged for direct competitor discovery (Sonar Pro). */
export const ANALYZE_COMPETITORS_CREDIT_COST = 5;
