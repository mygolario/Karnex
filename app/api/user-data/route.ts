import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function getSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
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
}

// GET /api/user-data?type=profile|projects|all
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const type = url.searchParams.get('type') || 'all';

    const supabase = await getSupabaseServer();
    
    // Verify auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const result: any = { userId: user.id };

    // Fetch profile
    if (type === 'profile' || type === 'all') {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Server: Error fetching profile:", profileError.message);
      }
      
      if (!profile) {
        // Create profile if it doesn't exist
        const newProfile = {
          id: user.id,
          email: user.email || "",
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || "",
          role: 'user',
          subscription: {
            planId: 'free',
            status: 'active',
            autoRenew: false
          },
          credits: {
            aiTokens: 10,
            projectsUsed: 0
          },
          settings: {
            emailNotifications: true,
            smsNotifications: false,
            theme: 'system',
            language: 'fa'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (insertError) {
          console.error("Server: Error creating profile:", insertError.message);
          // Try fetching again in case of race condition
          const { data: retryProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          result.profile = retryProfile;
        } else {
          result.profile = newProfile;
        }
      } else {
        result.profile = profile;
      }
    }

    // Fetch projects
    if (type === 'projects' || type === 'all') {
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (projectsError) {
        console.error("Server: Error fetching projects:", projectsError.message);
        result.projects = [];
      } else {
        result.projects = (projects || []).map((p: any) => ({
          id: p.id,
          ...p.data,
          projectName: p.project_name,
          tagline: p.tagline,
          updatedAt: p.updated_at,
          createdAt: p.created_at
        }));
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Server error in user-data:", error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
