import "server-only";

import prisma from "@/lib/prisma";
import {
  executeAddStepNote,
  executeCreateContentPost,
  executeSaveMemory,
  executeUpdateStepStatus,
} from "@/lib/ai/copilot-tools";
import type {
  AgentOutput,
  CapitalOutput,
  ExecutionOutput,
  GrowthOutput,
  NightShiftOutput,
  ResearchOutput,
} from "./types";

export interface ApplyResult {
  applied: string[];
  skipped: string[];
}

async function applyResearch(
  projectId: string,
  userId: string,
  output: ResearchOutput,
): Promise<ApplyResult> {
  const applied: string[] = [];
  const skipped: string[] = [];

  await executeSaveMemory(
    projectId,
    { category: "keyFact", content: `رادار: ${output.headline}. ${output.briefing}` },
    userId,
  );
  applied.push("حافظه پروژه (حقیقت کلیدی)");

  for (const move of output.competitorMoves.filter((m) => m.threat === "high").slice(0, 3)) {
    await executeSaveMemory(
      projectId,
      {
        category: "risk",
        content: `${move.name}: ${move.move}`,
        severity: "high",
      },
      userId,
    );
    applied.push(`ریسک «${move.name}»`);
  }

  for (const q of output.questions.slice(0, 2)) {
    await executeSaveMemory(projectId, { category: "openQuestion", content: q }, userId);
    applied.push("پرسش باز");
  }

  if (!output.competitorMoves.length) skipped.push("حرکت رقبا خالی بود");
  return { applied, skipped };
}

async function applyExecution(
  projectId: string,
  userId: string,
  output: ExecutionOutput,
): Promise<ApplyResult> {
  const applied: string[] = [];
  const skipped: string[] = [];
  let firstStepNoted = false;

  for (const mission of output.missions) {
    if (!mission.roadmapStep) {
      skipped.push(`مأموریت «${mission.title}» به گام نقشه راه وصل نبود`);
      continue;
    }
    const note = [
      `مأموریت عامل اجرا: ${mission.title} (~${mission.minutes} دقیقه)`,
      ...mission.steps.map((s, i) => `${i + 1}. ${s}`),
      mission.copyPaste ? `${mission.copyPaste.label}:\n${mission.copyPaste.body}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    try {
      await executeAddStepNote(
        projectId,
        { stepTitle: mission.roadmapStep, note },
        userId,
      );
      applied.push(`یادداشت روی «${mission.roadmapStep}»`);
      if (!firstStepNoted) {
        try {
          await executeUpdateStepStatus(
            projectId,
            { stepTitle: mission.roadmapStep, status: "in-progress" },
            userId,
          );
          applied.push(`گام «${mission.roadmapStep}» در حال انجام`);
        } catch {
          skipped.push(`وضعیت گام «${mission.roadmapStep}» عوض نشد`);
        }
        firstStepNoted = true;
      }
    } catch {
      skipped.push(`گام «${mission.roadmapStep}» در نقشه راه پیدا نشد`);
    }
  }

  await executeSaveMemory(
    projectId,
    { category: "decision", content: `تمرکز هفته: ${output.weekTheme}. ${output.decisionForFounder}` },
    userId,
  );
  applied.push("تصمیم هفته در حافظه");
  return { applied, skipped };
}

function platformForChannel(channel: GrowthOutput["posts"][number]["channel"]): string {
  if (channel === "telegram") return "telegram";
  if (channel === "linkedin") return "linkedin";
  return "instagram";
}

async function applyGrowth(
  projectId: string,
  userId: string,
  output: GrowthOutput,
): Promise<ApplyResult> {
  const applied: string[] = [];
  const skipped: string[] = [];

  for (const post of output.posts) {
    try {
      await executeCreateContentPost(
        projectId,
        {
          title: post.title,
          platform: platformForChannel(post.channel),
          type: "post",
          status: "idea",
          caption: `${post.caption}\n\nCTA: ${post.cta}`,
          tags: ["عامل-رشد"],
        },
        userId,
      );
      applied.push(`پست «${post.title}» در تقویم`);
    } catch {
      skipped.push(`پست «${post.title}» ذخیره نشد`);
    }
  }

  await executeSaveMemory(
    projectId,
    {
      category: "keyFact",
      content: `اسکریپت مصاحبه: ${output.interviewScript.opener}\n${output.interviewScript.questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}`,
    },
    userId,
  );
  applied.push("اسکریپت مصاحبه در حافظه");

  await executeSaveMemory(
    projectId,
    { category: "keyFact", content: `قالب دایرکت: ${output.dmTemplate}` },
    userId,
  );
  applied.push("قالب دایرکت در حافظه");
  return { applied, skipped };
}

async function applyCapital(
  projectId: string,
  userId: string,
  output: CapitalOutput,
): Promise<ApplyResult> {
  await executeSaveMemory(
    projectId,
    { category: "keyFact", content: `وان‌لاینر: ${output.oneLiner}` },
    userId,
  );
  await executeSaveMemory(
    projectId,
    { category: "decision", content: `Ask: ${output.ask}` },
    userId,
  );
  await executeSaveMemory(
    projectId,
    {
      category: "keyFact",
      content: output.faqs.map((f) => `س: ${f.q}\nج: ${f.a}`).join("\n\n"),
    },
    userId,
  );
  return {
    applied: ["وان‌لاینر", "Ask", "پرسش‌های سرمایه‌گذار"],
    skipped: [],
  };
}

export async function applyAgentOutput(
  projectId: string,
  userId: string,
  output: AgentOutput,
): Promise<ApplyResult> {
  switch (output.kind) {
    case "research":
      return applyResearch(projectId, userId, output);
    case "execution":
      return applyExecution(projectId, userId, output);
    case "growth":
      return applyGrowth(projectId, userId, output);
    case "capital":
      return applyCapital(projectId, userId, output);
    case "night_shift":
      return applyNightShift(projectId, userId, output);
  }
}

async function applyNightShift(
  projectId: string,
  userId: string,
  output: NightShiftOutput,
): Promise<ApplyResult> {
  const applied: string[] = [];
  const skipped: string[] = [];
  const kids = output.children;

  const parts: AgentOutput[] = [];
  if (kids.research) parts.push(kids.research);
  if (kids.execution) parts.push(kids.execution);
  if (kids.growth) parts.push(kids.growth);
  if (kids.capital) parts.push(kids.capital);

  for (const part of parts) {
    const result = await applyAgentOutput(projectId, userId, part);
    applied.push(...result.applied);
    skipped.push(...result.skipped);
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId },
    select: { data: true },
  });
  const data = (project?.data as Record<string, unknown>) || {};
  const workforce = {
    ...((data.workforce as Record<string, unknown>) || {}),
    lastMorningBrief: {
      greeting: output.greeting,
      todayFocus: output.todayFocus,
      decision: output.decision,
      appliedAt: new Date().toISOString(),
    },
  };
  await prisma.project.update({
    where: { id: projectId },
    data: { data: { ...data, workforce } },
  });
  applied.push("گزارش صبح روی پروژه");
  return { applied, skipped };
}
