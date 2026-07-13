import "server-only";
import prisma from "@/lib/prisma";
import { auth, AppSession } from "@/lib/auth/session";

export interface ProjectAccess {
  session: AppSession;
  projectId: string;
  userId: string;
  canWrite: boolean;
}

/**
 * Loads the active project for the current user and verifies membership.
 * Returns null when unauthenticated or project not found.
 * `canWrite` is true for the owner or admin/editor members.
 */
export async function getProjectAccess(projectId: string): Promise<ProjectAccess | null> {
  const session = await auth();
  if (!session || !session.user?.id) return null;
  const userId = session.user.id;

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      OR: [
        { userId },
        { members: { some: { userId } } },
      ],
    },
    select: { id: true, userId: true, members: { where: { userId }, select: { role: true } } },
  });

  if (!project) return null;

  const canWrite = project.userId === userId || !!project.members.some((m) => m.role === "admin" || m.role === "editor");

  return { session, projectId, userId, canWrite };
}

export function unauthorizedResponse() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFoundResponse() {
  return Response.json({ error: "Project not found" }, { status: 404 });
}

export function forbiddenResponse() {
  return Response.json({ error: "Project not found or no write access" }, { status: 403 });
}
