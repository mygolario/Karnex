export type CompetitorSource = "ai" | "manual" | "plan" | "brand" | "location";
export type CompetitorStatus = "active" | "dismissed";
export type CompetitorScope = "local" | "national" | "regional" | "global";
export type CompetitorConfidence = "high" | "medium" | "low";
export type FeatureCell = "yes" | "partial" | "no";

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

export interface CompetitorIntelItem {
  id: string;
  name: string;
  source: CompetitorSource;
  status: CompetitorStatus;
  isIranian?: boolean;
  scope?: CompetitorScope;
  channel?: string;
  url?: string;
  tagline?: string;
  strength: string;
  weakness: string;
  entryPoints?: string[];
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

export interface CompetitorIntel {
  updatedAt: string;
  lastResearchedAt?: string;
  yourPosition?: CompetitorPosition;
  wedge?: string;
  nextMoves?: string[];
  brief?: string;
  whiteSpace?: string[];
  competitors: CompetitorIntelItem[];
  matrixDimensions?: string[];
  yourRatings?: Record<string, 1 | 2 | 3 | 4 | 5>;
  featureRows?: FeatureMatrixRow[];
}

export interface CompetitorDiscoveryResult {
  competitors: Array<{
    name: string;
    channel?: string;
    strength?: string;
    weakness?: string;
    isIranian?: boolean;
    scope?: CompetitorScope;
    url?: string;
    tagline?: string;
    entryPoints?: string[];
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
