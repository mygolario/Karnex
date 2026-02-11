import { NextResponse } from 'next/server';
import { callOpenRouter } from '@/lib/openrouter';
import { checkAILimit } from '@/lib/ai-limit-middleware';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: Request) {
  try {
    // === AI Usage Limit Check ===
    const { errorResponse } = await checkAILimit();
    if (errorResponse) return errorResponse;

    const { messages, systemPrompt } = await req.json() as {
      messages: ChatMessage[];
      systemPrompt: string;
    };

    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';

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
      return NextResponse.json({
        message: "خوبه! ادامه بده و بیشتر توضیح بده. 👂",
        extractedData: null
      });
    }

    const assistantMessage = result.content || "ادامه بده...";
    const extractedData = extractDataFromConversation(messages, assistantMessage);

    return NextResponse.json({
      message: assistantMessage,
      extractedData
    });

  } catch (error) {
    console.error("Wizard chat error:", error);
    return NextResponse.json({
      message: "متاسفانه مشکلی پیش اومد. دوباره امتحان کن.",
      error: 'Failed to process chat'
    }, { status: 500 });
  }
}

function extractDataFromConversation(
  messages: ChatMessage[],
  latestResponse: string
): Record<string, any> | null {
  const userMessages = messages.filter(m => m.role === "user").map(m => m.content);

  const data: Record<string, any> = {};

  if (userMessages.length === 1) {
    data.idea = userMessages[0];
  }

  if (userMessages.length === 2) {
    data.idea = userMessages[0];
    data.problem = userMessages[1];
  }

  if (userMessages.length === 3) {
    data.audience = userMessages[2];
  }

  if (userMessages.length >= 3 &&
    (latestResponse.includes("طرح") || latestResponse.includes("ساخت") || latestResponse.includes("🚀"))) {
    data.isComplete = true;
  }

  return Object.keys(data).length > 0 ? data : null;
}
