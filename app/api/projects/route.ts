import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, private",
};

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401, headers: NO_STORE_HEADERS });
    }

    const userId = session.user.id;

    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        OR: [{ userId }, { members: { some: { userId } } }],
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        userId: true,
        projectName: true,
        tagline: true,
        description: true,
        data: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const formattedProjects = projects.map((p) => {
      const dbData = (p.data as Record<string, unknown>) || {};
      return {
        id: p.id,
        userId: p.userId,
        projectName: p.projectName,
        tagline: p.tagline || "",
        description: p.description || "",
        projectType: (dbData.projectType as string) || "startup",
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    return NextResponse.json(
      { success: true, projects: formattedProjects },
      { headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500, headers: NO_STORE_HEADERS });
  }
}
