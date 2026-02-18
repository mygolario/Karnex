import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

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
            enum: ["title", "problem", "solution", "market", "business_model", "team", "generic"],
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
];

// === Tool Executors ===

export async function executeUpdateBusinessPlan(projectId: string, args: any) {
    if (!projectId) throw new Error("Project ID required");

    const project = await prisma.project.findUnique({
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
             // If it looks like it was empty, just set it. If it has content, maybe append? 
             // Actually, robust approach: Convert to Card on first AI edit? 
             // For now, let's just append text if it's a string to be safe, 
             // OR if it's empty, initialize as an array with one card to upgrade it?
             // Let's stick to: if string, keep string for now to avoid breaking UI that expects string.
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
    if (args.value_proposition) updateSection('uniqueValue', args.value_proposition); // Fixed key name match
    if (args.unfair_advantage) updateSection('unfairAdvantage', args.unfair_advantage);
    if (args.customer_segments) updateSection('customerSegments', args.customer_segments);
    if (args.channels) updateSection('channels', args.channels);
    if (args.revenue_streams) updateSection('revenueStream', args.revenue_streams);
    if (args.cost_structure) updateSection('costStructure', args.cost_structure);
    if (args.key_metrics) updateSection('keyMetrics', args.key_metrics);
    // Added Customer Relations mapping
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

export async function executeCreatePitchDeckSlide(projectId: string, args: any) {
     if (!projectId) throw new Error("Project ID required");

     const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { data: true }
    });

    if (!project) throw new Error("Project not found");

    const currentData = (project.data as any) || {};
    const currentDeck = (currentData.pitchDeck as any[]) || [];

    const newSlide = {
        id: `slide_${Date.now()}`,
        title: args.title,
        bullets: args.bullets,
        type: args.type,
        isHidden: false
    };

    const newData = {
        ...currentData,
        pitchDeck: [...currentDeck, newSlide]
    };

    await prisma.project.update({
        where: { id: projectId },
        data: { data: newData }
    });

    return { success: true, message: "Slide added to Pitch Deck." };
}

export async function executeUpdatePitchDeckSlide(projectId: string, args: any) {
    if (!projectId) throw new Error("Project ID required");
    if (!args.slideId) throw new Error("Slide ID required");

    const project = await prisma.project.findUnique({
       where: { id: projectId },
       select: { data: true }
   });

   if (!project) throw new Error("Project not found");

   const currentData = (project.data as any) || {};
   const currentDeck = (currentData.pitchDeck as any[]) || [];

   const slideIndex = currentDeck.findIndex((s: any) => s.id === args.slideId);
   if (slideIndex === -1) throw new Error("Slide not found");

   const updatedSlide = {
       ...currentDeck[slideIndex],
       ...(args.title && { title: args.title }),
       ...(args.bullets && { bullets: args.bullets }),
       ...(args.notes && { notes: args.notes }),
   };

   const newDeck = [...currentDeck];
   newDeck[slideIndex] = updatedSlide;

   const newData = {
       ...currentData,
       pitchDeck: newDeck
   };

   await prisma.project.update({
       where: { id: projectId },
       data: { data: newData }
   });

   return { success: true, message: `Slide "${updatedSlide.title}" updated successfully.` };
}
