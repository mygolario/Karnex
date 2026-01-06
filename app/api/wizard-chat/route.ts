import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function POST(req: Request) {
  try {
    const { messages, systemPrompt } = await req.json() as {
      messages: ChatMessage[];
      systemPrompt: string;
    };

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ 
        message: "متاسفانه سرویس در دسترس نیست. لطفاً از حالت گام‌به‌گام استفاده کنید.",
        error: 'API key not configured' 
      }, { status: 500 });
    }

    // Build the messages array with system prompt
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messages
    ];

    // Using only Google Gemini models from OpenRouter
    const CHAT_MODELS = [
      "google/gemini-2.0-flash-exp:free",
      "google/gemini-2.0-flash-001",
      "google/gemini-pro-1.5",
    ];

    for (const model of CHAT_MODELS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Karnex Wizard Chat"
          },
          body: JSON.stringify({
            model,
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 500,
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          console.warn(`Chat model ${model} failed with status ${response.status}`);
          continue;
        }

        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
          continue;
        }

        const assistantMessage = data.choices[0].message.content;

        // Try to extract structured data from the conversation
        const extractedData = extractDataFromConversation(messages, assistantMessage);

        return NextResponse.json({
          message: assistantMessage,
          extractedData
        });

      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.warn(`Chat model ${model} timed out`);
        } else {
          console.error(`Chat model ${model} error:`, error.message);
        }
        continue;
      }
    }

    // All models failed - return a helpful fallback
    return NextResponse.json({
      message: "خوبه! ادامه بده و بیشتر توضیح بده. من گوش میدم 👂",
      extractedData: null
    });

  } catch (error) {
    console.error("Wizard chat error:", error);
    return NextResponse.json({ 
      message: "متاسفانه مشکلی پیش اومد. دوباره امتحان کن.",
      error: 'Failed to process chat' 
    }, { status: 500 });
  }
}

/**
 * Extract structured data from the conversation context
 */
function extractDataFromConversation(
  messages: ChatMessage[], 
  latestResponse: string
): Record<string, any> | null {
  const userMessages = messages.filter(m => m.role === "user").map(m => m.content);
  const allText = userMessages.join(" ");
  
  const data: Record<string, any> = {};
  
  // If it's the first message, likely the idea
  if (userMessages.length === 1) {
    data.idea = userMessages[0];
  }
  
  // If it's the second message, likely the problem
  if (userMessages.length === 2) {
    data.idea = userMessages[0];
    data.problem = userMessages[1];
  }
  
  // Third message - audience
  if (userMessages.length === 3) {
    data.audience = userMessages[2];
  }

  // Check if conversation seems complete
  if (userMessages.length >= 3 && 
      (latestResponse.includes("طرح") || latestResponse.includes("ساخت") || latestResponse.includes("🚀"))) {
    data.isComplete = true;
  }

  return Object.keys(data).length > 0 ? data : null;
}
