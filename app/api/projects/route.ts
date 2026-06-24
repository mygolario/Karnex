import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;

    // Fetch projects (equivalent logic to getUserProjectsAction)
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { userId },
          {
            members: {
              some: { userId }
            }
          }
        ]
      },
      orderBy: { updatedAt: "desc" }
    });

    const formattedProjects = projects.map(p => {
      const dbData = p.data as any || {};
      return {
        id: p.id,
        projectName: p.projectName,
        tagline: p.tagline || "",
        description: p.description || "",
        ...dbData,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, projects: formattedProjects });
  } catch (error) {
    console.error("[PROJECTS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
