import prisma from "@/lib/prisma";
import { Prisma } from "../../prisma/client";
import { analyzeCompetitorsAction } from "@/lib/ai-actions";
import { callCopilotChat } from "@/lib/openrouter";
import { parseJsonFromAI } from "@/lib/openrouter";

// === Tool action audit (AiActionLog) ===

interface ToolContext {
  userId?: string;
  conversationId?: string;
}

// === Pillar- and mode-aware tool selection ===

const PILLAR_TOOLS: Record<string, string[]> = {
  startup: [
    "update_business_plan", "create_pitch_deck_slide", "update_pitch_deck_slide",
    "search_competitors", "update_swot_analysis", "save_memory",
    "update_step_status", "add_roadmap_step", "add_step_note", "add_canvas_card",
  ],
  traditional: [
    "update_business_plan", "search_competitors", "update_swot_analysis", "save_memory",
    "update_step_status", "add_roadmap_step", "add_step_note", "add_canvas_card",
    "toggle_permit", "analyze_location", "compare_locations",
  ],
  creator: [
    "save_memory", "update_step_status", "add_roadmap_step", "add_step_note",
    "add_canvas_card", "create_content_post", "move_content_post", "create_script",
  ],
  default: [
    "update_business_plan", "create_pitch_deck_slide", "update_pitch_deck_slide",
    "search_competitors", "update_swot_analysis", "save_memory",
    "update_step_status", "add_roadmap_step", "add_step_note", "add_canvas_card",
  ],
};

/**
 * Returns the tool subset the model is allowed to call, gated by project pillar
 * and Copilot mode. `insights` mode is read-only (no tools); `customer_bot` only
 * keeps memory tooling for now; `cofounder` gets the full pillar-appropriate set.
 */
export function getCopilotTools(projectType: string, mode: string): any[] {
  if (mode === "insights") return [];
  if (mode === "customer_bot") {
    return COPILOT_TOOLS.filter((t) => t.function.name === "save_memory");
  }
  const allowed = PILLAR_TOOLS[projectType] || PILLAR_TOOLS.default;
  return COPILOT_TOOLS.filter((t) => allowed.includes(t.function.name));
}

async function logAiAction(params: {
  userId?: string;
  projectId: string;
  conversationId?: string;
  toolName: string;
  args: unknown;
  result: unknown;
  status: "success" | "error";
  undoPayload?: unknown;
}): Promise<string | undefined> {
  try {
    const log = await prisma.aiActionLog.create({
      data: {
        userId: params.userId as string,
        projectId: params.projectId,
        conversationId: params.conversationId,
        toolName: params.toolName,
        args: params.args as any,
        result: params.result as any,
        status: params.status,
        undoPayload: (params.undoPayload as any) ?? undefined,
      },
    });
    return log.id;
  } catch (err) {
    console.error("logAiAction failed (non-fatal):", err);
    return undefined;
  }
}

// Undo functions keyed by tool name. Each reverts a prior action using its
// stored undoPayload. Registered so the undo API can dispatch generically.
const UNDO_REGISTRY: Record<string, (projectId: string, payload: any) => Promise<void>> = {};

export async function undoAiAction(actionId: string, userId: string): Promise<{ success: boolean; message: string }> {
  const log = await prisma.aiActionLog.findFirst({
    where: { id: actionId, userId },
    select: { id: true, projectId: true, toolName: true, undoPayload: true, status: true },
  });
  if (!log) return { success: false, message: "عملیات یافت نشد" };
  if (log.status === "reverted") return { success: false, message: "این عملیات قبلاً بازگردانده شده است" };
  if (!log.projectId) return { success: false, message: "عملیات قابل بازگردانی نیست" };
  const undo = UNDO_REGISTRY[log.toolName];
  if (!undo || !log.undoPayload) return { success: false, message: "بازگردانی برای این عملیات پشتیبانی نمی‌شود" };

  try {
    await undo(log.projectId, log.undoPayload);
    await prisma.aiActionLog.update({
      where: { id: actionId },
      data: { status: "reverted" },
    });
    return { success: true, message: "عملیات با موفقیت بازگردانده شد" };
  } catch (err: any) {
    return { success: false, message: err.message || "خطا در بازگردانی" };
  }
}

// === Tool Definitions ===

export const COPILOT_TOOLS = [
  {
    type: "function",
    function: {
      name: "update_business_plan",
      description: "Update specific sections of the user's Business Plan / Lean Canvas. Use this when the user asks to fill or improve a section.",
      parameters: {
        type: "object",
        properties: {
          problem: { type: "string", description: "The 'Problem' section content" },
          solution: { type: "string", description: "The 'Solution' section content" },
          value_proposition: { type: "string", description: "The 'Unique Value Proposition' section content" },
          unfair_advantage: { type: "string", description: "The 'Unfair Advantage' section content" },
          customer_segments: { type: "string", description: "The 'Customer Segments' section content" },
          channels: { type: "string", description: "The 'Channels' section content" },
          revenue_streams: { type: "string", description: "The 'Revenue Streams' section content" },
          cost_structure: { type: "string", description: "The 'Cost Structure' section content" },
          key_metrics: { type: "string", description: "The 'Key Metrics' section content" },
          customer_relations: { type: "string", description: "The 'Customer Relations' section content" },
        },
        required: [], 
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_pitch_deck_slide",
      description: "Create a new slide for the user's Pitch Deck.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "The title of the slide (e.g., 'Market Size', 'The Team')" },
          bullets: { 
            type: "array", 
            items: { type: "string" },
            description: "List of bullet points for the slide content"
          },
          type: { 
            type: "string", 
            enum: ["title", "problem", "solution", "market", "business_model", "competition", "roadmap", "team", "ask", "closing", "traction", "product", "gtm", "financials", "use_of_funds", "vision", "moat", "generic"],
            description: "The type of slide layout to use"
          }
        },
        required: ["title", "bullets", "type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "update_pitch_deck_slide",
      description: "Update the content of an existing Pitch Deck slide. Use this when the user asks to improve or fill a specific slide.",
      parameters: {
        type: "object",
        properties: {
          slideId: { type: "string", description: "The ID of the slide to update" },
          title: { type: "string", description: "The new title (optional)" },
          bullets: { 
            type: "array", 
            items: { type: "string" },
            description: "The new list of bullet points"
          },
          notes: { type: "string", description: "Speaker notes for the slide (optional)" }
        },
        required: ["slideId", "bullets"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_competitors",
      description: "Research real competitors using live web data and generate a market SWOT analysis for the user's project. Grounded via Perplexity Sonar. Use this when the user asks about competitors, market rivals, or competitive analysis.",
      parameters: {
        type: "object",
        properties: {
          projectName: { type: "string", description: "The name of the project" },
          projectIdea: { type: "string", description: "The core business idea" },
          audience: { type: "string", description: "Target audience" }
        },
        required: ["projectName", "projectIdea", "audience"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_swot_analysis",
      description: "Update the SWOT Analysis canvas. Use this when the user asks to update or add strengths, weaknesses, opportunities, or threats.",
      parameters: {
        type: "object",
        properties: {
          strengths: { type: "array", items: { type: "string" }, description: "Strengths list in Persian" },
          weaknesses: { type: "array", items: { type: "string" }, description: "Weaknesses list in Persian" },
          opportunities: { type: "array", items: { type: "string" }, description: "Opportunities list in Persian" },
          threats: { type: "array", items: { type: "string" }, description: "Threats list in Persian" }
        },
        required: []
      }
    }
  },
  {
    type: "function",
    function: {
      name: "save_memory",
      description: "Save a durable fact, decision, risk, or open question to the project's long-term memory so it can be referenced in future conversations. Use this when the user makes a firm decision, states an important constraint, or raises a key question/risk worth remembering.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["decision", "openQuestion", "risk", "keyFact"],
            description: "The memory category: decision (a choice the user made), openQuestion (an unresolved question), risk (a risk to track), keyFact (an important fact/constraint)."
          },
          content: { type: "string", description: "The content to remember, written concisely in Persian." },
          severity: { type: "string", enum: ["low", "medium", "high"], description: "Severity (only relevant for risks)." }
        },
        required: ["category", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_step_status",
      description: "Update the status of a roadmap step (e.g. mark a step as in-progress or done). Use the step title to identify it.",
      parameters: {
        type: "object",
        properties: {
          stepTitle: { type: "string", description: "The title of the roadmap step to update." },
          status: { type: "string", enum: ["todo", "in-progress", "done", "blocked"], description: "The new status." }
        },
        required: ["stepTitle", "status"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_roadmap_step",
      description: "Add a new step to a roadmap phase. Use when the user asks to add a task/milestone to their plan.",
      parameters: {
        type: "object",
        properties: {
          phaseTitle: { type: "string", description: "The title of the phase to add the step to (use the first phase if unsure)." },
          title: { type: "string", description: "The title of the new step in Persian." },
          priority: { type: "string", enum: ["high", "medium", "low"], description: "Priority of the step." },
          description: { type: "string", description: "Short description of the step (optional)." }
        },
        required: ["phaseTitle", "title"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_step_note",
      description: "Append a note to an existing roadmap step identified by its title.",
      parameters: {
        type: "object",
        properties: {
          stepTitle: { type: "string", description: "The title of the roadmap step." },
          note: { type: "string", description: "The note to append in Persian." }
        },
        required: ["stepTitle", "note"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_canvas_card",
      description: "Add a card to a section of the business canvas (Lean Canvas for startup/traditional, Brand Canvas for creator). Use when the user asks to add an idea to a specific canvas block.",
      parameters: {
        type: "object",
        properties: {
          section: { type: "string", description: "The canvas section key, e.g. 'problem', 'solution', 'uniqueValue', 'customerSegments', 'channels', 'revenueStream', 'costStructure' (Lean) or brand sections for creator." },
          content: { type: "string", description: "The content of the card in Persian." }
        },
        required: ["section", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_content_post",
      description: "Create a new content post in the creator's content calendar. Use when the user asks to schedule or plan a post/reel/video.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Post title in Persian." },
          platform: { type: "string", enum: ["instagram", "youtube", "linkedin", "twitter", "tiktok", "telegram", "blog", "podcast"], description: "Publishing platform." },
          type: { type: "string", enum: ["post", "reel", "story", "video", "thread", "short", "episode", "article"], description: "Content type." },
          status: { type: "string", enum: ["idea", "scripting", "filming", "editing", "scheduled", "published"], description: "Initial status (default 'idea')." },
          date: { type: "string", description: "ISO date (YYYY-MM-DD) for the post." },
          caption: { type: "string", description: "Draft caption in Persian (optional)." },
          tags: { type: "array", items: { type: "string" }, description: "Tag list (optional)." }
        },
        required: ["title", "platform", "type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "move_content_post",
      description: "Change the status of an existing content post (e.g. move from 'idea' to 'scheduled'). Identify the post by its title.",
      parameters: {
        type: "object",
        properties: {
          postTitle: { type: "string", description: "The title of the content post to move." },
          status: { type: "string", enum: ["idea", "scripting", "filming", "editing", "scheduled", "published"], description: "The new status." }
        },
        required: ["postTitle", "status"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_script",
      description: "Create a new content script for the creator. Use when the user asks to write a script for a post/video.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Script title in Persian." },
          content: { type: "string", description: "The full script text in Persian (can include scene breakdowns)." },
          template: { type: "string", description: "Optional template name e.g. 'viral-hook', 'tutorial'." }
        },
        required: ["title", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "toggle_permit",
      description: "Update the status of a regulatory permit for a traditional business. Identify the permit by its title.",
      parameters: {
        type: "object",
        properties: {
          permitTitle: { type: "string", description: "The title of the permit." },
          status: { type: "string", enum: ["not_started", "in_progress", "done"], description: "The new permit status." }
        },
        required: ["permitTitle", "status"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "analyze_location",
      description:
        "Run or summarize location analysis for a traditional business. Provide city, address, and business description.",
      parameters: {
        type: "object",
        properties: {
          city: { type: "string", description: "City name e.g. Tehran" },
          address: { type: "string", description: "Neighborhood or street address" },
          businessDescription: {
            type: "string",
            description: "Free-text business type e.g. specialty coffee shop",
          },
        },
        required: ["city", "address", "businessDescription"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "compare_locations",
      description:
        "Compare saved location analyses by createdAt timestamps or summarize comparison for the user.",
      parameters: {
        type: "object",
        properties: {
          createdAtIds: {
            type: "array",
            items: { type: "string" },
            description: "createdAt values from locationHistory to compare (max 3)",
          },
        },
        required: ["createdAtIds"],
      },
    },
  },
];

// === Tool Executors ===

async function checkProjectWriteAccess(projectId: string, userId?: string): Promise<boolean> {
    if (!userId) return true;
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { 
            userId: true,
            members: {
                where: { userId }
            }
        }
    });
    if (!project) return false;
    if (project.userId === userId) return true;
    const membership = project.members?.[0];
    return !!(membership && (membership.role === 'admin' || membership.role === 'editor'));
}

export async function executeUpdateBusinessPlan(projectId: string, args: any, userId?: string) {
    if (!projectId) throw new Error("Project ID required");

    const hasAccess = await checkProjectWriteAccess(projectId, userId);
    if (!hasAccess) throw new Error("Unauthorized access to project");

    const project = await prisma.project.findFirst({
        where: { id: projectId },
        select: { data: true }
    });

    if (!project) throw new Error("Project not found");

    const currentData = (project.data as any) || {};
    const currentCanvas = currentData.leanCanvas || {};

    const newCanvas = { ...currentCanvas };

    // Helper to update a section which might be string or CanvasCard[]
    const updateSection = (key: string, content: string) => {
        const existing = currentCanvas[key];
        
        // If it's an array (Canvas Cards), add a new card
        if (Array.isArray(existing)) {
            const newCard = {
                id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                content: content,
                color: 'blue', // Default color for AI cards
                order: existing.length
            };
            newCanvas[key] = [...existing, newCard];
        } 
        // If it's a string (Legacy or empty), append or set
        else if (typeof existing === 'string') {
             newCanvas[key] = content;
        } else {
             // If undefined/null, initialize as Array of Cards (Upgrade default)
             const newCard = {
                id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                content: content,
                color: 'blue',
                order: 0
            };
            newCanvas[key] = [newCard];
        }
    };

    if (args.problem) updateSection('problem', args.problem);
    if (args.solution) updateSection('solution', args.solution);
    if (args.value_proposition) updateSection('uniqueValue', args.value_proposition);
    if (args.unfair_advantage) updateSection('unfairAdvantage', args.unfair_advantage);
    if (args.customer_segments) updateSection('customerSegments', args.customer_segments);
    if (args.channels) updateSection('channels', args.channels);
    if (args.revenue_streams) updateSection('revenueStream', args.revenue_streams);
    if (args.cost_structure) updateSection('costStructure', args.cost_structure);
    if (args.key_metrics) updateSection('keyMetrics', args.key_metrics);
    if (args.customer_relations || args.customerRelations) updateSection('customerRelations', args.customer_relations || args.customerRelations);

    const newData = {
        ...currentData,
        leanCanvas: newCanvas
    };

    await prisma.project.update({
        where: { id: projectId },
        data: { data: newData }
    });

    return { success: true, message: "Business Plan updated with new cards/content." };
}

export async function executeCreatePitchDeckSlide(projectId: string, args: any, userId?: string) {
     if (!projectId) throw new Error("Project ID required");

     const hasAccess = await checkProjectWriteAccess(projectId, userId);
     if (!hasAccess) throw new Error("Unauthorized access to project");

     const project = await prisma.project.findFirst({
        where: { id: projectId },
        select: { data: true }
    });

    if (!project) throw new Error("Project not found");

    const { migratePitchDeck, normalizeSlide } = await import("@/lib/pitch-deck/migrate");
    const { computeReadiness } = await import("@/lib/pitch-deck/readiness");

    const currentData = (project.data as any) || {};
    const deck = migratePitchDeck(currentData.pitchDeck);

    const newSlide = normalizeSlide({
        id: `slide_${Date.now()}`,
        title: args.title,
        bullets: args.bullets,
        type: args.type,
        isHidden: false,
        notes: args.notes,
    }, deck.slides.length);

    const nextDeck = { ...deck, slides: [...deck.slides, newSlide] };
    nextDeck.readiness = computeReadiness(nextDeck);

    const newData = {
        ...currentData,
        pitchDeck: nextDeck
    };

    await prisma.project.update({
        where: { id: projectId },
        data: { data: newData }
    });

    return { success: true, message: "Slide added to Pitch Deck." };
}

export async function executeUpdatePitchDeckSlide(projectId: string, args: any, userId?: string) {
    if (!projectId) throw new Error("Project ID required");
    if (!args.slideId) throw new Error("Slide ID required");

    const hasAccess = await checkProjectWriteAccess(projectId, userId);
    if (!hasAccess) throw new Error("Unauthorized access to project");

    const project = await prisma.project.findFirst({
       where: { id: projectId },
       select: { data: true }
   });

   if (!project) throw new Error("Project not found");

   const { migratePitchDeck, normalizeSlide } = await import("@/lib/pitch-deck/migrate");
   const { computeReadiness } = await import("@/lib/pitch-deck/readiness");

   const currentData = (project.data as any) || {};
   const deck = migratePitchDeck(currentData.pitchDeck);

   const slideIndex = deck.slides.findIndex((s: any) => s.id === args.slideId);
   if (slideIndex === -1) throw new Error("Slide not found");

   const updatedSlide = normalizeSlide({
       ...deck.slides[slideIndex],
       ...(args.title && { title: args.title }),
       ...(args.bullets && { bullets: args.bullets }),
       ...(args.notes && { notes: args.notes }),
       userOverrides: Array.from(
         new Set([
           ...(deck.slides[slideIndex].userOverrides || []),
           ...(args.title ? ["title"] : []),
           ...(args.bullets ? ["bullets"] : []),
         ])
       ),
   }, slideIndex);

   const newSlides = [...deck.slides];
   newSlides[slideIndex] = updatedSlide;
   const nextDeck = { ...deck, slides: newSlides };
   nextDeck.readiness = computeReadiness(nextDeck);

   const newData = {
       ...currentData,
       pitchDeck: nextDeck
   };

   await prisma.project.update({
       where: { id: projectId },
       data: { data: newData }
   });

   return { success: true, message: `Slide "${updatedSlide.title}" updated successfully.` };
}

export async function executeSearchCompetitors(projectId: string, args: any, userId?: string) {
    // skipLimitCheck: the Copilot route already incremented the monthly quota
    // for this user message, so we must not double-charge here.
    const result = await analyzeCompetitorsAction(
        {
            projectName: args.projectName,
            projectIdea: args.projectIdea,
            audience: args.audience
        },
        { skipLimitCheck: true }
    );

    if (!result.success) {
        throw new Error(result.error || "خطا در تحلیل رقبا");
    }

    return { 
        success: true, 
        message: "حریفان و رقبای استارتاپ شما شناسایی و تحلیل شدند.",
        competitors: result.data.competitors,
        swot: result.data.swot
    };
}

export async function executeUpdateSwotAnalysis(projectId: string, args: any, userId?: string) {
    if (!projectId) throw new Error("Project ID required");

    const hasAccess = await checkProjectWriteAccess(projectId, userId);
    if (!hasAccess) throw new Error("Unauthorized access to project");

    const project = await prisma.project.findFirst({
        where: { id: projectId },
        select: { data: true }
    });

    if (!project) throw new Error("Project not found");

    const currentData = (project.data as any) || {};
    const currentSwot = currentData.swotAnalysis || { strengths: [], weaknesses: [], opportunities: [], threats: [] };

    const newSwot = {
        strengths: args.strengths || currentSwot.strengths || [],
        weaknesses: args.weaknesses || currentSwot.weaknesses || [],
        opportunities: args.opportunities || currentSwot.opportunities || [],
        threats: args.threats || currentSwot.threats || []
    };

    const newData = {
        ...currentData,
        swotAnalysis: newSwot
    };

    await prisma.project.update({
        where: { id: projectId },
        data: { data: newData }
    });

    return { success: true, message: "بوم تحلیل SWOT پروژه شما با موفقیت به‌روزرسانی شد.", swot: newSwot };
}

export async function executeSaveMemory(projectId: string, args: any, userId?: string) {
    if (!projectId) throw new Error("Project ID required");
    const { category, content, severity } = args as {
        category: "decision" | "openQuestion" | "risk" | "keyFact";
        content: string;
        severity?: "low" | "medium" | "high";
    };
    if (!category || !content) throw new Error("category and content are required");

    const memory = await prisma.projectMemory.findUnique({ where: { projectId } });
    const entry = {
        id: `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        content,
        severity: severity || undefined,
        date: new Date().toISOString(),
    };

    const fieldMap = {
        decision: "decisions",
        openQuestion: "openQuestions",
        risk: "risks",
        keyFact: "keyFacts",
    } as const;
    const field = fieldMap[category];

    const current = (memory?.[field as keyof typeof memory] as any[]) || [];
    const updated = [...current, entry];

    if (memory) {
        await prisma.projectMemory.update({
            where: { projectId },
            data: { [field]: updated },
        });
    } else {
        await prisma.projectMemory.create({
            data: { projectId, [field]: updated },
        });
    }

    const labels: Record<typeof category, string> = {
        decision: "تصمیم",
        openQuestion: "پرسش باز",
        risk: "ریسک",
        keyFact: "حقیقت کلیدی",
    };
    return {
        success: true,
        message: `${labels[category]} در حافظه پروژه ذخیره شد.`,
        category,
        entry,
    };
}

// === Phase 2: Pillar-scoped tools (roadmap, canvas, creator, traditional) ===
// Each write tool mutates Project.data, records an AiActionLog with an
// undoPayload, and registers an undo function so the user can revert.

async function getProjectData(projectId: string): Promise<any> {
    const project = await prisma.project.findFirst({
        where: { id: projectId },
        select: { data: true },
    });
    if (!project) throw new Error("Project not found");
    return (project.data as any) || {};
}

async function setProjectData(projectId: string, data: any): Promise<void> {
    await prisma.project.update({ where: { id: projectId }, data: { data } });
}

function findStep(data: any, stepTitle: string) {
    const roadmap: any[] = Array.isArray(data.roadmap) ? data.roadmap : [];
    for (let pi = 0; pi < roadmap.length; pi++) {
        const steps = Array.isArray(roadmap[pi]?.steps) ? roadmap[pi].steps : [];
        for (let si = 0; si < steps.length; si++) {
            const s = steps[si];
            const title = typeof s === "string" ? s : s?.title;
            if (title && String(title).trim() === String(stepTitle).trim()) {
                return { phaseIndex: pi, stepIndex: si, step: typeof s === "string" ? { title: s } : s };
            }
        }
    }
    return null;
}

export async function executeUpdateStepStatus(
    projectId: string,
    args: any,
    userId?: string,
    ctx?: ToolContext
) {
    if (!projectId) throw new Error("Project ID required");
    const hasAccess = await checkProjectWriteAccess(projectId, userId);
    if (!hasAccess) throw new Error("Unauthorized access to project");

    const data = await getProjectData(projectId);
    const found = findStep(data, args.stepTitle);
    if (!found) throw new Error("گام نقشه راه یافت نشد");

    const roadmap = [...data.roadmap];
    const steps = [...roadmap[found.phaseIndex].steps];
    const prevStep = steps[found.stepIndex];
    const previousStatus =
        typeof prevStep === "object" ? prevStep.status || "todo" : "todo";

    const stepObj = typeof prevStep === "string" ? { title: prevStep } : { ...prevStep };
    stepObj.status = args.status;
    stepObj.id = stepObj.id || `step_${Date.now()}`;
    steps[found.stepIndex] = stepObj;
    roadmap[found.phaseIndex] = { ...roadmap[found.phaseIndex], steps };
    const newData = { ...data, roadmap };

    // Keep completedSteps in sync for done<->other transitions.
    let completedSteps: string[] = Array.isArray(data.completedSteps) ? [...data.completedSteps] : [];
    const stepId = stepObj.id;
    if (args.status === "done" && !completedSteps.includes(stepId)) {
        completedSteps.push(stepId);
    } else if (args.status !== "done") {
        completedSteps = completedSteps.filter((id) => id !== stepId);
    }
    newData.completedSteps = completedSteps;

    await setProjectData(projectId, newData);

    const actionId = await logAiAction({
        userId, projectId, conversationId: ctx?.conversationId,
        toolName: "update_step_status", args, result: { status: args.status },
        status: "success",
        undoPayload: { stepTitle: args.stepTitle, previousStatus },
    });

    return { success: true, message: `گام «${args.stepTitle}» به وضعیت «${args.status}» تغییر یافت.`, actionId };
}
UNDO_REGISTRY["update_step_status"] = async (projectId, payload) => {
    const data = await getProjectData(projectId);
    const found = findStep(data, payload.stepTitle);
    if (!found) return;
    const roadmap = [...data.roadmap];
    const steps = [...roadmap[found.phaseIndex].steps];
    const prev = steps[found.stepIndex];
    const stepObj = typeof prev === "string" ? { title: prev } : { ...prev };
    stepObj.status = payload.previousStatus;
    steps[found.stepIndex] = stepObj;
    roadmap[found.phaseIndex] = { ...roadmap[found.phaseIndex], steps };
    await setProjectData(projectId, { ...data, roadmap });
};

export async function executeAddRoadmapStep(
    projectId: string,
    args: any,
    userId?: string,
    ctx?: ToolContext
) {
    if (!projectId) throw new Error("Project ID required");
    const hasAccess = await checkProjectWriteAccess(projectId, userId);
    if (!hasAccess) throw new Error("Unauthorized access to project");

    const data = await getProjectData(projectId);
    const roadmap: any[] = Array.isArray(data.roadmap) ? data.roadmap : [];
    const phaseIndex = roadmap.findIndex(
        (p) => String(p?.phase || p?.title || "").trim() === String(args.phaseTitle).trim()
    );
    if (phaseIndex === -1) throw new Error("فاز نقشه راه یافت نشد");

    const stepId = `step_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newStep = {
        id: stepId,
        title: args.title,
        description: args.description || "",
        priority: args.priority || "medium",
        status: "todo",
    };

    const newRoadmap = [...roadmap];
    const phase = { ...newRoadmap[phaseIndex] };
    phase.steps = [...(phase.steps || []), newStep];
    newRoadmap[phaseIndex] = phase;

    await setProjectData(projectId, { ...data, roadmap: newRoadmap });

    const actionId = await logAiAction({
        userId, projectId, conversationId: ctx?.conversationId,
        toolName: "add_roadmap_step", args, result: { stepId },
        status: "success",
        undoPayload: { phaseIndex, stepId },
    });

    return { success: true, message: `گام «${args.title}» به فاز «${args.phaseTitle}» اضافه شد.`, actionId };
}
UNDO_REGISTRY["add_roadmap_step"] = async (projectId, payload) => {
    const data = await getProjectData(projectId);
    const roadmap = [...data.roadmap];
    const phase = roadmap[payload.phaseIndex];
    if (!phase) return;
    phase.steps = (phase.steps || []).filter((s: any) => (s?.id || (typeof s === "string" ? s : "")) !== payload.stepId);
    roadmap[payload.phaseIndex] = { ...phase };
    await setProjectData(projectId, { ...data, roadmap });
};

export async function executeAddStepNote(
    projectId: string,
    args: any,
    userId?: string,
    ctx?: ToolContext
) {
    if (!projectId) throw new Error("Project ID required");
    const hasAccess = await checkProjectWriteAccess(projectId, userId);
    if (!hasAccess) throw new Error("Unauthorized access to project");

    const data = await getProjectData(projectId);
    const found = findStep(data, args.stepTitle);
    if (!found) throw new Error("گام نقشه راه یافت نشد");

    const roadmap = [...data.roadmap];
    const steps = [...roadmap[found.phaseIndex].steps];
    const prev = steps[found.stepIndex];
    const stepObj = typeof prev === "string" ? { title: prev } : { ...prev };
    const prevNotes = stepObj.notes || "";
    stepObj.notes = prevNotes ? `${prevNotes}\n${args.note}` : args.note;
    steps[found.stepIndex] = stepObj;
    roadmap[found.phaseIndex] = { ...roadmap[found.phaseIndex], steps };
    await setProjectData(projectId, { ...data, roadmap });

    const actionId = await logAiAction({
        userId, projectId, conversationId: ctx?.conversationId,
        toolName: "add_step_note", args, result: { note: args.note },
        status: "success",
        undoPayload: { stepTitle: args.stepTitle, previousNotes: prevNotes },
    });

    return { success: true, message: `یادداشت به گام «${args.stepTitle}» اضافه شد.`, actionId };
}
UNDO_REGISTRY["add_step_note"] = async (projectId, payload) => {
    const data = await getProjectData(projectId);
    const found = findStep(data, payload.stepTitle);
    if (!found) return;
    const roadmap = [...data.roadmap];
    const steps = [...roadmap[found.phaseIndex].steps];
    const prev = steps[found.stepIndex];
    const stepObj = typeof prev === "string" ? { title: prev } : { ...prev };
    stepObj.notes = payload.previousNotes;
    steps[found.stepIndex] = stepObj;
    roadmap[found.phaseIndex] = { ...roadmap[found.phaseIndex], steps };
    await setProjectData(projectId, { ...data, roadmap });
};

export async function executeAddCanvasCard(
    projectId: string,
    args: any,
    userId?: string,
    ctx?: ToolContext
) {
    if (!projectId) throw new Error("Project ID required");
    const hasAccess = await checkProjectWriteAccess(projectId, userId);
    if (!hasAccess) throw new Error("Unauthorized access to project");

    const data = await getProjectData(projectId);
    const isCreator = data.projectType === "creator";
    const canvasKey = isCreator ? "brandCanvas" : "leanCanvas";
    const canvas = { ...(data[canvasKey] || {}) };
    const section = args.section;
    const existing = canvas[section];

    const cardId = `card_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const card = { id: cardId, content: args.content, color: "blue", order: Array.isArray(existing) ? existing.length : 0 };

    if (Array.isArray(existing)) {
        canvas[section] = [...existing, card];
    } else if (typeof existing === "string") {
        canvas[section] = [{ ...card, content: existing + " / " + args.content }];
    } else {
        canvas[section] = [card];
    }

    const newData = { ...data, [canvasKey]: canvas };
    await setProjectData(projectId, newData);

    const actionId = await logAiAction({
        userId, projectId, conversationId: ctx?.conversationId,
        toolName: "add_canvas_card", args, result: { cardId },
        status: "success",
        undoPayload: { canvasKey, section, cardId },
    });

    return { success: true, message: `کارت به بخش «${section}» اضافه شد.`, actionId };
}
UNDO_REGISTRY["add_canvas_card"] = async (projectId, payload) => {
    const data = await getProjectData(projectId);
    const canvas = { ...(data[payload.canvasKey] || {}) };
    const section = payload.section;
    if (Array.isArray(canvas[section])) {
        canvas[section] = canvas[section].filter((c: any) => c?.id !== payload.cardId);
        await setProjectData(projectId, { ...data, [payload.canvasKey]: canvas });
    }
};

export async function executeCreateContentPost(
    projectId: string,
    args: any,
    userId?: string,
    ctx?: ToolContext
) {
    if (!projectId) throw new Error("Project ID required");
    const hasAccess = await checkProjectWriteAccess(projectId, userId);
    if (!hasAccess) throw new Error("Unauthorized access to project");

    const data = await getProjectData(projectId);
    const posts: any[] = Array.isArray(data.contentCalendar) ? data.contentCalendar : [];
    const postId = `post_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newPost = {
        id: postId,
        title: args.title,
        platform: args.platform,
        type: args.type,
        status: args.status || "idea",
        date: args.date || new Date().toISOString().slice(0, 10),
        caption: args.caption || "",
        tags: args.tags || [],
        checklist: { script: false, filmed: false, edited: false, captionReady: false, hashtagsReady: false, thumbnailReady: false },
    };
    await setProjectData(projectId, { ...data, contentCalendar: [...posts, newPost] });

    const actionId = await logAiAction({
        userId, projectId, conversationId: ctx?.conversationId,
        toolName: "create_content_post", args, result: { postId },
        status: "success",
        undoPayload: { postId },
    });

    return { success: true, message: `پست «${args.title}» به تقویم محتوا اضافه شد.`, actionId };
}
UNDO_REGISTRY["create_content_post"] = async (projectId, payload) => {
    const data = await getProjectData(projectId);
    const posts = (Array.isArray(data.contentCalendar) ? data.contentCalendar : []).filter(
        (p: any) => p?.id !== payload.postId
    );
    await setProjectData(projectId, { ...data, contentCalendar: posts });
};

export async function executeMoveContentPost(
    projectId: string,
    args: any,
    userId?: string,
    ctx?: ToolContext
) {
    if (!projectId) throw new Error("Project ID required");
    const hasAccess = await checkProjectWriteAccess(projectId, userId);
    if (!hasAccess) throw new Error("Unauthorized access to project");

    const data = await getProjectData(projectId);
    const posts: any[] = Array.isArray(data.contentCalendar) ? data.contentCalendar : [];
    const idx = posts.findIndex((p) => String(p?.title).trim() === String(args.postTitle).trim());
    if (idx === -1) throw new Error("پست یافت نشد");

    const previousStatus = posts[idx].status;
    const newPosts = [...posts];
    newPosts[idx] = { ...posts[idx], status: args.status };
    await setProjectData(projectId, { ...data, contentCalendar: newPosts });

    const actionId = await logAiAction({
        userId, projectId, conversationId: ctx?.conversationId,
        toolName: "move_content_post", args, result: { status: args.status },
        status: "success",
        undoPayload: { postTitle: args.postTitle, previousStatus },
    });

    return { success: true, message: `پست «${args.postTitle}» به وضعیت «${args.status}» منتقل شد.`, actionId };
}
UNDO_REGISTRY["move_content_post"] = async (projectId, payload) => {
    const data = await getProjectData(projectId);
    const posts: any[] = Array.isArray(data.contentCalendar) ? data.contentCalendar : [];
    const idx = posts.findIndex((p) => String(p?.title).trim() === String(payload.postTitle).trim());
    if (idx === -1) return;
    const newPosts = [...posts];
    newPosts[idx] = { ...posts[idx], status: payload.previousStatus };
    await setProjectData(projectId, { ...data, contentCalendar: newPosts });
};

export async function executeCreateScript(
    projectId: string,
    args: any,
    userId?: string,
    ctx?: ToolContext
) {
    if (!projectId) throw new Error("Project ID required");
    const hasAccess = await checkProjectWriteAccess(projectId, userId);
    if (!hasAccess) throw new Error("Unauthorized access to project");

    const script = await prisma.script.create({
        data: {
            projectId,
            title: args.title,
            content: args.content,
            template: args.template || "viral-hook",
            status: "draft",
        },
    });

    const actionId = await logAiAction({
        userId, projectId, conversationId: ctx?.conversationId,
        toolName: "create_script", args, result: { scriptId: script.id },
        status: "success",
        undoPayload: { scriptId: script.id },
    });

    return { success: true, message: `اسکریپت «${args.title}» ذخیره شد.`, actionId };
}
UNDO_REGISTRY["create_script"] = async (_projectId, payload) => {
    try {
        await prisma.script.delete({ where: { id: payload.scriptId } });
    } catch {
        // ignore
    }
};

export async function executeTogglePermit(
    projectId: string,
    args: any,
    userId?: string,
    ctx?: ToolContext
) {
    if (!projectId) throw new Error("Project ID required");
    const hasAccess = await checkProjectWriteAccess(projectId, userId);
    if (!hasAccess) throw new Error("Unauthorized access to project");

    const data = await getProjectData(projectId);
    const permits: any[] = Array.isArray(data.permits) ? data.permits : [];
    const idx = permits.findIndex((p) => String(p?.title).trim() === String(args.permitTitle).trim());
    if (idx === -1) throw new Error("مجوز یافت نشد");

    const previousStatus = permits[idx].status;
    const newPermits = [...permits];
    newPermits[idx] = { ...permits[idx], status: args.status };
    await setProjectData(projectId, { ...data, permits: newPermits });

    const actionId = await logAiAction({
        userId, projectId, conversationId: ctx?.conversationId,
        toolName: "toggle_permit", args, result: { status: args.status },
        status: "success",
        undoPayload: { permitTitle: args.permitTitle, previousStatus },
    });

    return { success: true, message: `وضعیت مجوز «${args.permitTitle}» به «${args.status}» تغییر یافت.`, actionId };
}
UNDO_REGISTRY["toggle_permit"] = async (projectId, payload) => {
    const data = await getProjectData(projectId);
    const permits: any[] = Array.isArray(data.permits) ? data.permits : [];
    const idx = permits.findIndex((p) => String(p?.title).trim() === String(payload.permitTitle).trim());
    if (idx === -1) return;
    const newPermits = [...permits];
    newPermits[idx] = { ...permits[idx], status: payload.previousStatus };
    await setProjectData(projectId, { ...data, permits: newPermits });
};

export async function executeAnalyzeLocation(
    projectId: string,
    args: { city: string; address: string; businessDescription: string },
    userId?: string
) {
    if (!projectId) throw new Error("Project ID required");
    const hasAccess = await checkProjectWriteAccess(projectId, userId);
    if (!hasAccess) throw new Error("Unauthorized access to project");

    const project = await prisma.project.findFirst({
        where: { id: projectId },
        select: { projectName: true, description: true, data: true },
    });
    if (!project) throw new Error("Project not found");

    const activeProject = {
        id: projectId,
        projectName: project.projectName,
        overview: project.description,
        ...((project.data as any) || {}),
    };

    const { runLocationAnalysis } = await import("@/lib/location/analyze-pipeline");
    const analysis = await runLocationAnalysis({
        city: args.city,
        address: args.address,
        businessDescription: args.businessDescription,
        activeProject,
        userId,
        projectId,
    });

    return {
        success: true,
        message: `تحلیل مکان برای «${args.address}» در ${args.city} انجام شد.`,
        analysis,
    };
}

export async function executeCompareLocations(
    projectId: string,
    args: { createdAtIds: string[] },
    userId?: string
) {
    if (!projectId) throw new Error("Project ID required");
    const hasAccess = await checkProjectWriteAccess(projectId, userId);
    if (!hasAccess) throw new Error("Unauthorized access to project");

    const data = await getProjectData(projectId);
    const history: any[] = Array.isArray(data.locationHistory) ? data.locationHistory : [];
    const ids = (args.createdAtIds || []).slice(0, 3);
    const selected = history.filter((h) => ids.includes(h.createdAt));

    if (selected.length < 2) {
        return {
            success: true,
            message: "حداقل ۲ تحلیل ذخیره‌شده برای مقایسه لازم است.",
            comparison: [],
        };
    }

    const rows = selected.map((a) => ({
        address: a.address,
        score: a.score,
        verdict: a.verdict?.decision,
        createdAt: a.createdAt,
    }));

    return {
        success: true,
        message: `مقایسه ${rows.length} مکان آماده است.`,
        comparison: rows,
    };
}
