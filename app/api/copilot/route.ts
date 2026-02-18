
import { NextResponse } from 'next/server';
import { checkAILimit } from '@/lib/ai-limit-middleware';
import { COPILOT_TOOLS, executeUpdateBusinessPlan, executeCreatePitchDeckSlide, executeUpdatePitchDeckSlide } from '@/lib/ai/copilot-tools';
import prisma from '@/lib/prisma';
import { auth } from "@/auth";

export const maxDuration = 60; // Allow longer timeout for tool execution

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // === AI Usage Limit Check ===
    const { errorResponse } = await checkAILimit();
    if (errorResponse) return errorResponse;

    const { messages, projectId, context } = await req.json();

    if (!projectId) {
        return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    // Fetch Full Project Context
    const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { 
            projectName: true,
            description: true,
            data: true,
            // Add other fields if needed
        }
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const projectData = (project.data as any) || {};

    // Construct System Prompt
    const systemPrompt = `
      You are Karnex Project Manager, an expert AI co-founder for startups.
      
      CURRENT PROJECT CONTEXT:
      - Name: ${project.projectName}
      - Description: ${project.description || 'N/A'}
      - Audience: ${projectData.audience || 'Unknown'}
      - Business Plan Status: ${projectData.leanCanvas ? 'Partially Filled' : 'Empty'}
      - Pitch Deck Slides: ${projectData.pitchDeck?.length || 0}
      
      USER CONTEXT (MENTIONED ITEMS):
      ${context ? JSON.stringify(context, null, 2) : "No specific items mentioned."}

      CAPABILITIES:
      - You can chat with the user in Persian (Farsi).
      - You can UPDATE the Business Plan directly using 'update_business_plan'.
      - You can CREATE Pitch Deck slides using 'create_pitch_deck_slide'.
      - You can UPDATE specific Pitch Deck slides using 'update_pitch_deck_slide' (only if a slide is mentioned/known).
      - You CANNOT add tasks to the Roadmap anymore (User disabled this). Help them plan but tell them to add tasks manually if asked.
      
      RULES:
      - Always reply in Persian (Farsi).
      - ACTION OVER CHAT: If the user asks you to fill, update, or create content (like "fill this section" or "add a slide"), YOU MUST USE THE RELEVANT TOOL IMMEDIATELY. 
      - Do NOT ask clarifying questions unless the request is completely unintelligible. Use your best judgment to generate high-quality, relevant content based on the project description.
      - If the user mentions a specific context (Slide, Task, Block) with @, assume they want you to ACTION on it.
      - Before calling a tool, keep your response short (e.g., "Sure, I'm updating the business plan for you...").
      - For Business Plan: If the user asks to "fill" a section, generate 3-5 high-quality, concise, bullet-pointed cards for that section.
    `;

    // Call OpenRouter with Tools
    const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://karnex.ir",
        "X-Title": "Karnex"
      },
      body: JSON.stringify({
        model: "openai/gpt-4o", // Use a model capable of strong function calling
        messages: [
            { role: "system", content: systemPrompt },
            ...messages
        ],
        tools: COPILOT_TOOLS,
        tool_choice: "auto",
        temperature: 0.7,
      })
    });

    if (!openRouterRes.ok) {
        throw new Error(`OpenRouter API error: ${openRouterRes.statusText}`);
    }

    const aiData = await openRouterRes.json();
    const message = aiData.choices[0].message;

    // Handle Tool Calls
    if (message.tool_calls && message.tool_calls.length > 0) {
        const toolCall = message.tool_calls[0];
        const fnName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        let actionResult: any;

        try {
            if (fnName === 'update_business_plan') {
                actionResult = await executeUpdateBusinessPlan(projectId, args);
            } else if (fnName === 'create_pitch_deck_slide') {
                actionResult = await executeCreatePitchDeckSlide(projectId, args);
            } else if (fnName === 'update_pitch_deck_slide') {
                actionResult = await executeUpdatePitchDeckSlide(projectId, args);
            } else {
                actionResult = { error: "Unknown tool" };
            }
        } catch (err: any) {
            console.error(`Tool execution error (${fnName}):`, err);
            actionResult = { error: err.message };
        }

        // === LOOP BACK TO AI FOR NATURAL RESPONSE ===
        // We feed the tool result back to the model so it can say "I've added the task..." naturally.
        
        const followUpMessages = [
            ...messages,
            message, // The assistant's tool_call message
            {
                role: "tool",
                tool_call_id: toolCall.id,
                name: fnName,
                content: JSON.stringify(actionResult)
            }
        ];

        const confirmationRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
              "HTTP-Referer": "https://karnex.ir",
              "X-Title": "Karnex"
            },
            body: JSON.stringify({
              model: "openai/gpt-4o",
              messages: [
                  { role: "system", content: systemPrompt },
                  ...followUpMessages
              ],
              // We generally don't want it to call tools AGAIN immediately, just confirm.
              tools: COPILOT_TOOLS, // Keep tools available just in case, or remove to force text.
              tool_choice: "none", // Force text response now
              temperature: 0.7,
            })
        });

        if (!confirmationRes.ok) {
             // Fallback if second call fails
             return NextResponse.json({
                role: "assistant",
                content: actionResult.message || "Operation completed.",
                tool_call: {
                    name: fnName,
                    status: actionResult.error ? "error" : "success",
                    result: actionResult
                }
            });
        }

        const confirmationData = await confirmationRes.json();
        const finalContent = confirmationData.choices[0].message.content;

        return NextResponse.json({
            role: "assistant",
            content: finalContent, // The natural language confirmation
            tool_call: {
                name: fnName,
                status: actionResult.error ? "error" : "success",
                result: actionResult
            }
        });
    }

    // Normal Text Response
    return NextResponse.json({
        role: "assistant",
        content: message.content
    });

  } catch (error: any) {
    console.error("Copilot API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
