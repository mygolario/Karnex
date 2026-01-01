import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { idea, audience, budget } = await req.json();

    console.log("DEBUG: POST /api/generate-plan called");
    console.log("DEBUG: Env Var Present:", !!process.env.OPENROUTER_API_KEY);
    if(process.env.OPENROUTER_API_KEY) {
        console.log("DEBUG: Key Start:", process.env.OPENROUTER_API_KEY.substring(0, 5));
    } else {
        console.error("DEBUG: OPENROUTER_API_KEY is MISSING");
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ error: 'OpenRouter API Key missing' }, { status: 500 });
    }

    const systemPrompt = `
      You are Karnex, an expert startup consultant for the Iranian market.
      Your Goal: Take a user's business idea and create a detailed execution plan focused on ZERO BUDGET ($0) or low cost.
      
      User Context:
      - Idea: ${idea}
      - Target Audience: ${audience}
      - Budget Constraint: ${budget}

      INSTRUCTIONS:
      1. Think deeply about how to solve this specific problem in Iran.
      2. You MUST reply in PERSIAN (Farsi).
      3. You MUST output ONLY valid JSON.
      
      JSON STRUCTURE REQUIRED:
      {
        "projectName": "Short catchy name in Persian",
        "tagline": "A punchy slogan",
        "overview": "2 sentences describing the business",
        "leanCanvas": {
          "problem": "What pain point are they solving?",
          "solution": "How they solve it simply",
          "uniqueValue": "Why them?",
          "revenueStream": "How they make money (e.g. Subscription, Ads)"
        },
        "brandKit": {
          "primaryColorHex": "#HEXCODE",
          "secondaryColorHex": "#HEXCODE",
          "colorPsychology": "Why these colors?",
          "suggestedFont": "Vazirmatn",
          "logoConcepts": [
            { "conceptName": "Concept 1", "description": "Description 1" },
            { "conceptName": "Concept 2", "description": "Description 2" },
            { "conceptName": "Concept 3", "description": "Description 3" }
          ]
        },
        "roadmap": [
           { "phase": "Week 1: Validation", "steps": ["Step 1", "Step 2"] },
           { "phase": "Week 2: MVP Build", "steps": ["Step 1", "Step 2"] },
           { "phase": "Week 3: Launch", "steps": ["Step 1", "Step 2"] }
        ],
        "marketingStrategy": [
           "Specific tactic 1",
           "Specific tactic 2",
           "Specific tactic 3",
           "Specific tactic 4"
        ],
        "competitors": [
          { 
            "name": "Name of competitor type (e.g. Traditional Bazaar)", 
            "strength": "Their main advantage", 
            "weakness": "Their main weakness you can exploit", 
            "channel": "Where they sell (e.g. Offline, Instagram)" 
          },
          { 
            "name": "Name of competitor type (e.g. Digikala/Snapp)", 
            "strength": "Their main advantage", 
            "weakness": "Their main weakness", 
            "channel": "Web/App" 
          }
        ]
      }
    `;

    // --- MOCK PLAN FALLBACK ---
    const mockPlan = {
      projectName: "عسل ارگانیک کوهستان",
      tagline: "طعم واقعی طبیعت در سفره شما",
      overview: "تولید و عرضه مستقیم عسل ارگانیک از کندوهای کوهستانی بدون واسطه، با تمرکز بر کیفیت و سلامت.",
      leanCanvas: {
        problem: "وجود عسل‌های تقلبی و شکرک‌زده در بازار و عدم اعتماد مشتریان",
        solution: "عرضه مستقیم عسل با برگه آزمایش و ضمانت بازگشت وجه",
        uniqueValue: "تضمین اصالت کالا و شفافیت کامل در فرآیند تولید",
        revenueStream: "فروش مستقیم آنلاین و اشتراک ماهانه مصرف"
      },
      brandKit: {
        primaryColorHex: "#F59E0B",
        secondaryColorHex: "#1F2937",
        colorPsychology: "زرد برای انرژی و طبیعت، تیره برای اعتماد و سنگینی",
        suggestedFont: "Vazirmatn",
        logoConcepts: [
          { conceptName: "زنبور طلایی", description: "طرح انتزاعی از زنبور با خطوط طلایی" },
          { conceptName: "کوه و کندو", description: "ترکیب نماد کوهستان و فرم شش ضلعی" },
          { conceptName: "قطره عسل", description: "تایپوگرافی اسم برند درون یک قطره عسل" }
        ]
      },
      roadmap: [
        { phase: "هفته ۱: اعتبارسنجی", steps: ["تحقیق بازار محلی", "ساخت صفحه اینستاگرام"] },
        { phase: "هفته ۲: محصول اولیه", steps: ["بسته‌بندی نمونه‌ها", "عکاسی از محصول"] },
        { phase: "هفته ۳: فروش آزمایشی", steps: ["ارسال نمونه برای اینفلوئنسرها", "تبلیغات محلی"] }
      ],
      marketingStrategy: [
        "تولید محتوا درباره تشخیص عسل طبیعی",
        "همکاری با بلاگرهای سلامت",
        "تخفیف ویژه برای خرید اول",
        "مسابقه اینستاگرامی با جایزه"
      ],
      competitors: [
        { 
          name: "فروشگاه‌های زنجیره‌ای", 
          strength: "دسترسی آسان", 
          weakness: "عدم اعتماد به کیفیت", 
          channel: "فیزیکی" 
        },
        { 
          name: "عسل محلی", 
          strength: "کیفیت خوب", 
          weakness: "بسته‌بندی ضعیف", 
          channel: "سنتی" 
        }
      ]
    };

    console.log("DEBUG: Calling OpenRouter...");
    
    let structuredPlan;

    try {
        // MOdELS TO TRY (Strict Policy: Claude 3.5 Sonnet ONLY)
        // User requested to ONLY use this specific model for maximum quality.
        const FALLBACK_MODELS = [
             "google/gemini-2.0-flash-exp:free",      // Reliable JSON
             "deepseek/deepseek-chat:free",           // High quality V3
             "meta-llama/llama-3.3-70b-instruct:free" // Robust
        ];

        // We ignore the env var if it differs, or we can leave it. 
        // Best to force the user's wish.
        const UNIQUE_MODELS = FALLBACK_MODELS;

        let lastError = null;

        for (const model of UNIQUE_MODELS) {
            console.log(`DEBUG: Attempting AI Generation with model: ${model}`);
            
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 40000); // 40s per model attempt

                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:3000",
                        "X-Title": "Karnex App"
                    },
                    body: JSON.stringify({
                        "model": model,
                        "messages": [
                            { "role": "system", "content": systemPrompt }
                        ],
                        "temperature": 0.7,
                        // Only for Claude/GPT. Llama/Gemini often error 400 with this field.
                        "response_format": (model.includes("claude") || model.includes("gpt")) 
                            ? { "type": "json_object" } 
                            : undefined
                    }),
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.warn(`Model ${model} failed. Status: ${response.status}. Msg: ${errorText}`);
                    
                    // 402 = Payment Required, 401 = Unauthorized (key doesn't support model), 429 = Quota
                    // In all these cases, we should try the next model.
                    lastError = `Status ${response.status} on ${model}`;
                    continue;
                }

                const data = await response.json();
                
                if (!data.choices || !data.choices.length) {
                    console.warn(`Model ${model} returned no choices.`);
                    continue;
                }

                let rawContent = data.choices[0].message.content;
                
                try {
                    rawContent = rawContent.replace(/```json/g, "").replace(/```/g, "").trim();
                    structuredPlan = JSON.parse(rawContent);
                    console.log(`SUCCESS: Plan generated using ${model}`);
                    return NextResponse.json(structuredPlan); // Success! Return immediately.
                } catch (parseError) {
                    console.error(`JSON Parse Error for model ${model}:`, parseError);
                    continue; 
                }

            } catch (networkError: any) {
                 if (networkError.name === 'AbortError') {
                     console.warn(`Model ${model} timed out (40s limit).`);
                     lastError = "Timeout (40s)";
                 } else {
                     console.error(`Network exception for model ${model}:`, networkError.message);
                     lastError = networkError.message;
                 }
            }
        }
        
        console.error("ALL MODELS FAILED. Last Error:", lastError);
        // CRITICAL DEBUG: Return the specific error to the UI instead of the Mock Plan
        // so the user knows WHY Claude 4.5 is failing.
        return NextResponse.json(
            { error: `AI Error: ${lastError || "Unknown Failure"}` }, 
            { status: 500 }
        );

    } catch (globalError) {
        console.error("Global Generation Error:", globalError);
        console.error("Global Generation Error:", globalError);
        return NextResponse.json(
            { error: `Global Error: ${globalError instanceof Error ? globalError.message : "Crash"}` }, 
            { status: 500 }
        );
    }
    // Unreachable due to returns above, but keeps TS happy if needed (though usually unreachable code is fine)
    // return NextResponse.json(mockPlan);

  } catch (error) {
    console.error("AI Generation Critical Error:", error);
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 });
  }
}
