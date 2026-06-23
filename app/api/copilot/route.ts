import { NextResponse } from 'next/server';
import { checkAILimit } from '@/lib/ai-limit-middleware';
import { 
  COPILOT_TOOLS, 
  executeUpdateBusinessPlan, 
  executeCreatePitchDeckSlide, 
  executeUpdatePitchDeckSlide,
  executeSearchCompetitors,
  executeUpdateSwotAnalysis 
} from '@/lib/ai/copilot-tools';
import prisma from '@/lib/prisma';
import { auth } from "@/auth";

export const maxDuration = 60; // Allow longer timeout for agent tool chains

function getToolStatusMessage(name: string): string {
    switch (name) {
        case 'update_business_plan': return 'به‌روزرسانی بوم مدل کسب‌وکار';
        case 'create_pitch_deck_slide': return 'ایجاد اسلاید پیچ‌دک';
        case 'update_pitch_deck_slide': return 'اصلاح اسلاید پیچ‌دک';
        case 'search_competitors': return 'جستجو و آنالیز رقبای بازار';
        case 'update_swot_analysis': return 'به‌روزرسانی جدول تحلیل SWOT';
        default: return 'پردازش عملیات';
    }
}

export async function POST(req: Request) {
  let rollback = async () => {};
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // === AI Usage Limit Check ===
    const limitResult = await checkAILimit();
    if (limitResult.errorResponse) return limitResult.errorResponse;
    rollback = limitResult.rollback;

    const { messages, projectId, context } = await req.json();

    if (!projectId) {
        return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    // Fetch Full Project Context (RLS check: project must belong to session user)
    const project = await prisma.project.findFirst({
        where: { id: projectId, userId },
        select: { 
            projectName: true,
            description: true,
            data: true,
        }
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found or unauthorized" }, { status: 404 });
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
      - You can SEARCH and analyze competitors in the market using 'search_competitors'.
      - You can UPDATE the SWOT Analysis canvas using 'update_swot_analysis'.
      - You CANNOT add tasks to the Roadmap anymore (User disabled this). Help them plan but tell them to add tasks manually if asked.
      
      RULES:
      - Always reply in Persian (Farsi).
      - ACTION OVER CHAT: If the user asks you to fill, update, or create content (like "fill this section" or "add a slide" or "analyze competitors"), YOU MUST USE THE RELEVANT TOOL IMMEDIATELY. 
      - Do NOT ask clarifying questions unless the request is completely unintelligible. Use your best judgment to generate high-quality, relevant content based on the project description.
      - If the user mentions a specific context (Slide, Task, Block) with @, assume they want you to ACTION on it.
      - Before calling a tool, keep your response short (e.g., "Sure, I'm updating the business plan for you...").
      - For Business Plan: If the user asks to "fill" a section, generate 3-5 high-quality, concise, bullet-pointed cards for that section.
    `;

    const encoder = new TextEncoder();
    
    // Create ReadableStream to stream NDJSON tokens/progress to client
    const customStream = new ReadableStream({
      async start(controller) {
        const sendJSON = (obj: any) => {
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
        };

        try {
          let currentMessages = [
              { role: "system", content: systemPrompt },
              ...messages
          ];

          let loopCount = 0;
          const maxTurns = 5;
          let finalToolResult: any = null;

          while (loopCount < maxTurns) {
              loopCount++;

              if (loopCount === 1) {
                  sendJSON({ type: "status", content: "درحال بررسی درخواست..." });
              } else {
                  sendJSON({ type: "status", content: "درحال تحلیل نتایج ابزار..." });
              }

              // Call OpenRouter with active tools list
              const openRouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                  method: "POST",
                  headers: {
                      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                      "Content-Type": "application/json",
                      "HTTP-Referer": "https://karnex.ir",
                      "X-Title": "Karnex"
                  },
                  body: JSON.stringify({
                      model: "google/gemini-2.5-pro", // Pro model for agentic loop & tool execution
                      messages: currentMessages,
                      tools: COPILOT_TOOLS,
                      tool_choice: "auto",
                      temperature: 0.7,
                  })
              });

              if (!openRouterRes.ok) {
                  const errorText = await openRouterRes.text();
                  throw new Error(`OpenRouter API error: ${errorText}`);
              }

              const aiData = await openRouterRes.json();
              const choice = aiData.choices[0];
              const responseMessage = choice.message;

              // Check if model wants to run tool calls
              if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                  currentMessages.push(responseMessage);

                  for (const toolCall of responseMessage.tool_calls) {
                      const fnName = toolCall.function.name;
                      const args = JSON.parse(toolCall.function.arguments);
                      let actionResult: any;

                      sendJSON({ type: "status", content: `درحال اجرای ابزار: ${getToolStatusMessage(fnName)}` });

                      try {
                          if (fnName === 'update_business_plan') {
                              actionResult = await executeUpdateBusinessPlan(projectId, args, userId);
                          } else if (fnName === 'create_pitch_deck_slide') {
                              actionResult = await executeCreatePitchDeckSlide(projectId, args, userId);
                          } else if (fnName === 'update_pitch_deck_slide') {
                              actionResult = await executeUpdatePitchDeckSlide(projectId, args, userId);
                          } else if (fnName === 'search_competitors') {
                              actionResult = await executeSearchCompetitors(projectId, args, userId);
                          } else if (fnName === 'update_swot_analysis') {
                              actionResult = await executeUpdateSwotAnalysis(projectId, args, userId);
                          } else {
                              actionResult = { error: "Unknown tool" };
                          }
                      } catch (err: any) {
                          console.error(`Tool execution error (${fnName}):`, err);
                          actionResult = { error: err.message };
                      }

                      finalToolResult = {
                          name: fnName,
                          status: actionResult.error ? "error" : "success",
                          result: actionResult
                      };

                      currentMessages.push({
                          role: "tool",
                          tool_call_id: toolCall.id,
                          name: fnName,
                          content: JSON.stringify(actionResult)
                      });
                  }
                  
                  // Run loop again to let agent decide next step
                  continue;
              }

              // No tool calls - this is the final response. Stream the tokens back!
              sendJSON({ type: "status", content: "درحال آماده‌سازی پاسخ نهایی..." });

              const finalStreamRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                  method: "POST",
                  headers: {
                      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                      "Content-Type": "application/json",
                      "HTTP-Referer": "https://karnex.ir",
                      "X-Title": "Karnex"
                  },
                  body: JSON.stringify({
                      model: "google/gemini-2.5-pro",
                      messages: currentMessages,
                      temperature: 0.7,
                      stream: true // Stream the final text confirmation to the user
                  })
              });

              if (!finalStreamRes.ok) {
                  const errorText = await finalStreamRes.text();
                  throw new Error(`OpenRouter Final Stream error: ${errorText}`);
              }

              const reader = finalStreamRes.body?.getReader();
              if (!reader) {
                  if (responseMessage.content) {
                      sendJSON({ type: "text", content: responseMessage.content });
                  }
                  break;
              }

              const decoder = new TextDecoder();
              let buffer = "";

              while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split("\n");
                  buffer = lines.pop() || "";

                  for (const line of lines) {
                      const cleaned = line.trim();
                      if (!cleaned || cleaned === "data: [DONE]") continue;

                      if (cleaned.startsWith("data: ")) {
                          try {
                              const parsed = JSON.parse(cleaned.substring(6));
                              const text = parsed.choices?.[0]?.delta?.content;
                              if (text) {
                                  sendJSON({ type: "text", content: text });
                              }
                          } catch (e) {
                              // Ignore parse error on chunks
                          }
                      }
                  }
              }

              break; 
          }

          if (finalToolResult) {
              sendJSON({ type: "tool_call", tool_call: finalToolResult });
          }

        } catch (err: any) {
          console.error("Agentic Loop Stream error:", err);
          sendJSON({ type: "error", error: err.message || "خطای ناخواسته در سرور" });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error: any) {
    console.error("Copilot API Route Error:", error);
    await rollback();
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
