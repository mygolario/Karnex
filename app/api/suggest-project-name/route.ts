import { NextResponse } from 'next/server';

export const maxDuration = 30;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { idea } = await req.json();

    if (!idea) {
      return NextResponse.json({ names: [] });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      // Return fallback suggestions based on idea words
      const fallbackNames = generateFallbackNames(idea);
      return NextResponse.json({ names: fallbackNames });
    }

    const systemPrompt = `تو یک متخصص برندسازی ایرانی هستی. 
کاربر دارد یک کسب‌وکار با این ایده می‌سازد: "${idea}"

وظیفه تو تولید ۶ اسم خلاقانه، کوتاه و به‌یادماندنی برای این کسب‌وکار است.

قوانین:
- اسم‌ها باید فارسی یا ترکیب فارسی-انگلیسی باشند
- هر اسم حداکثر ۲-۳ کلمه باشد
- اسم‌ها باید منحصربه‌فرد و خلاقانه باشند
- از اسم‌های عمومی مثل "بهترین" یا "برتر" استفاده نکن

فقط یک آرایه JSON برگردان، مثال:
["نام ۱", "نام ۲", "نام ۳", "نام ۴", "نام ۵", "نام ۶"]`;

    // Use fast models for quick response
    const MODELS = [
      "google/gemini-2.0-flash-exp:free",
      "mistralai/mistral-small-3.1-24b-instruct:free",
    ];

    for (const model of MODELS) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Karnex Name Generator"
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt }
            ],
            temperature: 0.9,
            max_tokens: 200,
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) continue;

        const data = await response.json();
        
        if (!data.choices?.[0]?.message?.content) continue;

        let content = data.choices[0].message.content;
        
        // Parse JSON array from response
        try {
          // Clean up the response
          content = content.replace(/```json/g, "").replace(/```/g, "").trim();
          const names = JSON.parse(content);
          
          if (Array.isArray(names) && names.length > 0) {
            return NextResponse.json({ names: names.slice(0, 6) });
          }
        } catch {
          // Try to extract names from text
          const matches = content.match(/["']([^"']+)["']/g);
          if (matches && matches.length > 0) {
            const names = matches.map((m: string) => m.replace(/["']/g, "")).slice(0, 6);
            return NextResponse.json({ names });
          }
        }

      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.warn(`Model ${model} timed out for name generation`);
        }
        continue;
      }
    }

    // Fallback if all models fail
    const fallbackNames = generateFallbackNames(idea);
    return NextResponse.json({ names: fallbackNames });

  } catch (error) {
    console.error("Name suggestion error:", error);
    return NextResponse.json({ names: [] });
  }
}

function generateFallbackNames(idea: string): string[] {
  // Extract key words from idea
  const words = idea.split(/\s+/).filter(w => w.length > 2);
  const baseWord = words[0] || "پروژه";
  
  const prefixes = ["", "سامانه ", "اپ ", ""];
  const suffixes = ["پلاس", "نو", "یار", "لند", "باز", "مارکت"];
  
  const names: string[] = [];
  
  // Generate combinations
  for (let i = 0; i < 6; i++) {
    const prefix = prefixes[i % prefixes.length];
    const suffix = suffixes[i % suffixes.length];
    
    if (i < 3) {
      names.push(`${prefix}${baseWord} ${suffix}`.trim());
    } else {
      names.push(`${baseWord}${suffix}`);
    }
  }
  
  return names;
}
