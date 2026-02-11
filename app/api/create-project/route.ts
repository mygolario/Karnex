import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { checkProjectLimit } from '@/lib/usage-tracker';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { userId, planData } = await req.json();
    
    if (!userId || !planData) {
      return NextResponse.json({ error: 'Missing userId or planData' }, { status: 400 });
    }

    // Create server-side Supabase client using cookies for auth
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Ensure the userId matches the authenticated user
    if (user.id !== userId) {
      return NextResponse.json({ error: 'User ID mismatch' }, { status: 403 });
    }

    // === Project Limit Check ===
    const projectCheck = await checkProjectLimit(userId);
    if (!projectCheck.allowed) {
      return NextResponse.json({
        error: 'محدودیت تعداد پروژه',
        message: `شما به سقف ${projectCheck.limit} پروژه فعال رسیده‌اید. برای ایجاد پروژه جدید، پلن خود را ارتقا دهید.`,
        limitReached: true,
        used: projectCheck.used,
        limit: projectCheck.limit,
      }, { status: 403 });
    }

    const projectId = crypto.randomUUID();
    const projectName = planData.projectName || "New Project";
    const tagline = planData.tagline || "";

    console.log("📤 Server: Inserting project:", projectId, "for user:", userId);

    const { error } = await supabase
      .from('projects')
      .insert({
        id: projectId,
        user_id: userId,
        project_name: projectName,
        tagline: tagline,
        data: planData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error("❌ Server: Error creating project:", error.message, error.code, error.details);
      return NextResponse.json({ error: error.message || 'Failed to create project' }, { status: 500 });
    }

    console.log("✅ Server: Project created:", projectId);
    return NextResponse.json({ id: projectId });
  } catch (error: any) {
    console.error("Server error:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
