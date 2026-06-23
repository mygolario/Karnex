"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { checkProjectLimit, checkAIRequestLimit, incrementAIUsage } from "@/lib/usage-tracker";
import { callOpenRouter, parseJsonFromAI } from "@/lib/openrouter";
import { checkAILimit } from "@/lib/ai-limit-middleware";
import { getPrompt } from "@/lib/prompts/registry";
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

    // Project Limit Check
    const projectCheck = await checkProjectLimit(userId);
    if (!projectCheck.allowed) {
      return {
        error: 'محدودیت تعداد پروژه',
        message: `شما به سقف ${projectCheck.limit} پروژه فعال رسیده‌اید.`,
        limitReached: true
      };
    }

    const projectName = planData.projectName || "New Project";
    const tagline = planData.tagline || "";

    // RLS: Enforce project ownership by binding project to the authenticated user's ID
    const project = await prisma.project.create({
      data: {
        userId: userId,
        projectName: projectName,
        tagline: tagline,
        data: planData,
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

    // RLS: Enforce project ownership check (project.userId === session.user.id)
    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: 'desc' }
    });

    const formattedProjects = projects.map(p => {
      const dbData = p.data as any || {};
      return {
          id: p.id,
          projectName: p.projectName,
          tagline: p.tagline || "",
          description: p.description || "",
          ...dbData, // Merge JSON data
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

  // 4. Ensure roadmap
  if (!Array.isArray(plan.roadmap)) {
    plan.roadmap = [];
  } else {
    plan.roadmap = plan.roadmap.map((phase: any) => {
      return {
        phase: phase.phase || "فاز جدید",
        steps: Array.isArray(phase.steps) ? phase.steps.map((step: any) => {
          const stepTitle = typeof step === 'string' ? step : (step.title || "گام جدید");
          const stepDesc = typeof step === 'object' ? (step.description || "") : "";
          const stepHours = typeof step === 'object' ? (Number(step.estimatedHours) || 0) : 0;
          const stepPriority = typeof step === 'object' ? (step.priority || "medium") : "medium";
          const stepCategory = typeof step === 'object' ? (step.category || "general") : "general";
          const stepStatus = typeof step === 'object' ? (step.status || "todo") : "todo";
          const stepChecklist = typeof step === 'object' && Array.isArray(step.checklist) ? step.checklist : [];
          const stepTips = typeof step === 'object' && Array.isArray(step.tips) ? step.tips : [];
          
          return {
            title: stepTitle,
            description: stepDesc,
            estimatedHours: stepHours,
            priority: stepPriority,
            category: stepCategory,
            status: stepStatus,
            checklist: stepChecklist,
            tips: stepTips
          };
        }) : []
      };
    });
  }

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

  return plan;
}

export async function generatePlanAction(data: any) {
    const { idea, audience, budget, projectType, genesisAnswers } = data;
    
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // AI Limit Check
    const { errorResponse, rollback } = await checkAILimit();
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
    
    const { system, user } = getPrompt("generatePlan", {
      projectType,
      idea,
      audience,
      budget,
      formattedAnswers,
      businessGlossary: JSON.stringify(businessGlossary, null, 2)
    });

    const result = await callOpenRouter(
      user,
      {
        systemPrompt: system,
        maxTokens: 16000,
        temperature: 0.6,
        timeoutMs: 80000,
        modelOverride: "google/gemini-2.5-pro",
      }
    );

    if (!result.success) {
      await rollback();
      return { error: 'AI generation failed' };
    }

    try {
      const structuredPlan = parseJsonFromAI(result.content!);
      if (structuredPlan && typeof structuredPlan === 'object') {
        delete structuredPlan.reasoning;
      }

      // Normalize full plan structure
      const normalized = normalizeProjectPlan(structuredPlan);
      
      return { success: true, plan: normalized };
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      console.error("Raw AI Content:", result.content);
      
      await rollback();

      // Write to debug file
      try {
        const debugPath = path.join(process.cwd(), 'ai-debug.log');
        fs.writeFileSync(debugPath, result.content || "Empty content");
      } catch (err) {
        console.error("Failed to write debug log:", err);
      }

      return { error: 'Failed to parse AI response. Check console logs for details.' };
    }
}
