"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { checkProjectLimit, checkAIRequestLimit, incrementAIUsage } from "@/lib/usage-tracker";
import { callOpenRouter, parseJsonFromAI } from "@/lib/openrouter";
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
            error: 'AI_LIMIT_REACHED', 
            message: `Limit reached: ${usageCheck.limit}` 
        };
    }

    const formattedAnswers = genesisAnswers 
      ? Object.entries(genesisAnswers).map(([key, val]) => `- ${key}: ${val}`).join('\n') 
      : 'None provided';

    const { businessGlossary } = await import("@/lib/knowledge-base");
    
    const systemPrompt = `
      You are Karnex, a Senior Business Strategist & Product Manager specializing in the Iranian market.
      
      **YOUR MISSION:**
      Create a highly personalized, actionable, and realistic execution roadmap for the user's specific project.
      This is NOT a generic template. It MUST be tailored to the exact industry, business model, and constraints of the user.

      **USER PROJECT CONTEXT:**
      - **Project Type:** ${projectType} (Startup/Traditional/Creator)
      - **Core Idea:** ${idea}
      - **Target Audience:** ${audience}
      - **Budget:** ${budget}
      - **Specific Details:** 
      ${formattedAnswers}

      **CRITICAL INSTRUCTIONS FOR PERSONALIZATION:**
      1.  **Analyze the Idea:** First, understand the specific niche (e.g., if it's a "Vegan Restaurant", steps must mention "Health Permits", "Menu Design", "Supplier Sourcing", NOT just "Get licenses").
      2.  **Specific Platforms & Tools:** Recommend tools relevant to the Iranian market (e.g., "Divar/Sheypoor" for ads, "ZarinPal" for payments, "Bale/Eitaa/Telegram" for community).
      3.  **Actionable Steps:** Every step must start with a verb and be a clear task.
          - ❌ BAD: "Marketing Phase"
          - ✅ GOOD: "Launch an Instagram campaign targeting [Audience] in Tehran"
      4.  **Realistic Timeline:** Estimate hours based on the complexity of the specific task.

      **TRANSLATION & FORMAT RULES:**
      1.  **Strictly Persian:** All output MUST be in natural, professional Persian (Farsi).
      2.  **Glossary Compliance:** You MUST use the following technical term translations:
          ${JSON.stringify(businessGlossary, null, 2)}
      3.  **Phase Names:** Use descriptive Persian names for phases (e.g., "فاز ۱: تحقیقات بازار و اعتبارسنجی", "فاز ۲: ساخت نمونه اولیه").
      4.  **JSON Only:** Output raw JSON with no markdown formatting.

      **REQUIRED JSON STRUCTURE:**
      {
        "projectName": "Name (Creative & Persian)",
        "tagline": "Slogan (Catchy & Persian)",
        "overview": "A compelling 2-3 sentence executive summary of the business strategy.",
        "leanCanvas": { 
            "keyPartners": "Who are 3-5 key partners specific to this idea?", 
            "keyActivities": "What are the 3-5 critical daily activities?", 
            "keyResources": "What physical/digital resources are needed?", 
            "uniqueValue": "Why is this different from existing Iranian competitors?", 
            "customerRelations": "How will you support customers?", 
            "channels": "Where will you sell/market?", 
            "customerSegments": "Detailed persona definition", 
            "costStructure": "Main cost centers", 
            "revenueStream": "How exactly does it make money?" 
        },
        "brandKit": { 
            "primaryColorHex": "#HEX", 
            "secondaryColorHex": "#HEX", 
            "colorPsychology": "Why these colors fit this specific industry?", 
            "suggestedFont": "Name of a suitable Persian font (e.g., Vazir, Yekan, Shabnam)", 
            "logoConcepts": ["Concept 1 description", "Concept 2 description"] 
        },
        "roadmap": [ 
            { 
                "phase": "Phase Name", 
                "steps": [ 
                    { 
                        "title": "Actionable Step Title", 
                        "description": "Specific how-to guide for this step. Mention specific tools/sites if applicable.", 
                        "estimatedHours": 10, 
                        "priority": "high", 
                        "category": "legal/marketing/tech/product", 
                        "status": "todo", 
                        "checklist": ["Sub-task 1", "Sub-task 2"], 
                        "tips": ["Expert tip 1", "Expert tip 2"] 
                    } 
                ] 
            } 
        ],
        "marketingStrategy": [
            { "channel": "Channel Name", "tactic": "Specific tactic for this business", "cost": "low/medium/high" }
        ],
        "competitors": [
            { "name": "Competitor Name", "strength": "What they do well", "weakness": "Where you can win" }
        ]
      }
    `;

    const result = await callOpenRouter(
      `طرح کسب‌وکار جامع JSON فارسی برای: ${idea}`,
      {
        systemPrompt,
        maxTokens: 8000,
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
      console.error("Raw AI Content:", result.content);
      
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
