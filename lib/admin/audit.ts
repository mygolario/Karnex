import prisma from "@/lib/prisma";
import type { Prisma } from "../../prisma/client";

export async function writeAdminAudit(params: {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string | null;
  meta?: Record<string, unknown>;
}) {
  try {
    await prisma.adminAuditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId ?? null,
        meta: (params.meta ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (err) {
    console.error("Failed to write admin audit log:", err);
  }
}
