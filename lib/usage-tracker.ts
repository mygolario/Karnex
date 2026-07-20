"use server";

/**
 * Usage Tracker
 * 
 * Server-side utility for tracking and enforcing usage limits.
 * Tracks monthly AI request counts and project counts per user.
 */

import prisma from '@/lib/prisma';
import { DEFAULT_FEATURES, PlanTier, resolveFeatureTier } from '@/lib/payment/types';
import { auth } from '@/lib/auth/session';
import { syncUserCreditsToEmailQuota } from '@/lib/auth/email-ai-quota';
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
 * Get user's current tier from subscription (normalized for launch feature map)
 */
async function getUserPlanTier(userId: string): Promise<PlanTier> {
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { planId: true, status: true, endDate: true }
  });
  
  if (!sub || sub.status !== 'active') {
    return 'free';
  }

  if (sub.endDate && sub.endDate < new Date()) {
    return 'free';
  }
  
  return resolveFeatureTier(sub.planId || 'free');
}

/**
 * Check if user can spend `credits` AI credits (default 1).
 */
export async function checkAIRequestLimit(
  userId: string,
  creditsNeeded = 1,
): Promise<UsageCheckResult> {
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

  const credits = (user?.credits as Record<string, unknown>) || {};
  const aiUsage = (credits.aiRequests as Record<string, number>) || {};
  const used = aiUsage[currentMonth] || 0;
  
  const remaining = Math.max(0, limit - used);
  
  return {
    allowed: used + creditsNeeded <= limit,
    used,
    limit,
    remaining,
  };
}

/**
 * Increment AI credit usage for the current month
 */
export async function incrementAIUsage(userId: string, amount = 1): Promise<void> {
  const currentMonth = getCurrentMonth();
  const delta = Math.max(1, Math.floor(amount));
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, email: true }
  });

  const credits = (user?.credits as Record<string, unknown>) || {};
  const aiUsage = (credits.aiRequests as Record<string, number>) || {};
  const currentCount = aiUsage[currentMonth] || 0;
  
  const newCredits = {
    ...credits,
    aiRequests: {
      ...aiUsage,
      [currentMonth]: currentCount + delta
    }
  };

  await prisma.user.update({
    where: { id: userId },
    data: { credits: newCredits }
  });

  try {
    await syncUserCreditsToEmailQuota(user?.email, newCredits);
  } catch (err) {
    console.error("[usage-tracker] Failed to sync email AI quota:", err);
  }
}

/**
 * Decrement AI credit usage (refund on failure)
 */
export async function decrementAIUsage(userId: string, amount = 1): Promise<void> {
  const currentMonth = getCurrentMonth();
  const delta = Math.max(1, Math.floor(amount));
  
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, email: true }
  });

  const credits = (user?.credits as Record<string, unknown>) || {};
  const aiUsage = (credits.aiRequests as Record<string, number>) || {};
  const currentCount = aiUsage[currentMonth] || 0;
  
  if (currentCount <= 0) return;

  const newCredits = {
    ...credits,
    aiRequests: {
      ...aiUsage,
      [currentMonth]: Math.max(0, currentCount - delta)
    }
  };

  await prisma.user.update({
    where: { id: userId },
    data: { credits: newCredits }
  });

  try {
    await syncUserCreditsToEmailQuota(user?.email, newCredits);
  } catch (err) {
    console.error("[usage-tracker] Failed to sync email AI quota:", err);
  }
}

/**
 * Check if user can create another project
 */
export async function checkProjectLimit(userId: string): Promise<UsageCheckResult> {
  const tier = await getUserPlanTier(userId);
  const limits = DEFAULT_FEATURES[resolveFeatureTier(tier)];
  const limit = limits.projectLimit;
  
  if (limit === 'unlimited') {
    return { allowed: true, used: 0, limit: 'unlimited', remaining: 'unlimited' };
  }
  
  const count = await prisma.project.count({
    where: { userId, deletedAt: null }
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

export async function getMyUsageSummaryAction(): Promise<{ success: boolean; summary?: UsageSummary; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: 'Unauthorized' };
    }
    const summary = await getUsageSummary(session.user.id);
    return { success: true, summary };
  } catch (error) {
    console.error("Failed to get usage summary:", error);
    return { success: false, error: 'Failed to fetch usage summary' };
  }
}
