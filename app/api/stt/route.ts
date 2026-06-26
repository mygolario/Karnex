import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
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
        model: "openai/whisper-large-v3",
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
      return NextResponse.json({ error: "خطا در تبدیل صدا به متن" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ transcript: data.text });

  } catch (error: any) {
    console.error("STT route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
