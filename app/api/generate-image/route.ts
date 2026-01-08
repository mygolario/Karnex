import { NextResponse } from 'next/server';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// ========================================
// TWO-STAGE AI IMAGE GENERATION
// Stage 1: LLM generates optimal image prompt
// Stage 2: FLUX generates the image
// ========================================

// Together.ai Text Models (for prompt enhancement)
// Using models with EXCELLENT Persian/Farsi support
const TEXT_MODELS = [
  "Qwen/Qwen3-235B-A22B-fp8-tput",           // Qwen3 - 119 languages including Persian
  "Qwen/Qwen2.5-72B-Instruct-Turbo",         // Qwen 2.5 - strong multilingual
  "deepseek-ai/DeepSeek-V3",                  // DeepSeek V3 - multilingual
  "meta-llama/Llama-3.3-70B-Instruct-Turbo", // Llama as fallback
];

// Together.ai FLUX models (for image generation)
// Ordered by QUALITY (Pro first for best results)
const FLUX_MODELS = [
  "black-forest-labs/FLUX.1.1-pro",         // BEST quality - prioritized
  "black-forest-labs/FLUX.1-schnell",       // Good quality, fast
  "black-forest-labs/FLUX.1-schnell-Free",  // Free tier fallback
];

// Negative prompt to improve quality
const NEGATIVE_PROMPT = "blurry, low quality, distorted, watermark, text overlay, cropped, bad anatomy, ugly, duplicate, morbid, mutilated, poorly drawn, deformed";

// Style presets per asset type - appended to prompts for better results
const STYLE_PRESETS: Record<string, string> = {
  logo: "vector art, flat design, adobe illustrator style, professional logo design, centered composition, isolated on white background, brand identity, corporate design",
  pattern: "seamless repeating pattern, tileable texture, wallpaper design, fabric pattern, geometric precision, high detail",
  mockup: "studio photography, product shot, commercial advertising, professional lighting, 8k ultra HD, photorealistic, catalog photography",
  hero: "cinematic composition, dramatic lighting, 8k ultra HD, editorial photography, hero banner, wide angle, vibrant colors, modern design",
  cover: "book cover design, premium texture, elegant typography space, minimalist, luxury branding, professional print quality",
  color_mood: "lifestyle photography, aesthetic mood board, color graded, aspirational, brand storytelling, instagram style",
  social: "social media post, trending design, eye-catching, scroll-stopping, modern aesthetic, vibrant",
  typography: "typographic poster, swiss design, bold letters, graphic design masterpiece, grid layout, bauhaus inspired",
  icon: "app icon design, iOS style, rounded corners, flat vector, minimal, single symbol, clean lines",
  default: "professional design, high quality, modern aesthetic, 8k resolution"
};

// Smart aspect ratios per asset type
const ASPECT_RATIOS: Record<string, { width: number; height: number }> = {
  logo: { width: 1024, height: 1024 },       // Square for logos
  pattern: { width: 1024, height: 1024 },    // Square for patterns
  mockup: { width: 1024, height: 1024 },     // Square for mockups
  hero: { width: 1440, height: 768 },        // Wide 16:9 for hero banners
  cover: { width: 768, height: 1024 },       // Portrait 3:4 for covers
  color_mood: { width: 1024, height: 1024 }, // Square for mood boards
  social: { width: 1024, height: 1024 },     // Square for social
  typography: { width: 768, height: 1024 },  // Portrait for typography posters
  icon: { width: 512, height: 512 },         // Smaller for icons
  default: { width: 1024, height: 1024 }
};

// Guidance scale (CFG) - higher = more prompt adherence
const GUIDANCE_SCALE = 9.0;

// Placeholder generator for fallback
function generatePlaceholder(projectName: string, type: string = 'default'): string {
  const initials = projectName
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  const colorsByType: Record<string, [string, string]> = {
    logo: ['6366f1', 'ffffff'],
    pattern: ['10b981', 'ffffff'],
    mockup: ['3b82f6', 'ffffff'],
    hero: ['ec4899', 'ffffff'],
    cover: ['f59e0b', 'ffffff'],
    color_mood: ['f97316', 'ffffff'],
    social: ['8b5cf6', 'ffffff'],
    typography: ['000000', 'ffffff'],
    icon: ['2563eb', 'ffffff'],
    default: ['6366f1', 'ffffff'],
  };
  
  const [bg, fg] = colorsByType[type] || colorsByType.default;
  return `https://placehold.co/1024x1024/${bg}/${fg}?text=${encodeURIComponent(initials || type.toUpperCase())}&font=roboto`;
}

// ========================================
// STAGE 1: LLM-Powered Prompt Enhancement
// ========================================
async function generateImagePrompt(
  apiKey: string,
  businessContext: string,
  type: string,
  baseRequest: string,
  brandColors?: { primary?: string; secondary?: string }
): Promise<string | null> {
  
  const colorInfo = brandColors?.primary 
    ? `Brand colors: ${brandColors.primary} (primary) and ${brandColors.secondary || 'white'} (secondary).`
    : '';

  // Create a system prompt that generates EXCELLENT image prompts
  const systemPrompt = `You are an expert at writing prompts for AI image generation (like FLUX, Midjourney, DALL-E).
Your job is to take a business description and create a PERFECT, detailed image prompt.

Rules:
1. Output ONLY the image prompt. No explanations, no markdown, no quotes.
2. Be VERY SPECIFIC and VISUAL. Describe exactly what should be in the image.
3. Include style keywords at the end (e.g. "minimal, vector, professional")
4. Keep it under 200 words.
5. Focus on concrete visual elements, not abstract concepts.

Example for a honey business logo:
"Golden honeycomb hexagon shape with a small stylized bee silhouette, amber and gold gradient colors, geometric minimal design, white background, vector logo, professional branding, clean lines"`;

  const userMessage = `Business: ${businessContext}

Asset type: ${type.replace('_', ' ')}
User request: ${baseRequest}
${colorInfo}

Write the perfect image generation prompt for this:`;

  console.log(`\n🤖 STAGE 1: Generating optimal prompt with LLM...`);
  console.log(`📄 Business Context: "${businessContext.substring(0, 100)}..."`);

  for (const model of TEXT_MODELS) {
    try {
      console.log(`   Trying text model: ${model}`);
      
      const response = await fetch("https://api.together.xyz/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage }
          ],
          max_tokens: 300,
          temperature: 0.7,
        })
      });

      if (!response.ok) {
        console.warn(`   ❌ ${model}: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const generatedPrompt = data.choices?.[0]?.message?.content?.trim();
      
      if (generatedPrompt) {
        console.log(`   ✅ LLM generated prompt: "${generatedPrompt.substring(0, 100)}..."`);
        return generatedPrompt;
      }
    } catch (error: any) {
      console.warn(`   ❌ ${model}: ${error.message}`);
    }
  }

  console.warn(`   ⚠️ All text models failed, using fallback prompt`);
  return null;
}

// ========================================
// STAGE 2: FLUX Image Generation
// ========================================
async function generateImage(
  apiKey: string,
  prompt: string,
  projectName: string,
  type: string
): Promise<{ success: boolean; imageUrl?: string; model?: string; error?: string }> {
  
  // Get style preset and aspect ratio for this type
  const stylePreset = STYLE_PRESETS[type] || STYLE_PRESETS.default;
  const dimensions = ASPECT_RATIOS[type] || ASPECT_RATIOS.default;
  
  // Enhance prompt with style preset
  const enhancedPrompt = `${prompt}. ${stylePreset}`;
  
  console.log(`\n🎨 STAGE 2: Generating image with FLUX...`);
  console.log(`📝 Final Prompt: "${enhancedPrompt.substring(0, 150)}..."`);
  console.log(`📐 Dimensions: ${dimensions.width}x${dimensions.height}`);
  console.log(`🎯 Guidance Scale: ${GUIDANCE_SCALE}`);


  for (const model of FLUX_MODELS) {
    console.log(`   Trying: ${model}`);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 50000);

      const response = await fetch("https://api.together.xyz/v1/images/generations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          prompt: enhancedPrompt,
          negative_prompt: NEGATIVE_PROMPT,
          width: dimensions.width,
          height: dimensions.height,
          steps: 20,
          guidance: GUIDANCE_SCALE,
          n: 1,
          response_format: "url"
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`   ❌ ${model}: ${response.status} - ${errorText.substring(0, 100)}`);
        continue;
      }

      const data = await response.json();
      
      if (data.data && data.data[0]) {
        const imageData = data.data[0];
        let imageUrl = imageData.url || imageData.b64_json;
        
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
          imageUrl = `data:image/png;base64,${imageUrl}`;
        }
        
        if (imageUrl) {
          console.log(`   ✅ SUCCESS with ${model}`);
          return { success: true, imageUrl, model };
        }
      }
      
      console.warn(`   ⚠️ ${model}: No image in response`);
      
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.warn(`   ⏱️ ${model}: Timeout`);
      } else {
        console.error(`   🔥 ${model}: ${error.message}`);
      }
    }
  }

  return { success: false, error: 'All FLUX models failed' };
}

// ========================================
// MAIN API HANDLER
// ========================================
export async function POST(req: Request) {
  try {
    const { 
      prompt, 
      style = "modern, professional, minimal",
      type = "default",
      projectName = "Brand",
      brandColors,
      ideaInput,
      overview
    } = await req.json();

    // Get the best available context
    const businessContext = ideaInput || overview || "";

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      console.warn('⚠️ TOGETHER_API_KEY missing - returning placeholder');
      return NextResponse.json({
        success: true,
        model: 'placeholder',
        imageUrl: generatePlaceholder(projectName, type),
        isPlaceholder: true,
        note: 'برای تولید تصویر، کلید TOGETHER_API_KEY را در .env.local اضافه کنید.'
      });
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 TWO-STAGE IMAGE GENERATION`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📦 Project: ${projectName}`);
    console.log(`🏷️  Type: ${type}`);
    console.log(`💡 Business Context: "${businessContext.substring(0, 80)}..."`);
    console.log(`🎨 Colors: ${JSON.stringify(brandColors)}`);

    // ========================================
    // STAGE 1: Generate optimal prompt with LLM
    // ========================================
    let finalPrompt: string;
    
    if (businessContext && businessContext.trim().length > 5) {
      // Use LLM to create an optimal prompt
      const llmPrompt = await generateImagePrompt(
        apiKey,
        businessContext,
        type,
        prompt,
        brandColors
      );
      
      if (llmPrompt) {
        finalPrompt = llmPrompt;
      } else {
        // Fallback: simple concatenation
        finalPrompt = `${type.replace('_', ' ')} for a business: ${businessContext}. ${prompt}. Style: ${style}`;
      }
    } else {
      // No context available
      finalPrompt = `${prompt}. Style: ${style}`;
    }

    // ========================================
    // STAGE 2: Generate image with FLUX
    // ========================================
    const imageResult = await generateImage(apiKey, finalPrompt, projectName, type);

    if (imageResult.success && imageResult.imageUrl) {
      console.log(`\n✅ COMPLETE! Image generated successfully.`);
      console.log(`${'='.repeat(60)}\n`);
      
      return NextResponse.json({
        success: true,
        model: imageResult.model,
        imageUrl: imageResult.imageUrl,
        prompt: finalPrompt,
        isPlaceholder: false
      });
    }

    // All failed - return placeholder
    console.error(`\n❌ FAILED: ${imageResult.error}`);
    console.log(`${'='.repeat(60)}\n`);
    
    return NextResponse.json({ 
      success: true,
      model: 'placeholder-fallback',
      imageUrl: generatePlaceholder(projectName, type),
      isPlaceholder: true,
      note: 'خطا در تولید تصویر. لطفاً دوباره تلاش کنید.',
      debugError: imageResult.error
    });

  } catch (error: any) {
    console.error("🔥 Critical Error:", error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error.message 
    }, { status: 500 });
  }
}
