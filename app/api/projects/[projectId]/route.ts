import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

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
  return {
    id: p.id,
    userId: p.userId,
    projectName: p.projectName,
    tagline: p.tagline || "",
    description: p.description || "",
    ...dbData,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
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

    return NextResponse.json(
      { success: true, project: formatProjectFull(project) },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("[PROJECT_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500, headers: NO_STORE_HEADERS });
  }
}
