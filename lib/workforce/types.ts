export const WORKFORCE_AGENT_IDS = [
  "research",
  "execution",
  "growth",
  "capital",
  "night_shift",
] as const;

export type WorkforceAgentId = (typeof WORKFORCE_AGENT_IDS)[number];

export const WORKFORCE_RUN_STATUSES = [
  "running",
  "needs_approval",
  "applied",
  "dismissed",
  "failed",
] as const;

export type WorkforceRunStatus = (typeof WORKFORCE_RUN_STATUSES)[number];

export type WorkforceRunKind = "dispatch" | "night_shift" | "cron";

export type ThreatLevel = "low" | "medium" | "high";

export interface ProjectSnapshot {
  projectId?: string;
  projectName: string;
  tagline: string;
  description: string;
  audience: string;
  projectType: "startup" | "traditional" | "creator" | string;
  problem: string;
  solution: string;
  uniqueValue: string;
  nextSteps: string[];
  completedCount: number;
  totalSteps: number;
  competitors: Array<{
    name: string;
    strength?: string;
    weakness?: string;
    threatScore?: number;
  }>;
  competitorBrief?: string;
  pitchOneLiner?: string;
}

export interface ResearchOutput {
  kind: "research";
  headline: string;
  briefing: string;
  competitorMoves: Array<{
    name: string;
    move: string;
    threat: ThreatLevel;
  }>;
  questions: string[];
  recommendedActions: Array<{
    title: string;
    why: string;
    href?: string;
  }>;
}

export interface ExecutionMission {
  id: string;
  title: string;
  roadmapStep?: string;
  minutes: number;
  steps: string[];
  copyPaste?: { label: string; body: string };
}

export interface ExecutionOutput {
  kind: "execution";
  weekTheme: string;
  missions: ExecutionMission[];
  decisionForFounder: string;
}

export interface GrowthPost {
  channel: "instagram" | "telegram" | "linkedin";
  title: string;
  caption: string;
  cta: string;
}

export interface GrowthOutput {
  kind: "growth";
  hook: string;
  posts: GrowthPost[];
  interviewScript: { opener: string; questions: string[] };
  dmTemplate: string;
}

export interface CapitalOutput {
  kind: "capital";
  oneLiner: string;
  ask: string;
  faqs: Array<{ q: string; a: string }>;
  objections: string[];
}

export interface NightShiftOutput {
  kind: "night_shift";
  greeting: string;
  todayFocus: string;
  decision: string;
  whatAgentsDid: string[];
  children: {
    research?: ResearchOutput;
    execution?: ExecutionOutput;
    growth?: GrowthOutput;
    capital?: CapitalOutput;
  };
}

export type AgentOutput =
  | ResearchOutput
  | ExecutionOutput
  | GrowthOutput
  | CapitalOutput
  | NightShiftOutput;

export interface AgentRunDTO {
  id: string;
  projectId: string;
  agentId: WorkforceAgentId;
  kind: WorkforceRunKind;
  status: WorkforceRunStatus;
  title: string;
  summary: string | null;
  output: AgentOutput;
  error: string | null;
  source?: "ai" | "fallback";
  appliedAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function isWorkforceAgentId(value: string): value is WorkforceAgentId {
  return (WORKFORCE_AGENT_IDS as readonly string[]).includes(value);
}
