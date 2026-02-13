"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { checkProjectLimit, checkAIRequestLimit, incrementAIUsage } from "@/lib/usage-tracker";
import { callOpenRouter, parseJsonFromAI } from "@/lib/openrouter";

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

export async function getUserProjectsAction() {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

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

// --- Generate Plan ---

export async function generatePlanAction(data: any) {
    const { idea, audience, budget, projectType, genesisAnswers } = data;
    
    const session = await auth();
    if (!session?.user?.id) return { error: "Unauthorized" };

    // AI Limit Check
    const usageCheck = await checkAIRequestLimit(session.user.id);
    if (!usageCheck.allowed) {
        return { 
            error: 'AI Limit Reached', 
            message: `Limit reached: ${usageCheck.limit}` 
        };
    }

    const formattedAnswers = genesisAnswers 
      ? Object.entries(genesisAnswers).map(([key, val]) => `- ${key}: ${val}`).join('\n') 
      : 'None provided';

    const systemPrompt = `
      You are Karnex, an expert business consultant specializing in the Iranian market.
      Your Goal: Create a highly tailored execution plan based on the user's specific business type: ${projectType}.
      
      User Context:
      - Type: ${projectType}
      - Idea: ${idea}
      - Target Audience: ${audience}
      - Budget Constraint: ${budget}
      - Specific Configuration:
      ${formattedAnswers}

      INSTRUCTIONS:
       1. Reply in PERSIAN (Farsi).
       2. Output ONLY valid JSON.
       3. Focus on "${projectType}" needs.
       
       JSON STRUCTURE REQUIRED:
       {
         "projectName": "Name",
         "tagline": "Slogan",
         "overview": "Overview",
         "leanCanvas": { "keyPartners": "...", "keyActivities": "...", "keyResources": "...", "uniqueValue": "...", "customerRelations": "...", "channels": "...", "customerSegments": "...", "costStructure": "...", "revenueStream": "..." },
         "brandKit": { "primaryColorHex": "#...", "secondaryColorHex": "#...", "colorPsychology": "...", "suggestedFont": "...", "logoConcepts": [] },
         "roadmap": [ { "phase": "...", "steps": [ { "title": "...", "description": "...", "estimatedHours": 0, "priority": "high", "category": "...", "status": "todo", "checklist": [], "tips": [] } ] } ],
         "marketingStrategy": [],
         "competitors": []
       }
    `;

    const result = await callOpenRouter(
      `طرح کسب‌وکار جامع JSON فارسی برای: ${idea}`,
      {
        systemPrompt,
        maxTokens: 5500,
        temperature: 0.6,
        timeoutMs: 80000,
      }
    );

    if (!result.success) {
      return { error: 'AI generation failed' };
    }

    try {
      const structuredPlan = parseJsonFromAI(result.content!);
      
      // Increment usage
      await incrementAIUsage(session.user.id);
      
      return { success: true, plan: structuredPlan };
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError);
      return { error: 'Failed to parse AI response' };
    }
}
