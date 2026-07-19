"use server";

import { auth } from "@/lib/auth/session";
import prisma from "@/lib/prisma";
import { checkProjectLimit, checkAIRequestLimit, incrementAIUsage } from "@/lib/usage-tracker";
import { TIER_DEFAULT, TIER_REASONING } from "@/lib/openrouter";
import { checkAILimit } from "@/lib/ai-limit-middleware";
import { runWithAiUsage } from "@/lib/ai-usage-context";
import { getPrompt } from "@/lib/prompts/registry";
import {
  callAIWithValidation,
  BusinessPlanCoreSchema,
  RoadmapChunkSchema,
} from "@/lib/ai-validation";
import {
  normalizeRoadmapOnly,
  normalizeRoadmapChunk1to8,
  normalizeRoadmapChunk9to16,
} from "@/lib/roadmap-normalize";
import { isPillarAvailableAtLaunch } from "@/lib/launch/config";
import fs from 'fs';
import path from 'path';

// --- Project Creation ---

export async function createProjectAction(planData: any) {
  try {
    const session = await auth();
    const user = session?.user;

    if (!user || !user.id) {
      return { error: 'Not authenticated' };
    }

    const userId = user.id;

    const projectType = planData?.projectType as string | undefined;
    if (projectType && !isPillarAvailableAtLaunch(projectType as "startup" | "traditional" | "creator")) {
      return {
        error: "این نوع پروژه هنوز در دسترس نیست",
        message: "در حال حاضر فقط مسیر استارتاپ فعال است.",
      };
    }

    // Project Limit Check
    const projectCheck = await checkProjectLimit(userId);
    if (!projectCheck.allowed) {
      return {
        error: 'محدودیت تعداد پروژه',
        message: `شما به سقف ${projectCheck.limit} پروژه فعال رسیده‌اید.`,
        limitReached: true
      };
    }

    // Map businessModelCanvas → leanCanvas so the canvas UI can bootstrap cards
    const normalizedPlan = normalizeProjectPlan(planData);

    const projectName = normalizedPlan.projectName || "New Project";
    const tagline = normalizedPlan.tagline || "";

    // RLS: Enforce project ownership by binding project to the authenticated user's ID
    const project = await prisma.project.create({
      data: {
        userId: userId,
        projectName: projectName,
        tagline: tagline,
        data: normalizedPlan,
      }
    });

    return { success: true, id: project.id };
  } catch (error: any) {
    console.error("Create Project Error:", error);
    return { error: error.message || 'Internal server error' };
  }
}

// --- Get User Projects ---

import { unstable_noStore as noStore } from 'next/cache';

export async function getUserProjectsAction() {
  noStore(); // Force dynamic fetch
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // RLS: Enforce project ownership check OR membership
    const projects = await prisma.project.findMany({
      where: {
        deletedAt: null,
        OR: [
          { userId: session.user.id },
          {
            members: {
              some: { userId: session.user.id }
            }
          }
        ]
      },
      orderBy: { updatedAt: 'desc' }
    });

    const formattedProjects = projects.map(p => {
      const dbData = p.data as any || {};
      // Heal legacy genesis plans that stored businessModelCanvas without leanCanvas
      const normalized = normalizeProjectPlan({
        ...dbData,
        projectName: p.projectName,
        tagline: p.tagline || dbData.tagline || "",
      });
      return {
          id: p.id,
          projectName: p.projectName,
          tagline: p.tagline || "",
          description: p.description || "",
          ...normalized,
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
      };
    });

    return { success: true, projects: formattedProjects };
  } catch (error) {
    console.error("Get Projects Error:", error);
    return { error: "Failed to fetch projects" };
  }
}

// --- Helper: Normalize Canvas Keys ---
function normalizeCanvasKeys(canvasData: any) {
    if (!canvasData || typeof canvasData !== 'object') return {};
    
    const normalized: any = {};
    const keyMap: Record<string, string> = {
        'keypartners': 'keyPartners',
        'keypartnerships': 'keyPartners',
        'partners': 'keyPartners',
        'keyactivities': 'keyActivities',
        'activities': 'keyActivities',
        'keyresources': 'keyResources',
        'resources': 'keyResources',
        'uniquevalue': 'uniqueValue',
        'uniquevalueproposition': 'uniqueValue',
        'valueproposition': 'uniqueValue',
        'customerrelations': 'customerRelations',
        'customerrelationships': 'customerRelations',
        'relationships': 'customerRelations',
        'channels': 'channels',
        'customersegments': 'customerSegments',
        'segments': 'customerSegments',
        'customers': 'customerSegments',
        'coststructure': 'costStructure',
        'costs': 'costStructure',
        'revenuestream': 'revenueStream',
        'revenuestreams': 'revenueStream',
        'revenue': 'revenueStream',
        // Identity
        'identity': 'identity',
        'brandidentity': 'identity',
        'promise': 'promise',
        'brandpromise': 'promise',
        'audience': 'audience',
        'targetaudience': 'audience',
        'contentstrategy': 'contentStrategy',
        'content': 'contentStrategy',
        'monetization': 'monetization',
        'collaborators': 'collaborators',
        'investment': 'investment'
    };

    Object.keys(canvasData).forEach(key => {
        const lower = key.toLowerCase().replace(/[^a-z]/g, '');
        const target = keyMap[lower];
        if (target) {
            normalized[target] = canvasData[key];
        } else {
            // Keep original if no match, maybe it's already correct or unknown
            normalized[key] = canvasData[key];
        }
    });

    return normalized;
}

// --- Generate Plan ---

function normalizeProjectPlan(plan: any): any {
  if (!plan || typeof plan !== 'object') {
    plan = {};
  }

  // 1. Ensure basic fields
  plan.projectName = plan.projectName || "پروژه جدید";
  plan.tagline = plan.tagline || "";
  plan.overview = plan.overview || "";

  // 2. Ensure leanCanvas (Business Model Canvas)
  const defaultCanvas = {
    keyPartners: "",
    keyActivities: "",
    keyResources: "",
    uniqueValue: "",
    customerRelations: "",
    channels: "",
    customerSegments: "",
    costStructure: "",
    revenueStream: ""
  };
  
  if (plan.businessModelCanvas) {
    plan.leanCanvas = { ...defaultCanvas, ...normalizeCanvasKeys(plan.businessModelCanvas) };
    delete plan.businessModelCanvas;
  } else {
    plan.leanCanvas = { ...defaultCanvas, ...normalizeCanvasKeys(plan.leanCanvas || {}) };
  }

  // 3. Ensure brandKit
  const defaultBrandKit = {
    primaryColorHex: "#3b82f6",
    secondaryColorHex: "#1d4ed8",
    colorPsychology: "",
    suggestedFont: "Vazirmatn",
    logoConcepts: []
  };
  plan.brandKit = { ...defaultBrandKit, ...plan.brandKit };
  if (!Array.isArray(plan.brandKit.logoConcepts)) {
    plan.brandKit.logoConcepts = [];
  }

  // 4. Ensure roadmap — exactly 16 phases with weekNumber 1-16
  if (!Array.isArray(plan.roadmap)) {
    plan.roadmap = [];
  }

  // Pad to 16 if shorter, trim if longer
  while (plan.roadmap.length < 16) {
    plan.roadmap.push({
      phase: `هفته ${plan.roadmap.length + 1}: فاز جدید`,
      weekNumber: plan.roadmap.length + 1,
      theme: "",
      icon: "",
      steps: [],
    });
  }
  if (plan.roadmap.length > 16) {
    plan.roadmap = plan.roadmap.slice(0, 16);
  }

  // Normalize each phase
  plan.roadmap = plan.roadmap.map((phase: any, idx: number) => {
    const weekNum = idx + 1;
    return {
      phase: phase.phase || `هفته ${weekNum}: فاز جدید`,
      weekNumber: phase.weekNumber || weekNum,
      theme: phase.theme || "",
      icon: phase.icon || "",
      steps: Array.isArray(phase.steps) ? phase.steps.map((step: any) => {
        const stepTitle = typeof step === 'string' ? step : (step.title || "گام جدید");
        const stepDesc = typeof step === 'object' ? (step.description || "") : "";
        const stepHours = typeof step === 'object' ? (Number(step.estimatedHours) || 0) : 0;
        const stepPriority = typeof step === 'object' ? (step.priority || "medium") : "medium";
        const stepCategory = typeof step === 'object' ? (step.category || "general") : "general";
        const stepStatus = typeof step === 'object' ? (step.status || "todo") : "todo";
        const stepChecklist = typeof step === 'object' && Array.isArray(step.checklist) ? step.checklist : [];
        const stepTips = typeof step === 'object' && Array.isArray(step.tips) ? step.tips : [];
        const stepResources = typeof step === 'object' && Array.isArray(step.resources) ? step.resources : [];
        const stepDeps = typeof step === 'object' && Array.isArray(step.dependsOn) ? step.dependsOn : [];
        
        return {
          title: stepTitle,
          description: stepDesc,
          estimatedHours: stepHours,
          priority: stepPriority,
          category: stepCategory,
          status: stepStatus,
          checklist: stepChecklist,
          tips: stepTips,
          resources: stepResources,
          dependsOn: stepDeps,
        };
      }) : []
    };
  });

  // 5. Ensure marketingStrategy
  if (!Array.isArray(plan.marketingStrategy)) {
    plan.marketingStrategy = [];
  } else {
    plan.marketingStrategy = plan.marketingStrategy.map((item: any) => {
      if (typeof item === 'string') {
        return { channel: "عمومی", tactic: item, cost: "low" };
      }
      return {
        channel: item.channel || "کانال بازاریابی",
        tactic: item.tactic || "تاکتیک بازاریابی",
        cost: item.cost || "low"
      };
    });
  }

  // 6. Ensure competitors
  if (!Array.isArray(plan.competitors)) {
    plan.competitors = [];
  } else {
    plan.competitors = plan.competitors.map((item: any) => {
      return {
        name: item.name || "نام رقیب",
        strength: item.strength || "",
        weakness: item.weakness || "",
        channel: item.channel || "وب‌سایت",
        isIranian: typeof item.isIranian === 'boolean' ? item.isIranian : true
      };
    });
  }

  // 6b. Pass through competitorIntel if present
  if (plan.competitorIntel && typeof plan.competitorIntel === "object") {
    if (!Array.isArray(plan.competitorIntel.competitors)) {
      plan.competitorIntel.competitors = [];
    }
  }

  return plan;
}

export async function generateCorePlanAction(data: any): Promise<{
  success?: boolean;
  plan?: any;
  error?: string;
  message?: string;
}> {
    const { idea, audience, budget, projectType, genesisAnswers } = data;
    
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    if (projectType && !isPillarAvailableAtLaunch(projectType as "startup" | "traditional" | "creator")) {
      return {
        error: "این نوع پروژه هنوز در دسترس نیست",
        message: "در حال حاضر فقط مسیر استارتاپ فعال است.",
      };
    }

    // AI Limit Check
    const { errorResponse, rollback } = await checkAILimit('generate-plan');
    if (errorResponse) {
        return { 
            error: 'AI_LIMIT_REACHED', 
            message: `Limit reached` 
        };
    }

    const formattedAnswers = genesisAnswers 
      ? Object.entries(genesisAnswers).map(([key, val]) => `- ${key}: ${val}`).join('\n') 
      : 'None provided';

    const { businessGlossary } = await import("@/lib/knowledge-base");
    const { getKbContextBlock } = await import("@/lib/ai/rag");

    // Ground the plan with authoritative Iranian regulatory content (e‌namad,
    // samandehi, tax, nic, ...). Best-effort: empty string if RAG is unavailable.
    const kbQuery = `${idea} ${audience ?? ""} ${projectType ?? ""}`.trim();
    const kbContext = await getKbContextBlock(kbQuery, { k: 4 });

    const { system, user } = getPrompt("generatePlan", {
      projectType,
      idea,
      audience,
      budget,
      formattedAnswers,
      businessGlossary: JSON.stringify(businessGlossary, null, 2)
    });

    const userWithKb = kbContext ? `${user}\n\n${kbContext}` : user;

    try {
      return await runWithAiUsage(
        { userId: session.user.id, feature: "generatePlan" },
        async () => {
          const coreUser = `${userWithKb}\n\n⚠️ مرحله ۱: فقط overview، businessModelCanvas، brandKit، marketingStrategy و competitors را کامل تولید کن. فیلد roadmap را حتماً به صورت آرایه خالی [] برگردان.`;

          const corePlan = await callAIWithValidation(
            coreUser,
            {
              systemPrompt: system,
              maxTokens: 12000,
              temperature: 0.6,
              timeoutMs: 90000,
              modelOverride: TIER_REASONING,
            },
            BusinessPlanCoreSchema,
            1
          );

          return { success: true as const, plan: corePlan };
        }
      );
    } catch (parseError: any) {
      console.error("AI Validation / Parse Core Plan Error:", parseError);
      await rollback();
      return { error: 'Failed to generate structured plan core. Check console logs for details.' };
    }
}

/**
 * Generate one 8-week roadmap chunk. Used by the wizard for progress UX
 * (weeks 1–8 then 9–16) and by generateRoadmapAction as a sequential merge.
 */
export async function generateRoadmapChunkAction(data: {
  idea: string;
  projectType: string;
  genesisAnswers?: Record<string, string>;
  corePlan: any;
  weekStart: number;
  weekEnd: number;
}): Promise<{
  success?: boolean;
  roadmap?: any;
  error?: string;
  message?: string;
}> {
  const { idea, projectType, genesisAnswers, corePlan, weekStart, weekEnd } = data;

  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  if (
    !((weekStart === 1 && weekEnd === 8) || (weekStart === 9 && weekEnd === 16))
  ) {
    return { error: "Invalid roadmap chunk range" };
  }

  const formattedAnswers = genesisAnswers
    ? Object.entries(genesisAnswers)
        .map(([key, val]) => `- ${key}: ${val}`)
        .join("\n")
    : "None provided";

  const { system, user } = getPrompt("generateRoadmap", {
    projectType,
    idea,
    projectName: corePlan?.projectName ?? "",
    overview: corePlan?.overview ?? "",
    formattedAnswers,
    weekStart: String(weekStart),
    weekEnd: String(weekEnd),
  });

  const preprocess =
    weekStart === 1 ? normalizeRoadmapChunk1to8 : normalizeRoadmapChunk9to16;

  try {
    return await runWithAiUsage(
      { userId: session.user.id, feature: "generatePlan" },
      async () => {
        const chunkResult = await callAIWithValidation(
          user,
          {
            systemPrompt: system,
            maxTokens: 8000,
            temperature: 0.6,
            timeoutMs: 60000,
            modelOverride: TIER_DEFAULT,
          },
          RoadmapChunkSchema,
          1,
          preprocess
        );

        return { success: true as const, roadmap: chunkResult.roadmap };
      }
    );
  } catch (parseError: any) {
    console.error(
      `AI Validation / Parse Roadmap Chunk ${weekStart}-${weekEnd} Error:`,
      parseError
    );
    return {
      error: "Failed to generate structured roadmap. Check console logs for details.",
    };
  }
}

export async function generateRoadmapAction(data: any): Promise<{
  success?: boolean;
  roadmap?: any;
  error?: string;
  message?: string;
}> {
  const { idea, projectType, genesisAnswers, corePlan } = data;

  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    const first = await generateRoadmapChunkAction({
      idea,
      projectType,
      genesisAnswers,
      corePlan,
      weekStart: 1,
      weekEnd: 8,
    });
    if (first.error || !first.roadmap) {
      return {
        error:
          first.error ||
          "Failed to generate structured roadmap. Check console logs for details.",
      };
    }

    const second = await generateRoadmapChunkAction({
      idea,
      projectType,
      genesisAnswers,
      corePlan,
      weekStart: 9,
      weekEnd: 16,
    });
    if (second.error || !second.roadmap) {
      return {
        error:
          second.error ||
          "Failed to generate structured roadmap. Check console logs for details.",
      };
    }

    const merged = normalizeRoadmapOnly({
      roadmap: [...first.roadmap, ...second.roadmap],
    });

    return { success: true as const, roadmap: merged.roadmap };
  } catch (parseError: any) {
    console.error("AI Validation / Parse Roadmap Error:", parseError);
    return {
      error: "Failed to generate structured roadmap. Check console logs for details.",
    };
  }
}


export async function getProjectMembersAction(projectId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const currentUserId = session.user.id;

    // Fetch project and its members to check ownership/membership
    const project = await prisma.project.findFirst({
        where: { id: projectId, deletedAt: null },
        select: { 
            userId: true,
            user: {
                select: {
                    name: true,
                    email: true
                }
            },
            members: {
                where: {
                    user: {
                        deletedAt: null
                    }
                },
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            }
        }
    });

    if (!project) return { error: "Project not found" };

    const isOwner = project.userId === currentUserId;
    const isMember = project.members.some(m => m.userId === currentUserId);
    if (!isOwner && !isMember) return { error: "Unauthorized" };

    // Format list of members including the owner
    const formattedMembers = [
        {
            id: 'owner',
            userId: project.userId,
            email: project.user?.email || '',
            name: project.user?.name || 'سازنده پروژه',
            role: 'owner',
            createdAt: new Date().toISOString()
        },
        ...project.members.map(m => ({
            id: m.id,
            userId: m.userId,
            email: m.user?.email || '',
            name: m.user?.name || '',
            role: m.role,
            createdAt: m.createdAt.toISOString()
        }))
    ];

    return { success: true, members: formattedMembers };
  } catch (error) {
    console.error("Get Project Members Error:", error);
    return { error: "Failed to fetch members" };
  }
}

export async function inviteMemberAction(projectId: string, email: string, role: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };
    const currentUserId = session.user.id;

    // Verify current user has admin rights (is owner or admin member)
    const project = await prisma.project.findFirst({
        where: { id: projectId, deletedAt: null },
        select: { 
            userId: true,
            projectName: true,
            members: {
                where: { userId: currentUserId }
            }
        }
    });

    if (!project) return { error: "Project not found" };

    const isOwner = project.userId === currentUserId;
    const membership = project.members?.[0];
    const isAdmin = isOwner || (membership && membership.role === 'admin');

    if (!isAdmin) {
        return { error: "فقط سازنده پروژه یا مدیران می‌توانند همکار جدید دعوت کنند." };
    }

    // Find the target user by email
    const targetUser = await prisma.user.findFirst({
        where: { email, deletedAt: null }
    });

    if (!targetUser) {
        return { error: "کاربری با این ایمیل در سامانه پیدا نشد. ابتدا باید ثبت‌نام کرده باشد." };
    }

    if (targetUser.id === project.userId) {
        return { error: "این کاربر سازنده اصلی پروژه است." };
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId: targetUser.id,
                projectId
            }
        }
    });

    if (existingMember) {
        return { error: "این کاربر قبلاً به پروژه اضافه شده است." };
    }

    // Create membership
    await prisma.projectMember.create({
        data: {
            userId: targetUser.id,
            projectId,
            role
        }
    });

    // Send email notification using Brevo
    try {
        const { sendEmail } = await import("@/lib/email");
        const { getInvitationTemplate } = await import("@/lib/email-templates");
        const roleLabel = role === 'admin' ? 'مدیر' : role === 'editor' ? 'ویرایش‌گر' : 'بیننده';
        const senderName = session?.user?.name || session?.user?.email || "کاربر کارنکس";

        // Create In-App Notification
        try {
            const { createNotification } = await import("@/lib/notifications");
            await createNotification(targetUser.id, {
                type: "info",
                title: "دعوت به همکاری 👥",
                message: `شما توسط ${senderName} به پروژه ${project.projectName} به عنوان ${roleLabel} دعوت شده‌اید.`,
                action: { label: "مشاهده پروژه", href: "/dashboard/overview" },
                category: "roadmap"
            });
        } catch (inAppErr) {
            console.error("Failed to send in-app invite notification:", inAppErr);
        }
        
        const emailHtml = getInvitationTemplate(
            senderName,
            project.projectName,
            roleLabel,
            "https://www.karnex.ir/dashboard"
        );

        await sendEmail({
            to: email,
            subject: `دعوت به همکاری در پروژه ${project.projectName} - کارنکس`,
            templateName: 'invitation',
            htmlContent: emailHtml
        });
    } catch (emailErr) {
        console.error("Failed to send email invite notification:", emailErr);
    }

    return { success: true };
  } catch (error) {
    console.error("Invite Member Error:", error);
    return { error: "Failed to invite member" };
  }
}
