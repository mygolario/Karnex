import { NextResponse } from 'next/server';

export const maxDuration = 60;

// Image generation is temporarily disabled
// This endpoint is a placeholder that returns an error message

export async function POST() {
  return NextResponse.json({
    success: false,
    error: 'Image generation is temporarily disabled',
    message: 'تولید تصویر موقتاً غیرفعال است'
  }, { status: 503 });
}
