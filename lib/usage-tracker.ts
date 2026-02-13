"use server";

/**
 * Usage Tracker
 * 
 * Server-side utility for tracking and enforcing usage limits.
 * Tracks monthly AI request counts and project counts per user.
 */

import prisma from '@/lib/prisma';
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
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { planId: true, status: true }
  });
  
  if (!sub || sub.status !== 'active') {
    return 'free';
  }
  
  return (sub.planId as PlanTier) || 'free';
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
  
  const currentMonth = getCurrentMonth();
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true }
  });

  const credits = (user?.credits as any) || {};
  const aiUsage = credits.aiRequests || {};
  const used = (aiUsage[currentMonth] as number) || 0;
  
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
  const currentMonth = getCurrentMonth();
  
  // Fetch current credits to update specifically the month key
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true }
  });

  const credits = (user?.credits as any) || {};
  const aiUsage = credits.aiRequests || {};
  const currentCount = (aiUsage[currentMonth] as number) || 0;
  
  const newCredits = {
    ...credits,
    aiRequests: {
      ...aiUsage,
      [currentMonth]: currentCount + 1
    }
  };

  await prisma.user.update({
    where: { id: userId },
    data: { credits: newCredits }
  });
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
  
  const count = await prisma.project.count({
    where: { userId }
  });
  
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
