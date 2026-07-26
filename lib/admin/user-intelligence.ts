/** Shared admin user-intelligence types/labels (safe for client + server). */

export type AdminFunnelStage =
  | "signed_up"
  | "has_project"
  | "activated"
  | "paid";

export const ADMIN_FUNNEL_STAGE_LABELS: Record<AdminFunnelStage, string> = {
  signed_up: "ثبت‌نام",
  has_project: "پروژه",
  activated: "فعال",
  paid: "پرداخت",
};

export type AdminUserRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  subscription: { planId: string; status: string };
  credits: { aiTokens: number; projectsUsed: number };
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  last_seen_at: string | null;
  projectCount: number;
  funnel_stage: AdminFunnelStage;
};

export type AdminUserDetail = AdminUserRow & {
  projects: { id: string; projectName: string; updatedAt: string }[];
  transactions: {
    id: string;
    planId: string | null;
    amount: number;
    status: string;
    createdAt: string;
  }[];
  tickets: {
    id: string;
    subject: string;
    status: string;
    priority: string;
    createdAt: string;
  }[];
  feedback: { id: string; message: string; createdAt: string }[];
  auditLogs: {
    id: string;
    action: string;
    actorEmail: string | null;
    createdAt: string;
    meta: unknown;
  }[];
  loginEvents: {
    id: string;
    status: string;
    method: string | null;
    ip: string | null;
    createdAt: string;
  }[];
  posthogPersonUrl: string | null;
  posthogReplayUrl: string;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

export function deriveFunnelStage(input: {
  projectCount: number;
  planId: string;
  planStatus: string;
  completedTours: unknown;
}): AdminFunnelStage {
  const paid =
    input.planId !== "free" &&
    (input.planStatus === "active" || input.planStatus === "trialing");
  if (paid) return "paid";
  const tours = asStringArray(input.completedTours);
  if (tours.includes("dashboard")) return "activated";
  if (input.projectCount > 0) return "has_project";
  return "signed_up";
}
