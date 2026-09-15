import "server-only";

import { createNotification } from "@/lib/notifications";
import { generateAgentOutput } from "./generate";
import { buildProjectSnapshot } from "./snapshot";
import { createAgentRun, failAgentRun, requireProjectAccess } from "./store";
import type { AgentRunDTO, WorkforceAgentId, WorkforceRunKind } from "./types";

export async function dispatchWorkforceAgent(params: {
  userId: string;
  projectId: string;
  agentId: WorkforceAgentId;
  kind?: WorkforceRunKind;
}): Promise<AgentRunDTO> {
  const kind = params.kind ?? (params.agentId === "night_shift" ? "night_shift" : "dispatch");
  const project = await requireProjectAccess(params.projectId, params.userId);
  if (!project) {
    throw new Error("PROJECT_NOT_FOUND");
  }

  const data = (project.data as Record<string, unknown>) || {};
  if (params.agentId === "capital" && String(data.projectType ?? "startup") !== "startup") {
    throw new Error("CAPITAL_STARTUP_ONLY");
  }

  const snapshot = buildProjectSnapshot(data, {
    projectId: project.id,
    projectName: project.projectName,
    tagline: project.tagline || undefined,
    description: project.description || undefined,
  });

  try {
    const { output, source } = await generateAgentOutput(params.agentId, snapshot);
    const run = await createAgentRun({
      userId: params.userId,
      projectId: params.projectId,
      agentId: params.agentId,
      kind,
      output,
      source,
    });

    await createNotification(params.userId, {
      type: "success",
      title: params.agentId === "night_shift" ? "گزارش صبح آماده است" : "کار عامل آماده تأیید است",
      message: run.summary || run.title,
      category: "aiInsights",
      action: { label: "مشاهده میز عامل‌ها", href: "/dashboard/workforce" },
    });

    return run;
  } catch (error) {
    const message = error instanceof Error ? error.message : "اجرای عامل ناموفق بود";
    return failAgentRun({
      userId: params.userId,
      projectId: params.projectId,
      agentId: params.agentId,
      kind,
      error: message,
    });
  }
}
