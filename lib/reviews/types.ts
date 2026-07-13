export interface Review {
  id: string;
  projectId: string;
  author: string | null;
  rating: number;
  body: string | null;
  source: string | null;
  reply: string | null;
  createdAt: string;
}

export interface ReviewInput {
  author?: string | null;
  rating: number;
  body?: string | null;
  source?: string | null;
  reply?: string | null;
}

export interface ReviewSummary {
  count: number;
  average: number;
  distribution: { rating: number; count: number }[];
  unreplied: number;
}

export const REVIEW_SOURCES = ["direct", "google", "maps"] as const;
export type ReviewSource = (typeof REVIEW_SOURCES)[number];

export const REVIEW_SOURCE_LABELS: Record<string, string> = {
  direct: "مستقیم",
  google: "گوگل",
  maps: "نقشه",
};
