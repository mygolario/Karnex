import "server-only";
import prisma from "@/lib/prisma";
import type { BroadcastChannel, BroadcastInput, BroadcastMessage, BroadcastStatus } from "./types";

function toBroadcast(b: {
  id: string;
  projectId: string;
  channel: string;
  title: string;
  body: string;
  status: string;
  scheduledAt: Date | null;
  sentAt: Date | null;
  recipientCount: number;
  createdAt: Date;
}): BroadcastMessage {
  return {
    id: b.id,
    projectId: b.projectId,
    channel: b.channel as BroadcastChannel,
    title: b.title,
    body: b.body,
    status: b.status as BroadcastStatus,
    scheduledAt: b.scheduledAt ? b.scheduledAt.toISOString() : null,
    sentAt: b.sentAt ? b.sentAt.toISOString() : null,
    recipientCount: b.recipientCount,
    createdAt: b.createdAt.toISOString(),
  };
}

async function recipientCountFromProject(projectId: string): Promise<number> {
  const project = await prisma.project.findFirst({
    where: { id: projectId },
    select: { data: true },
  });
  const data = (project?.data as Record<string, unknown>) || {};
  const customers = data.customers;
  return Array.isArray(customers) ? customers.length : 0;
}

export async function listBroadcasts(projectId: string): Promise<BroadcastMessage[]> {
  const rows = await prisma.broadcast.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map(toBroadcast);
}

/**
 * Creates a broadcast locally. No real SMS provider — marking status "sent"
 * only updates DB with recipientCount from Project.data.customers.
 */
export async function createBroadcast(projectId: string, input: BroadcastInput): Promise<BroadcastMessage> {
  if (!input.title?.trim()) throw new Error("عنوان الزامی است");
  if (!input.body?.trim()) throw new Error("متن پیام الزامی است");
  const channel = input.channel || "sms";
  if (!["sms", "whatsapp", "telegram"].includes(channel)) {
    throw new Error("کانال نامعتبر است");
  }

  const status: BroadcastStatus = input.status === "sent" ? "sent" : input.status === "scheduled" ? "scheduled" : "draft";
  let recipientCount = 0;
  let sentAt: Date | null = null;

  if (status === "sent") {
    recipientCount = await recipientCountFromProject(projectId);
    sentAt = new Date();
  }

  const row = await prisma.broadcast.create({
    data: {
      projectId,
      channel,
      title: input.title.trim(),
      body: input.body.trim(),
      status,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      sentAt,
      recipientCount,
    },
  });

  return toBroadcast(row);
}
