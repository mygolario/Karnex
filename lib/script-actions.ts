"use server";

import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";

// Helper to check user access to project
async function checkProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      deletedAt: null,
      OR: [
        { userId: userId },
        {
          members: {
            some: { userId: userId }
          }
        }
      ]
    }
  });
  return !!project;
}

export async function createScriptAction(data: {
  projectId: string;
  title: string;
  content: string;
  template?: string;
  duration?: string;
  audience?: string;
  scenes?: any;
  folder?: string;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { error: "Not authenticated" };

    const hasAccess = await checkProjectAccess(data.projectId, userId);
    if (!hasAccess) return { error: "Access denied" };

    const script = await prisma.script.create({
      data: {
        projectId: data.projectId,
        title: data.title || "اسکریپت بدون نام",
        content: data.content,
        template: data.template || "viral-hook",
        duration: data.duration || "60s",
        audience: data.audience || "",
        scenes: data.scenes || null,
        folder: data.folder || null,
        status: "draft"
      }
    });

    return { success: true, script };
  } catch (error: any) {
    console.error("Create Script Error:", error);
    return { error: error.message || "Failed to create script" };
  }
}

export async function updateScriptAction(id: string, data: {
  title?: string;
  content?: string;
  template?: string;
  duration?: string;
  audience?: string;
  scenes?: any;
  status?: string;
  folder?: string;
}) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { error: "Not authenticated" };

    // Get script to check project access
    const existingScript = await prisma.script.findUnique({
      where: { id },
      select: { projectId: true }
    });
    if (!existingScript) return { error: "Script not found" };

    const hasAccess = await checkProjectAccess(existingScript.projectId, userId);
    if (!hasAccess) return { error: "Access denied" };

    const script = await prisma.script.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });

    return { success: true, script };
  } catch (error: any) {
    console.error("Update Script Error:", error);
    return { error: error.message || "Failed to update script" };
  }
}

export async function getProjectScriptsAction(projectId: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { error: "Not authenticated" };

    const hasAccess = await checkProjectAccess(projectId, userId);
    if (!hasAccess) return { error: "Access denied" };

    const scripts = await prisma.script.findMany({
      where: { projectId },
      orderBy: { updatedAt: "desc" }
    });

    return { success: true, scripts };
  } catch (error: any) {
    console.error("Get Scripts Error:", error);
    return { error: "Failed to fetch scripts" };
  }
}

export async function deleteScriptAction(id: string) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { error: "Not authenticated" };

    const existingScript = await prisma.script.findUnique({
      where: { id },
      select: { projectId: true }
    });
    if (!existingScript) return { error: "Script not found" };

    const hasAccess = await checkProjectAccess(existingScript.projectId, userId);
    if (!hasAccess) return { error: "Access denied" };

    await prisma.script.delete({
      where: { id }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Delete Script Error:", error);
    return { error: "Failed to delete script" };
  }
}

export async function getUserPreferredToneAction() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) return { error: "Not authenticated" };

    const profile = await prisma.userProfile.findUnique({
      where: { userId },
      select: { preferredTone: true }
    });

    return { success: true, preferredTone: profile?.preferredTone || "balanced" };
  } catch (error) {
    console.error("Get User Preferred Tone Error:", error);
    return { error: "Failed to fetch preferred tone" };
  }
}

