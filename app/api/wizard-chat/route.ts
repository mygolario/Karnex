import { NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';
import { checkAILimit } from '@/lib/ai-limit-middleware';
import { callAIWithValidation, WizardExtractionSchema } from '@/lib/ai-validation';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: Request) {
  let rollback = async () => {};
  try {
    // === AI Usage Limit Check ===
    const limitResult = await checkAILimit();
    if (limitResult.errorResponse) return limitResult.errorResponse;
    rollback = limitResult.rollback;

    const { messages, systemPrompt } = await req.json() as {
      messages: ChatMessage[];
      systemPrompt: string;
    };

    // Build a simple prompt
    const conversationContext = messages
      .slice(-4)
      .map(m => `${m.role === 'user' ? 'کاربر' : 'دستیار'}: ${m.content}`)
      .join('\n');

    const result = await callOpenRouter(
      `${conversationContext}\n\nدستیار (فارسی):`,
      {
        systemPrompt: `${systemPrompt}\n\nقانون مهم: فقط به فارسی پاسخ بده.`,
        maxTokens: 500,
        temperature: 0.5,
        timeoutMs: 20000,
      }
    );

    if (!result.success) {
      await rollback();
      return NextResponse.json({
        message: "خوبه! ادامه بده و بیشتر توضیح بده. 👂",
        extractedData: null
      });
    }

    const assistantMessage = result.content || "ادامه بده...";

    // Extracted data using AI extraction via gemini-3.5-flash
    let extractedData = null;
    try {
      const allMessages = [...messages, { role: 'assistant', content: assistantMessage } as ChatMessage];
      const conversationHistoryText = allMessages
        .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const extractionSystemPrompt = `You are a data extraction assistant. Your task is to analyze the conversation history between a user and an onboarding assistant. 
Extract the following details if they have been mentioned by the user:
1. "idea": The main product/business idea or concept.
2. "problem": The problem the idea is trying to solve.
3. "audience": The target audience or customers.
4. "budget": The budget or financial resources.
5. "isComplete": A boolean indicating if all necessary details have been discussed and the user is ready to generate their final strategy/business plan. Set to true if the assistant is ready to build the plan, the user says they are ready, or all core elements have been described.

Output strictly valid JSON with these fields. If a field has not been discussed or is unknown, return null for it.`;

      extractedData = await callAIWithValidation(
        conversationHistoryText,
        {
          systemPrompt: extractionSystemPrompt,
          maxTokens: 300,
          temperature: 0.1,
          timeoutMs: 15000,
          modelOverride: "google/gemini-3.5-flash",
        },
        WizardExtractionSchema,
        1
      );
    } catch (extractError) {
      console.error("Failed to extract wizard entities:", extractError);
      // Fallback to null
    }

    return NextResponse.json({
      message: assistantMessage,
      extractedData
    });

  } catch (error) {
    console.error("Wizard chat error:", error);
    await rollback();
    return NextResponse.json({
      message: "متاسفانه مشکلی پیش اومد. دوباره امتحان کن.",
      error: 'Failed to process chat'
    }, { status: 500 });
  }
}
