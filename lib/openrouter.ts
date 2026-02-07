/**
 * OpenRouter API Helper
 * Centralized configuration for all AI text generation
 */

// Cheap paid models (high reliability, low cost) + Free fallbacks
// Ordered by preference: Paid Fast -> Free High Quality -> Free Fast
// Google Gemini Models (Preferred Priority)
export const TEXT_MODELS = [
    "google/gemini-2.5-flash-lite",  // Priority 1
    "google/gemini-2.5-flash",       // Priority 2
    "google/gemini-3-flash-preview"  // Priority 3
];

export interface OpenRouterResponse {
    success: boolean;
    content?: string;
    model?: string;
    error?: string;
}

/**
 * Call OpenRouter API with automatic model fallback
 */
export async function callOpenRouter(
    prompt: string,
    options?: {
        systemPrompt?: string;
        maxTokens?: number;
        temperature?: number;
        timeoutMs?: number;
        modelOverride?: string;
    }
): Promise<OpenRouterResponse> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        console.error("❌ OPENROUTER_API_KEY is missing from environment variables");
        return { success: false, error: "API key not configured" };
    }

    const {
        systemPrompt,
        maxTokens = 2000,
        temperature = 0.7,
        timeoutMs = 25000,
        modelOverride
    } = options || {};

    let lastError: string | null = null;
    
    // Use override if provided, otherwise default list
    const modelsToTry = modelOverride ? [modelOverride] : TEXT_MODELS;

    for (const model of modelsToTry) {
        console.log(`🤖 Trying model: ${model}`);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

            const messages: { role: string; content: string }[] = [];
            if (systemPrompt) {
                messages.push({ role: "system", content: systemPrompt });
            }
            messages.push({ role: "user", content: prompt });

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
                    "X-Title": "Karnex"
                },
                body: JSON.stringify({
                    model,
                    messages,
                    max_tokens: maxTokens,
                    temperature,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                // 402 = Payment Required (Quota exceeded for free or insufficient credits)
                // 429 = Rate Limited
                console.warn(`⚠️ Model ${model} failed: ${response.status} - ${errorText.substring(0, 100)}`);
                lastError = `${model}: HTTP ${response.status}`;

                // If rate limited or payment issue, wait briefly and try next
                if (response.status === 429 || response.status === 402) {
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                continue;
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (content) {
                console.log(`✅ Success with model: ${model}`);
                return { success: true, content, model };
            } else {
                console.warn(`⚠️ Model ${model} returned empty content`);
                lastError = `${model}: Empty response`;
                continue;
            }
        } catch (error: any) {
            if (error.name === "AbortError") {
                console.warn(`⏱️ Model ${model} timed out`);
                lastError = `${model}: Timeout`;
            } else {
                console.error(`❌ Model ${model} error:`, error.message);
                lastError = `${model}: ${error.message}`;
            }
        }
    }

    return { success: false, error: `All models failed. Last: ${lastError}` };
}

/**
 * Parse JSON from AI response (handles markdown code blocks)
 */
export function parseJsonFromAI(content: string): any {
    let jsonStr = content.trim();

    // Remove markdown code blocks if present
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
        jsonStr = jsonMatch[1].trim();
    }

    return JSON.parse(jsonStr);
}
