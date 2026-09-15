import "server-only";

import prisma from "@/lib/prisma";
import type { Prisma } from "../../prisma/client";
import { getAgentDef, NIGHT_SHIFT } from "./catalog";
import { summaryFromOutput, titleForAgentRun } from "./normalize";
import type {
  AgentOutput,
  AgentRunDTO,
  WorkforceAgentId,
  WorkforceRunKind,
} from "./types";

export function isMissingAgentRunTable(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    ((error as { code: string }).code === "P2021" ||
      (error as { code: string }).code === "P2022")
  );
}

export async function requireProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      OR: [{ userId }, { members: { some: { userId } } }],
    },
    select: {
      id: true,
      userId: true,
      projectName: true,
      tagline: true,
      description: true,
      data: true,
    },
  });
  if (!project) return null;
  return project;
}

function asOutput(value: unknown): AgentOutput {
  return value as AgentOutput;
}

export function toRunDTO(row: {
  id: string;
  projectId: string;
  agentId: string;
  kind: string;
  status: string;
  title: string;
  summary: string | null;
  output: unknown;
  error: string | null;
  appliedAt: Date | null;
  dismissedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AgentRunDTO {
  const output = asOutput(row.output);
  const meta =
    row.output && typeof row.output === "object" && row.output !== null
      ? (row.output as { _source?: "ai" | "fallback" })
      : {};
  return {
    id: row.id,
    projectId: row.projectId,
    agentId: row.agentId as WorkforceAgentId,
    kind: row.kind as WorkforceRunKind,
    status: row.status as AgentRunDTO["status"],
    title: row.title,
    summary: row.summary,
    output,
    error: row.error,
    source: meta._source,
    appliedAt: row.appliedAt?.toISOString() ?? null,
    dismissedAt: row.dismissedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function wrapOutput(output: AgentOutput, source: "ai" | "fallback") {
  return { ...output, _source: source };
}

export async function createAgentRun(params: {
  userId: string;
  projectId: string;
  agentId: WorkforceAgentId;
  kind: WorkforceRunKind;
  output: AgentOutput;
  source: "ai" | "fallback";
  status?: "needs_approval" | "failed";
  error?: string;
}) {
  const output = wrapOutput(params.output, params.source);
  const title =
    params.agentId === "night_shift"
      ? NIGHT_SHIFT.name
      : titleForAgentRun(params.agentId, params.output);
  const summary = summaryFromOutput(params.output);
  const row = await prisma.agentRun.create({
    data: {
      userId: params.userId,
      projectId: params.projectId,
      agentId: params.agentId,
      kind: params.kind,
      status: params.status ?? "needs_approval",
      title: getAgentDef(params.agentId)?.name
        ? `${getAgentDef(params.agentId)!.name} — ${title}`
        : title,
      summary,
      output: output as Prisma.InputJsonValue,
      error: params.error ?? null,
    },
  });
  return toRunDTO(row);
}

export async function failAgentRun(params: {
  userId: string;
  projectId: string;
  agentId: WorkforceAgentId;
  kind: WorkforceRunKind;
  error: string;
}) {
  const row = await prisma.agentRun.create({
    data: {
      userId: params.userId,
      projectId: params.projectId,
      agentId: params.agentId,
      kind: params.kind,
      status: "failed",
      title: getAgentDef(params.agentId)?.name || params.agentId,
      summary: params.error,
      output: { kind: params.agentId, error: params.error } as Prisma.InputJsonValue,
      error: params.error,
    },
  });
  return toRunDTO(row);
}

export async function listAgentRuns(projectId: string, take = 40) {
  const rows = await prisma.agentRun.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take,
  });
  return rows.map(toRunDTO);
}

export async function getAgentRun(runId: string, projectId: string) {
  const row = await prisma.agentRun.findFirst({
    where: { id: runId, projectId },
  });
  return row ? toRunDTO(row) : null;
}

export function readNightShiftEnabled(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const wf = (data as { workforce?: { nightShiftEnabled?: unknown } }).workforce;
  return wf?.nightShiftEnabled === true;
}
