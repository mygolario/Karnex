import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { repairMisalignedProjectName } from "@/lib/roadmap/align-project-name";
import type { Prisma } from "@/prisma/client";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, private",
};

function formatProjectFull(p: {
  id: string;
  projectName: string;
  tagline: string | null;
  description: string | null;
  data: unknown;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}) {
  const dbData = (p.data as Record<string, unknown>) || {};
  const merged = {
    id: p.id,
    userId: p.userId,
    description: p.description || "",
    ...dbData,
    // Prefer column values — Genesis may have left an AI brand inside JSON.
    projectName: p.projectName,
    tagline: p.tagline || (typeof dbData.tagline === "string" ? dbData.tagline : "") || "",
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };

  const { plan, changed } = repairMisalignedProjectName(merged);
  return { project: plan, changed };
}

async function persistAlignedProject(
  projectId: string,
  currentData: Record<string, unknown>,
  aligned: Record<string, unknown>
) {
  const {
    id: _id,
    userId: _uid,
    createdAt: _ca,
    updatedAt: _ua,
    projectName,
    tagline,
    description: _description,
    ...rest
  } = aligned;

  await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(typeof projectName === "string" ? { projectName } : {}),
      ...(typeof tagline === "string" ? { tagline } : {}),
      data: {
        ...currentData,
        ...rest,
        ...(typeof projectName === "string" ? { projectName } : {}),
        ...(typeof tagline === "string" ? { tagline } : {}),
      } as Prisma.InputJsonValue,
    },
  });
}

async function getAuthorizedProject(userId: string, projectId: string) {
  return prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      OR: [{ userId }, { members: { some: { userId } } }],
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401, headers: NO_STORE_HEADERS });
    }

    const { projectId } = await params;
    const project = await getAuthorizedProject(session.user.id, projectId);

    if (!project) {
      return new NextResponse("Not Found", { status: 404, headers: NO_STORE_HEADERS });
    }

    const { project: formatted, changed } = formatProjectFull(project);
    if (changed) {
      try {
        await persistAlignedProject(
          project.id,
          (project.data as Record<string, unknown>) || {},
          formatted as Record<string, unknown>
        );
      } catch (persistErr) {
        console.error("[PROJECT_GET] name-align persist failed", persistErr);
      }
    }

    return NextResponse.json(
      { success: true, project: formatted },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500, headers: NO_STORE_HEADERS });
  }
}
