import { NextResponse, after } from 'next/server';
import { checkAILimit } from '@/lib/ai-limit-middleware';
import { callCopilotChat } from '@/lib/openrouter';
import { recordAiUsage, extractUsage } from '@/lib/copilot/usage-tracking';
import { buildCopilotContext, serializeMentionedContext } from '@/lib/copilot/context';
import {
  loadUserProfile,
  loadProjectMemory,
  buildUserProfileSection,
  buildProjectMemorySection,
  extractAndSaveMemory,
} from '@/lib/copilot/memory';
import {
  getCopilotTools,
  executeUpdateBusinessPlan,
  executeCreatePitchDeckSlide,
  executeUpdatePitchDeckSlide,
  executeSearchCompetitors,
  executeUpdateSwotAnalysis,
  executeSaveMemory,
  executeUpdateStepStatus,
  executeAddRoadmapStep,
  executeAddStepNote,
  executeAddCanvasCard,
  executeCreateContentPost,
  executeMoveContentPost,
  executeCreateScript,
  executeTogglePermit,
  executeAddInventoryProduct,
  executeRecordStockMove,
  executeLogBusinessTransaction,
} from '@/lib/ai/copilot-tools';
import prisma from '@/lib/prisma';
import { auth } from "@/lib/auth/session";
import type { CopilotMode, CopilotPersona, CopilotModelTier } from "@/lib/copilot/types";

export const maxDuration = 60; // Allow longer timeout for agent tool chains

function getToolStatusMessage(name: string): string {
    switch (name) {
        case 'update_business_plan': return 'به‌روزرسانی بوم مدل کسب‌وکار';
        case 'create_pitch_deck_slide': return 'ایجاد اسلاید پیچ‌دک';
        case 'update_pitch_deck_slide': return 'اصلاح اسلاید پیچ‌دک';
        case 'search_competitors': return 'جستجو و آنالیز رقبای بازار';
        case 'update_swot_analysis': return 'به‌روزرسانی جدول تحلیل SWOT';
        case 'save_memory': return 'ذخیره در حافظه پروژه';
        case 'update_step_status': return 'به‌روزرسانی وضعیت گام نقشه راه';
        case 'add_roadmap_step': return 'افزودن گام به نقشه راه';
        case 'add_step_note': return 'افزودن یادداشت به گام';
        case 'add_canvas_card': return 'افزودن کارت به بوم';
        case 'create_content_post': return 'ایجاد پست محتوایی';
        case 'move_content_post': return 'تغییر وضعیت پست محتوا';
        case 'create_script': return 'ایجاد اسکریپت';
        case 'toggle_permit': return 'به‌روزرسانی وضعیت مجوز';
        case 'add_inventory_product': return 'افزودن محصول به موجودی';
        case 'record_stock_move': return 'ثبت ورود/خروج موجودی';
        case 'log_business_transaction': return 'ثبت تراکنش مالی';
        default: return 'پردازش عملیات';
    }
}

interface CopilotRequestBody {
  messages: { role: string; content: string }[];
  projectId?: string;
  context?: unknown;
  persona?: CopilotPersona;
  mode?: CopilotMode;
  conversationId?: string;
  tier?: CopilotModelTier;
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
    const limitResult = await checkAILimit('copilot');
    if (limitResult.errorResponse) return limitResult.errorResponse;
    rollback = limitResult.rollback;

    const body: CopilotRequestBody = await req.json();
    const { messages, projectId, context } = body;
    const persona: CopilotPersona = body.persona || "default";
    const mode: CopilotMode = body.mode || "cofounder";
    const tier: CopilotModelTier = body.tier === "fast" ? "fast" : "hard";
    const conversationIdIn = body.conversationId;

    if (!projectId) {
        return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
        return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    // Fetch Full Project Context (RLS check: project must belong to session user OR be a member)
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [
                { userId },
                { members: { some: { userId } } }
            ]
        },
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
    const projectType = projectData.projectType || "startup";

    // === Load personalization + memory (Phase 1) ===
    const [userProfile, projectMemory] = await Promise.all([
      loadUserProfile(userId),
      loadProjectMemory(projectId),
    ]);
    const userProfileSection = buildUserProfileSection(userProfile);
    const projectMemorySection = buildProjectMemorySection(projectMemory);

    // Build pillar-aware, persona/mode-aware system prompt.
    const { systemPrompt } = buildCopilotContext({
        projectName: project.projectName,
        projectDescription: project.description || "N/A",
        projectAudience: projectData.audience || "Unknown",
        projectType,
        persona,
        mode,
        mentionedContext: serializeMentionedContext(context),
        projectData,
        userProfileSection,
        projectMemorySection,
    });

    // === Resolve / create conversation ===
    let conversationId = conversationIdIn;
    if (conversationId) {
      const owned = await prisma.chatConversation.findFirst({
        where: { id: conversationId, userId },
        select: { id: true },
      });
      if (!owned) conversationId = undefined;
    }
    if (!conversationId) {
      const newConv = await prisma.chatConversation.create({
        data: {
          userId,
          projectId,
          title: deriveTitle(messages),
          mode,
          persona,
        },
      });
      conversationId = newConv.id;
    }

    // === Persist the new user message ===
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    let userMessageDbId: string | undefined;
    if (lastUserMsg) {
      const userMsg = await prisma.chatMessage.create({
        data: {
          conversationId,
          role: "user",
          content: lastUserMsg.content,
        },
      });
      userMessageDbId = userMsg.id;
    }

    const encoder = new TextEncoder();
    const clientSignal = req.signal; // propagate client disconnect/abort to the provider

    // Create ReadableStream to stream NDJSON tokens/progress to client
    const customStream = new ReadableStream({
      async start(controller) {
        const sendJSON = (obj: any) => {
          controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
        };

        // Tell the client which conversation + user message we're using.
        sendJSON({ type: "meta", conversationId, userMessageId: userMessageDbId });

        // Aggregate token usage across all model calls for this request.
        let totalPromptTokens = 0;
        let totalCompletionTokens = 0;
        let lastModelUsed = tier === "fast" ? "google/gemini-3.1-flash-lite" : "google/gemini-3.5-flash";
        let assistantContent = "";
        let finalToolResult: any = null;

        try {
          const currentMessages: any[] = [
              { role: "system", content: systemPrompt },
              ...messages
          ];

          // Pillar- and mode-aware tool set (insights mode → no tools).
          const activeTools = getCopilotTools(projectType, mode);

          let loopCount = 0;
          const maxTurns = 5;

          while (loopCount < maxTurns) {
              loopCount++;

              if (loopCount === 1) {
                  sendJSON({ type: "status", content: "درحال بررسی درخواست..." });
              } else {
                  sendJSON({ type: "status", content: "درحال تحلیل نتایج ابزار..." });
              }

              // Enable web_search only when tools aren't available (insights mode /
              // no tool set) — otherwise competitor/market tools already ground answers.
              const { response: loopRes, model: loopModel } = await callCopilotChat({
                  messages: currentMessages,
                  tools: activeTools,
                  toolChoice: activeTools.length > 0 ? "auto" : "none",
                  temperature: 0.7,
                  signal: clientSignal,
                  tier: "hard",
                  webSearch: activeTools.length === 0,
              });
              lastModelUsed = loopModel;

              const aiData = await loopRes.json();
              const usage = extractUsage(aiData);
              totalPromptTokens += usage.promptTokens;
              totalCompletionTokens += usage.completionTokens;

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
                          } else if (fnName === 'save_memory') {
                              actionResult = await executeSaveMemory(projectId, args, userId);
                          } else if (fnName === 'update_step_status') {
                              actionResult = await executeUpdateStepStatus(projectId, args, userId, { conversationId });
                          } else if (fnName === 'add_roadmap_step') {
                              actionResult = await executeAddRoadmapStep(projectId, args, userId, { conversationId });
                          } else if (fnName === 'add_step_note') {
                              actionResult = await executeAddStepNote(projectId, args, userId, { conversationId });
                          } else if (fnName === 'add_canvas_card') {
                              actionResult = await executeAddCanvasCard(projectId, args, userId, { conversationId });
                          } else if (fnName === 'create_content_post') {
                              actionResult = await executeCreateContentPost(projectId, args, userId, { conversationId });
                          } else if (fnName === 'move_content_post') {
                              actionResult = await executeMoveContentPost(projectId, args, userId, { conversationId });
                          } else if (fnName === 'create_script') {
                              actionResult = await executeCreateScript(projectId, args, userId, { conversationId });
                          } else if (fnName === 'toggle_permit') {
                              actionResult = await executeTogglePermit(projectId, args, userId, { conversationId });
                          } else if (fnName === 'add_inventory_product') {
                              actionResult = await executeAddInventoryProduct(projectId, args, userId);
                          } else if (fnName === 'record_stock_move') {
                              actionResult = await executeRecordStockMove(projectId, args, userId);
                          } else if (fnName === 'log_business_transaction') {
                              actionResult = await executeLogBusinessTransaction(projectId, args, userId);
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

              const { response: finalStreamRes, model: finalModel } = await callCopilotChat({
                  messages: currentMessages,
                  temperature: 0.7,
                  stream: true,
                  signal: clientSignal,
                  tier,
              });
              lastModelUsed = finalModel;

              const reader = finalStreamRes.body?.getReader();
              if (!reader) {
                  if (responseMessage.content) {
                      assistantContent = responseMessage.content;
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
                                  assistantContent += text;
                                  sendJSON({ type: "text", content: text });
                              }
                              if (parsed.usage) {
                                  const u = extractUsage({ usage: parsed.usage });
                                  totalPromptTokens += u.promptTokens;
                                  totalCompletionTokens += u.completionTokens;
                              }
                          } catch {
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

          // === Persist the assistant message ===
          let assistantMessageDbId: string | undefined;
          if (assistantContent.trim() || finalToolResult) {
            try {
              const assistantMsg = await prisma.chatMessage.create({
                data: {
                  conversationId,
                  role: "assistant",
                  content: assistantContent || "_(پاسخ خالی)_",
                  toolCalls: finalToolResult ? [finalToolResult] : undefined,
                  parentMessageId: userMessageDbId || null,
                },
              });
              assistantMessageDbId = assistantMsg.id;

              await prisma.chatConversation.update({
                where: { id: conversationId },
                data: {
                  lastMessagePreview: assistantContent.slice(0, 120) || (finalToolResult ? `ابزار: ${finalToolResult.name}` : "گفتگوی جدید"),
                  lastMessageAt: new Date(),
                },
              });

              // Schedule a cheap, non-blocking memory-extraction pass after the
              // response is flushed so it never delays the user's stream.
              if (lastUserMsg && assistantContent.trim()) {
                after(() =>
                  extractAndSaveMemory({
                    userId,
                    projectId,
                    conversationId,
                    userMessage: lastUserMsg.content,
                    assistantMessage: assistantContent,
                  })
                );
              }
            } catch (persistErr) {
              console.error("Failed to persist assistant message (non-fatal):", persistErr);
            }
          }

          sendJSON({ type: "meta", assistantMessageId: assistantMessageDbId });

          // Record aggregated token/cost usage for this request (non-fatal).
          await recordAiUsage({
              userId,
              projectId,
              conversationId,
              model: lastModelUsed,
              feature: "copilot_chat",
              promptTokens: totalPromptTokens,
              completionTokens: totalCompletionTokens,
              success: true,
          });

        } catch (err: any) {
          if (err?.name === "AbortError") {
            // User stopped — persist partial assistant content.
            try {
              if (assistantContent.trim()) {
                await prisma.chatMessage.create({
                  data: {
                    conversationId,
                    role: "assistant",
                    content: assistantContent + "\n\n_(متوقف شد)_",
                    parentMessageId: userMessageDbId || null,
                  },
                });
                await prisma.chatConversation.update({
                  where: { id: conversationId },
                  data: {
                    lastMessagePreview: assistantContent.slice(0, 120),
                    lastMessageAt: new Date(),
                  },
                });
              }
            } catch {
              // non-fatal
            }
            sendJSON({ type: "error", error: "stopped" });
          } else {
            console.error("Agentic Loop Stream error:", err);
            sendJSON({ type: "error", error: err.message || "خطای ناخواسته در سرور" });
          }

          // Record failed usage (non-fatal).
          await recordAiUsage({
              userId,
              projectId,
              conversationId,
              model: lastModelUsed,
              feature: "copilot_chat",
              promptTokens: totalPromptTokens,
              completionTokens: totalCompletionTokens,
              success: false,
              errorMessage: err?.message || "unknown",
          });
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

function deriveTitle(messages: { role: string; content: string }[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "گفتگوی جدید";
  const text = firstUser.content.replace(/\s+/g, " ").trim();
  return text.length > 40 ? text.slice(0, 40) + "…" : text || "گفتگوی جدید";
}
