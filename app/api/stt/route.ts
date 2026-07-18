import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/session';
import { checkAILimit } from '@/lib/ai-limit-middleware';
import { recordAiUsage } from '@/lib/copilot/usage-tracking';
import { MODEL_WHISPER_LARGE_V3 } from '@/lib/openrouter';

export async function POST(req: Request) {
  const limitResult = await checkAILimit('stt');
  if (limitResult.errorResponse) return limitResult.errorResponse;
  const rollback = limitResult.rollback;
  const userId = limitResult.user?.id;

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      await rollback();
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Audio = buffer.toString('base64');
    
    // Extract file format/extension (e.g. webm, mp3) from name or type
    let format = 'webm';
    if (file.name) {
      const parts = file.name.split('.');
      if (parts.length > 1) {
        format = parts[parts.length - 1];
      }
    } else if (file.type) {
      const parts = file.type.split('/');
      if (parts.length > 1) {
        format = parts[1];
      }
    }

    // Standardize format extension
    if (format === 'mpeg') format = 'mp3';
    if (format === 'octet-stream') format = 'webm'; // Common default fallback

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      await rollback();
      return NextResponse.json({ error: "OpenRouter API Key not configured" }, { status: 500 });
    }

    const response = await fetch("https://openrouter.ai/api/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "X-Title": "Karnex"
      },
      body: JSON.stringify({
        model: MODEL_WHISPER_LARGE_V3,
        input_audio: {
          data: base64Audio,
          format: format
        },
        language: "fa" // Enforce Persian transcription
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter Whisper error:", response.status, errorText);
      await rollback();
      return NextResponse.json({ error: "خطا در تبدیل صدا به متن" }, { status: response.status });
    }

    const data = await response.json();
    // Record STT usage for cost analytics. The audio transcription endpoint
    // may not return token counts; record what is available (often 0 tokens,
    // with the audio seconds being the real billing unit).
    if (userId) {
      void recordAiUsage({
        userId,
        model: MODEL_WHISPER_LARGE_V3,
        provider: 'openrouter',
        feature: 'stt',
        promptTokens: data?.usage?.prompt_tokens ?? 0,
        completionTokens: data?.usage?.completion_tokens ?? 0,
        totalTokens: data?.usage?.total_tokens ?? 0,
        success: true,
      });
    }
    return NextResponse.json({ transcript: data.text });

  } catch (error: any) {
    console.error("STT route error:", error);
    await rollback();
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
