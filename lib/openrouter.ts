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

// Dedicated model list for the agentic Copilot loop (tool-calling + streaming).
// Kept separate so the copilot can evolve independently of the generic TEXT_MODELS.
// Falls back through the chain on transient failure (handled by callOpenRouter / inline calls).
export const COPILOT_MODELS = [
    "google/gemini-3.5-flash",        // Priority 1 (Fast tool-calling, high quality)
    "google/gemini-2.5-flash",        // Priority 2 (Stable fallback)
    "google/gemini-2.5-flash-lite"   // Priority 3 (Ultra-fast budget fallback)
];

// Fast tier — used for cheap, high-volume background work: titles, summaries,
// follow-up generation, memory extraction, classification, quick replies.
// gemini-3.1-flash-lite is the primary choice (per product strategy); the
// 2.5-flash-lite is kept as a resilience fallback if the primary slug is
// temporarily unavailable on OpenRouter.
export const COPILOT_FAST_MODELS = [
    "google/gemini-3.1-flash-lite",   // Priority 1 (ultra-cheap, fast)
    "google/gemini-2.5-flash-lite",   // Priority 2 (stable fallback)
];

export type CopilotModelTier = "hard" | "fast";

/**
 * Pick the model chain to try for a given tier, honoring an optional override.
 * Returns the ordered list of models to attempt (override first, then fallbacks).
 */
export function copilotModelChain(override?: string, tier: CopilotModelTier = "hard"): string[] {
    const base = tier === "fast" ? COPILOT_FAST_MODELS : COPILOT_MODELS;
    if (override) return [override, ...base.filter(m => m !== override)];
    return base;
}

export interface OpenRouterResponse {
    success: boolean;
    content?: string;
    model?: string;
    finishReason?: string;
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
        maxAttempts?: number;
        /** When true, only try modelOverride (or first TEXT_MODEL) — no fallback chain */
        singleModel?: boolean;
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
        maxAttempts = 3,
        singleModel = false,
        modelOverride,
        responseFormat
    } = options || {};

    let lastError: string | null = null;
    
    // Use override first, then fall back through the default model chain
    const modelsToTry = singleModel
        ? [modelOverride || TEXT_MODELS[0]]
        : modelOverride
          ? [modelOverride, ...TEXT_MODELS.filter((m) => m !== modelOverride)]
          : TEXT_MODELS;

    for (const model of modelsToTry) {
        try {
            const result = await withRetry(
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
                        const choice = data.choices?.[0];
                        const text = choice?.message?.content;
                        if (!text) {
                            throw new Error("Empty response");
                        }
                        return { text, finishReason: choice?.finish_reason as string | undefined };
                    } finally {
                        clearTimeout(timeoutId);
                    }
                },
                maxAttempts,
                1000, // baseDelayMs
                isTransient
            );

            return { success: true, content: result.text, model, finishReason: result.finishReason };

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
 * Close unbalanced braces/brackets when the model hits max_tokens mid-JSON.
 */
function repairTruncatedJson(jsonStr: string): string {
    let s = jsonStr.trim();
    s = s.replace(/,\s*"[^"]*"?\s*:\s*"[^"]*$/m, "");
    s = s.replace(/,\s*"[^"]*"?\s*:\s*[^,\}\]]*$/m, "");
    s = s.replace(/,\s*$/m, "");

    const stack: string[] = [];
    let inString = false;
    let escape = false;
    for (const ch of s) {
        if (escape) {
            escape = false;
            continue;
        }
        if (ch === "\\" && inString) {
            escape = true;
            continue;
        }
        if (ch === '"') {
            inString = !inString;
            continue;
        }
        if (inString) continue;
        if (ch === "{") stack.push("}");
        else if (ch === "[") stack.push("]");
        else if (ch === "}" || ch === "]") stack.pop();
    }
    if (inString) s += '"';
    return s + stack.reverse().join("");
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

    const attempts = [
        jsonStr,
        (() => {
            const firstBrace = jsonStr.indexOf("{");
            const lastBrace = jsonStr.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace > firstBrace) {
                return jsonStr.substring(firstBrace, lastBrace + 1);
            }
            return jsonStr;
        })(),
        repairTruncatedJson(jsonStr),
    ];

    let lastError: unknown;
    for (const candidate of attempts) {
        try {
            return JSON.parse(candidate);
        } catch (e) {
            lastError = e;
        }
    }
    throw lastError;
}

// === Copilot Agentic Chat ===

export interface CopilotChatParams {
    messages: any[];
    tools?: any[];
    toolChoice?: string;       // "auto" | "none" | specific
    temperature?: number;
    stream?: boolean;
    signal?: AbortSignal;      // supports user-initiated stop
    modelOverride?: string;
    timeoutMs?: number;
    tier?: CopilotModelTier;   // "hard" (default) for reasoning/tool-use, "fast" for cheap tasks
}

export interface CopilotChatResult {
    response: Response;         // raw fetch Response (body is stream when stream=true)
    model: string;              // the model that succeeded
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function openRouterHeaders(): Record<string, string> {
    return {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://www.karnex.ir",
        "X-Title": "Karnex",
    };
}

/**
 * Call OpenRouter for the Copilot agentic loop with automatic model fallback,
 * retry on transient errors, and AbortSignal support (for the Stop button).
 *
 * Returns the raw Response so callers can either `.json()` it (non-streaming
 * tool-call turns) or read the body as a stream (final text streaming).
 */
export async function callCopilotChat(params: CopilotChatParams): Promise<CopilotChatResult> {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is missing from environment variables");
    }

    const {
        messages,
        tools,
        toolChoice = "auto",
        temperature = 0.7,
        stream = false,
        signal,
        modelOverride,
        timeoutMs = 30000,
        tier = "hard",
    } = params;

    const models = copilotModelChain(modelOverride, tier);
    let lastError: Error | null = null;

    for (const model of models) {
        try {
            const response = await withRetry(
                async () => {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

                    // Propagate an external (user) abort to the inner controller.
                    if (signal) {
                        if (signal.aborted) controller.abort();
                        else signal.addEventListener("abort", () => controller.abort(), { once: true });
                    }

                    try {
                        const body: Record<string, unknown> = {
                            model,
                            messages,
                            temperature,
                        };
                        if (tools && tools.length > 0) {
                            body.tools = tools;
                            body.tool_choice = toolChoice;
                        }
                        if (stream) {
                            body.stream = true;
                            // Ask the provider to include a final usage chunk so we
                            // can record token/cost data for streaming responses.
                            body.stream_options = { include_usage: true };
                        }

                        const res = await fetch(OPENROUTER_URL, {
                            method: "POST",
                            headers: openRouterHeaders(),
                            body: JSON.stringify(body),
                            signal: controller.signal,
                        });

                        if (!res.ok) {
                            const errorText = await res.text();
                            if (res.status === 429 || res.status === 503) {
                                throw new TransientError(`HTTP ${res.status}`, res.status);
                            }
                            throw new Error(`HTTP ${res.status}: ${errorText.substring(0, 200)}`);
                        }
                        return res;
                    } finally {
                        clearTimeout(timeoutId);
                    }
                },
                3,
                1000,
                isTransient
            );

            return { response, model };
        } catch (error: any) {
            // User cancelled — don't try the next model.
            if (signal?.aborted || error.name === "AbortError") {
                throw error;
            }
            console.warn(`Copilot model ${model} failed: ${error.message}`);
            lastError = error;
        }
    }

    throw lastError || new Error("All copilot models failed");
}
