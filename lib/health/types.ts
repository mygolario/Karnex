export type HealthVerdict = "healthy" | "warning" | "critical" | "neutral";

export interface HealthDimension {
  key: string;
  label: string;
  score: number; // 0-100
  status: "good" | "ok" | "bad" | "none";
  detail: string;
}

export interface HealthReport {
  score: number; // 0-100 composite
  grade: string; // S | A | B | C | D | "—"
  verdict: HealthVerdict;
  verdictLabel: string;
  dimensions: HealthDimension[];
  highlights: string[];
  recommendations: string[];
  asOf: string;
}
