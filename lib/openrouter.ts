/**
 * OpenRouter API Helper
 * Centralized configuration for all AI text generation
 */

// Google Gemini Models (Preferred Priority)
// Primary: gemini-3.5-flash (fast, high quality, low cost, beginner-friendly Persian output)
// Fallbacks kept for resilience
export const TEXT_MODELS = [
    "google/gemini-3.5-flash",        // Priority 1 (Fast, high quality, low cost)
    "google/gemini-2.5-flash",        // Priority 2 (Stable fallback)
    "google/gemini-2.5-flash-lite"   // Priority 3 (Ultra-fast budget fallback)
];

export interface OpenRouterResponse {
    success: boolean;
    content?: string;
    model?: string;
    error?: string;
}

export class TransientError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
        super(message);
        this.name = "TransientError";
        this.status = status;
    }
}

export async function withRetry<T>(
    fn: (attempt: number) => Promise<T>,
    maxAttempts: number = 3,
    baseDelayMs: number = 1000,
    shouldRetry: (error: any) => boolean = () => true
): Promise<T> {
    let attempt = 1;
    while (true) {
        try {
            return await fn(attempt);
        } catch (error: any) {
            if (attempt >= maxAttempts || !shouldRetry(error)) {
                throw error;
            }
            const delay = baseDelayMs * Math.pow(2, attempt - 1);
            console.warn(`Retry attempt ${attempt} failed. Retrying in ${delay}ms... Error: ${error.message || error}`);
            await new Promise(resolve => setTimeout(resolve, delay));
            attempt++;
        }
    }
}

const isTransient = (error: any) => {
    if (error.name === "AbortError" || error.message?.includes("timeout") || error.message?.includes("Timeout")) {
        return true;
    }
    if (error instanceof TransientError) {
        return true;
    }
    if (error.status === 429 || error.status === 503) {
        return true;
    }
    return false;
};

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
        responseFormat?: { type: 'json_object' };
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
        timeoutMs = 20000,
        modelOverride,
        responseFormat
    } = options || {};

    let lastError: string | null = null;
    
    // Use override if provided, otherwise default list
    const modelsToTry = modelOverride ? [modelOverride] : TEXT_MODELS;

    for (const model of modelsToTry) {
        try {
            const content = await withRetry(
                async (attempt) => {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

                    try {
                        const messages: any[] = [];
                        if (systemPrompt) {
                            messages.push({
                                role: "system",
                                content: [
                                    {
                                        type: "text",
                                        text: systemPrompt,
                                        cache_control: { type: "ephemeral" }
                                    }
                                ]
                            });
                        }
                        messages.push({
                            role: "user",
                            content: [
                                {
                                    type: "text",
                                    text: prompt
                                }
                            ]
                        });

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
                                response_format: responseFormat,
                            }),
                            signal: controller.signal,
                        });

                        if (!response.ok) {
                            const errorText = await response.text();
                            console.warn(`⚠️ Model ${model} attempt ${attempt} failed: ${response.status} - ${errorText.substring(0, 100)}`);
                            
                            if (response.status === 429 || response.status === 503) {
                                throw new TransientError(`HTTP ${response.status}`, response.status);
                            }
                            throw new Error(`HTTP ${response.status}: ${errorText}`);
                        }

                        const data = await response.json();
                        const text = data.choices?.[0]?.message?.content;
                        if (!text) {
                            throw new Error("Empty response");
                        }
                        return text;
                    } finally {
                        clearTimeout(timeoutId);
                    }
                },
                3, // maxAttempts
                1000, // baseDelayMs
                isTransient
            );

            return { success: true, content, model };

        } catch (error: any) {
            if (error.name === "AbortError" || error.message?.includes("Timeout") || error.message?.includes("timeout")) {
                console.warn(`⏱️ Model ${model} timed out after all retries`);
                lastError = `${model}: Timeout`;
            } else {
                console.error(`❌ Model ${model} failed after all retries:`, error.message);
                lastError = `${model}: ${error.message}`;
            }
        }
    }

    return { success: false, error: `All models failed. Last: ${lastError}` };
}

/**
 * Parse JSON from AI response (handles markdown code blocks and raw text)
 */
export function parseJsonFromAI(content: string): any {
    if (!content) return {};
    let jsonStr = content.trim();

    // 1. Try finding markdown code blocks
    const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
    } 

    // 2. Try parsing directly
    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        // 3. Fallback: Find first '{' and last '}'
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
            const potentialJson = jsonStr.substring(firstBrace, lastBrace + 1);
            try {
                return JSON.parse(potentialJson);
            } catch (innerE) {
                // Formatting might be slightly off (e.g. standard Gemini/Flash issues)
                throw e; // Throw original error for now
            }
        }
        throw e;
    }
}
