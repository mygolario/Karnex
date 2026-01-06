import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Image generation models priority - updated Jan 2026
// Using only Google Gemini models from OpenRouter
const IMAGE_MODELS = [
  "google/gemini-2.0-flash-exp:free",
  "google/gemini-2.0-flash-001",
  "google/gemini-pro-vision",
];

// Placeholder image generation using UI Avatars or similar
function generatePlaceholderLogo(projectName: string): string {
  // Generate a simple placeholder using a public API
  const initials = projectName
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  // Random gradient colors
  const colors = [
    ['6366f1', '8b5cf6'], // indigo to violet
    ['3b82f6', '06b6d4'], // blue to cyan
    ['10b981', '14b8a6'], // emerald to teal
    ['f59e0b', 'f97316'], // amber to orange
    ['ec4899', 'f43f5e'], // pink to rose
  ];
  const [bg, fg] = colors[Math.floor(Math.random() * colors.length)];
  
  // Using placeholder API that doesn't require API keys
  return `https://placehold.co/512x512/${bg}/${fg}?text=${encodeURIComponent(initials)}&font=roboto`;
}

export async function POST(req: Request) {
  try {
    const { prompt, style = "modern, professional, minimal", projectName = "Logo" } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Check if API key is available
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('OpenRouter API Key missing, using placeholder');
      return NextResponse.json({
        success: true,
        model: 'placeholder',
        imageUrl: generatePlaceholderLogo(projectName),
        note: 'تصویر شامل نشانگر است. برای تولید لوگوی واقعی، کلید API را تنظیم کنید.'
      });
    }

    // Enhance prompt for better results
    const enhancedPrompt = `${prompt}. Style: ${style}. High quality, professional design.`;

    let lastError = null;

    for (const model of IMAGE_MODELS) {
      console.log(`DEBUG: Attempting image generation with model: ${model}`);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

        const response = await fetch("https://openrouter.ai/api/v1/images/generations", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "Karnex AI"
          },
          body: JSON.stringify({
            model: model,
            prompt: enhancedPrompt,
            n: 1,
            size: "1024x1024",
            response_format: "url"
          }),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          console.warn(`Model ${model} failed. Status: ${response.status}. Msg: ${errorText}`);
          lastError = `Status ${response.status} on ${model}`;
          continue;
        }

        const data = await response.json();
        
        if (data.data && data.data[0]) {
          const imageResult = data.data[0];
          console.log(`SUCCESS: Image generated using ${model}`);
          
          return NextResponse.json({
            success: true,
            model: model,
            imageUrl: imageResult.url || null,
            imageBase64: imageResult.b64_json || null
          });
        } else {
          console.warn(`Model ${model} returned no image data.`);
          continue;
        }

      } catch (networkError: any) {
        if (networkError.name === 'AbortError') {
          console.warn(`Model ${model} timed out (45s limit).`);
          lastError = "Timeout (45s)";
        } else {
          console.error(`Network exception for model ${model}:`, networkError.message);
          lastError = networkError.message;
        }
      }
    }

    // All models failed - return placeholder as fallback
    console.error("ALL IMAGE MODELS FAILED. Last Error:", lastError);
    console.log("Returning placeholder image as fallback");
    
    return NextResponse.json({ 
      success: true,
      model: 'placeholder-fallback',
      imageUrl: generatePlaceholderLogo(projectName),
      note: 'سرویس تولید تصویر در دسترس نیست. تصویر نمادین ایجاد شد.',
      debugError: lastError
    });

  } catch (error) {
    console.error("Image Generation Critical Error:", error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
