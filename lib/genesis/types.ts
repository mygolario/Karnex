import type { ProjectType } from "@/app/new-project/genesis-constants";

/** Intake path chosen on welcome. */
export type GenesisPathMode = "express" | "deep";

/**
 * Wizard chapters (URL ?step=). Build is the generate phase;
 * handoff lives on the dashboard after create.
 */
export const GENESIS_PHASES = [
  "welcome",
  "pillar",
  "interview",
  "context",
  "brief",
  "build",
] as const;

export type GenesisPhase = (typeof GENESIS_PHASES)[number];

export const GENESIS_PHASE_LABELS: Record<GenesisPhase, string> = {
  welcome: "شروع",
  pillar: "مسیر",
  interview: "ایده",
  context: "شرایط",
  brief: "تأیید",
  build: "ساخت",
};

/** Structured intake fields stored in answers + project.data.genesisAnswers */
export type GenesisAnswerKey =
  | "industry"
  | "problem"
  | "audience_who"
  | "solution"
  | "stage"
  | "team"
  | "goal"
  | "budget"
  | "geo"
  | "geo_detail"
  | "tech_stack"
  | "location_type"
  | "platform";

export const UNKNOWN_ANSWER = "unknown";

export interface GenesisDraftV2 {
  version: 2;
  pathMode: GenesisPathMode;
  pillar: ProjectType | null;
  projectName: string;
  /** Free-text polish / combined vision sent as ideaInput */
  projectVision: string;
  answers: Record<string, string>;
  activeStep: number;
  /** Sub-index within interview or context chapter */
  activeSubStep: number;
  /** Light AI assists used this draft (client-enforced Free cap) */
  assistUses: number;
}

export interface GenesisConfidence {
  score: number; // 0–100
  level: "weak" | "ok" | "strong";
  tips: string[];
}

/** Honest credit estimate shown before generate */
export interface GenesisCreditEstimate {
  core: number;
  roadmap: number;
  assistsUsed: number;
  assistUnit: number;
  total: number;
}
