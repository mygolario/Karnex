/**
 * Usage Tracker
 * 
 * Server-side utility for tracking and enforcing usage limits.
 * Tracks monthly AI request counts and project counts per user.
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DEFAULT_FEATURES, PlanTier } from '@/lib/payment/types';

export interface UsageCheckResult {
  allowed: boolean;
  used: number;
  limit: number | 'unlimited';
  remaining: number | 'unlimited';
}

export interface UsageSummary {
  ai: UsageCheckResult;
  projects: UsageCheckResult;
  tier: PlanTier;
}

/**
 * Create an authenticated server-side Supabase client
 */
async function getServerSupabase() {
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

/**
 * Get the current month key in format 'YYYY-MM'
 */
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get user's current tier from subscription
 */
async function getUserPlanTier(userId: string): Promise<PlanTier> {
  const supabase = await getServerSupabase();
  
  const { data } = await supabase
    .from('subscriptions')
    .select('tier, status')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (!data || data.status !== 'active') {
    return 'free';
  }
  
  return data.tier as PlanTier;
}

/**
 * Check if user can make another AI request
 */
export async function checkAIRequestLimit(userId: string): Promise<UsageCheckResult> {
  const tier = await getUserPlanTier(userId);
  const limits = DEFAULT_FEATURES[tier];
  const limit = limits.aiRequestsPerMonth;
  
  if (limit === 'unlimited') {
    return { allowed: true, used: 0, limit: 'unlimited', remaining: 'unlimited' };
  }
  
  const supabase = await getServerSupabase();
  const currentMonth = getCurrentMonth();
  
  const { data } = await supabase
    .from('api_usage')
    .select('request_count')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .maybeSingle();
  
  const used = data?.request_count || 0;
  const remaining = Math.max(0, limit - used);
  
  return {
    allowed: used < limit,
    used,
    limit,
    remaining,
  };
}

/**
 * Increment AI request count for the current month
 */
export async function incrementAIUsage(userId: string): Promise<void> {
  const supabase = await getServerSupabase();
  const currentMonth = getCurrentMonth();
  
  // Try to update existing row
  const { data: existing } = await supabase
    .from('api_usage')
    .select('id, request_count')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .maybeSingle();
  
  if (existing) {
    await supabase
      .from('api_usage')
      .update({ 
        request_count: existing.request_count + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('api_usage')
      .insert({
        user_id: userId,
        month: currentMonth,
        request_count: 1,
      });
  }
}

/**
 * Check if user can create another project
 */
export async function checkProjectLimit(userId: string): Promise<UsageCheckResult> {
  const tier = await getUserPlanTier(userId);
  const limits = DEFAULT_FEATURES[tier];
  const limit = limits.projectLimit;
  
  if (limit === 'unlimited') {
    return { allowed: true, used: 0, limit: 'unlimited', remaining: 'unlimited' };
  }
  
  const supabase = await getServerSupabase();
  
  const { count } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  const used = count || 0;
  const remaining = Math.max(0, limit - used);
  
  return {
    allowed: used < limit,
    used,
    limit,
    remaining,
  };
}

/**
 * Get full usage summary for a user
 */
export async function getUsageSummary(userId: string): Promise<UsageSummary> {
  const tier = await getUserPlanTier(userId);
  const [ai, projects] = await Promise.all([
    checkAIRequestLimit(userId),
    checkProjectLimit(userId),
  ]);
  
  return { ai, projects, tier };
}
