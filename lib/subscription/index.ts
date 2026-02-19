"use server";

import prisma from "@/lib/prisma";
import { 
  Subscription, 
  SubscriptionStatus, 
  SubscriptionUpdate,
  Transaction,
  TransactionStatus,
  PlanTier,
  FeatureFlags,
  DEFAULT_FEATURES,
  BillingCycle,
  Currency
} from '../payment/types';
import { getPlanById } from '../payment/pricing';

// === Subscription Management ===

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const data = await prisma.subscription.findUnique({
      where: { userId },
    });
    
    if (!data) {
      return null;
    }
    
    // Map Prisma model to Subscription interface
    // Assuming Prisma schema has compatible fields or mapped here
    // Verify Prisma Schema fields: status, billingCycle etc.
    // If schema uses camelCase vs snake_case in Supabase, adjust.
    // I defined schema previously. Let's assume standard camelCase for Prisma.
    
    return {
      id: data.id,
      userId: data.userId,
      planId: data.planId,
      tier: (getPlanById(data.planId)?.tier || 'free') as PlanTier, 
      status: data.status as SubscriptionStatus,
      billingCycle: data.billingCycle as BillingCycle,
      currentPeriodStart: data.startDate, // aligned with previous schema 'startDate' vs 'currentPeriodStart'
      currentPeriodEnd: data.endDate ?? null,
      cancelAtPeriodEnd: false, // Add this to schema if missing, or default false
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  } catch (error) {
    console.error('Error getting subscription:', error);
    return null;
  }
}

/**
 * Get user's effective tier (with defaults)
 */
export async function getUserTier(userId: string): Promise<PlanTier> {
  const subscription = await getUserSubscription(userId);
  
  if (!subscription || subscription.status !== 'active') {
    return 'free';
  }
  
  // Enforce subscription expiry — downgrade to free if period has ended
  if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) {
    // Lazily mark as expired in DB (fire-and-forget)
    updateSubscription(userId, { status: 'expired' }).catch(console.error);
    return 'free';
  }
  
  return subscription.tier;
}

/**
 * Create or upgrade subscription
 */
export async function createSubscription(
  userId: string,
  planId: string,
  billingCycle: BillingCycle
): Promise<Subscription> {
  const plan = getPlanById(planId);
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }
  
  const now = new Date();
  const periodEnd = new Date(now);
  
  if (billingCycle === 'monthly') {
    // Fixed 30 days for monthly per user request
    periodEnd.setDate(periodEnd.getDate() + 30);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }
  
  const data = await prisma.subscription.upsert({
    where: { userId },
    update: {
      planId,
      status: 'active',
      billingCycle,
      startDate: now,
      endDate: periodEnd,
      updatedAt: now,
      // tier is derived from planId, not stored redundantly usually, but interface needs it
    },
    create: {
      userId,
      planId,
      status: 'active',
      billingCycle,
      startDate: now,
      endDate: periodEnd,
    }
  });
  
  // Update Profile if needed (optional)
  // await prisma.user.update(...)

  return {
    id: data.id,
    userId: data.userId,
    planId: data.planId,
    tier: plan.tier,
    status: 'active',
    billingCycle,
    currentPeriodStart: data.startDate,
    currentPeriodEnd: data.endDate,
    cancelAtPeriodEnd: false,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as Subscription; // Cast if type mismatch on date fields
}

/**
 * Update subscription
 */
export async function updateSubscription(
  userId: string,
  updates: SubscriptionUpdate
): Promise<void> {
  
  const dbUpdates: any = {
      updatedAt: new Date()
  };

  if (updates.status) dbUpdates.status = updates.status;
  // if (updates.cancelAtPeriodEnd !== undefined) dbUpdates.cancelAtPeriodEnd = updates.cancelAtPeriodEnd;
  if (updates.currentPeriodEnd) dbUpdates.endDate = updates.currentPeriodEnd;
  if (updates.planId) dbUpdates.planId = updates.planId;
 
  await prisma.subscription.update({
    where: { userId },
    data: dbUpdates
  });
}

/**
 * Cancel subscription (at period end)
 */
export async function cancelSubscription(userId: string): Promise<void> {
  await updateSubscription(userId, {
    cancelAtPeriodEnd: true,
  });
}

/**
 * Reactivate cancelled subscription
 */
export async function reactivateSubscription(userId: string): Promise<void> {
  await updateSubscription(userId, {
    cancelAtPeriodEnd: false,
  });
}

// === Feature Access ===

/**
 * Get feature flags for user
 */
export async function getUserFeatures(userId: string): Promise<FeatureFlags> {
  const tier = await getUserTier(userId);
  return DEFAULT_FEATURES[tier];
}

/**
 * Check if user has access to a specific feature
 */
export async function hasFeatureAccess(
  userId: string, 
  feature: keyof FeatureFlags
): Promise<boolean> {
  const features = await getUserFeatures(userId);
  const value = features[feature];
  
  if (typeof value === 'boolean') {
    return value;
  }
  
  return value === 'unlimited' || (typeof value === 'number' && value > 0);
}

/**
 * Get feature limit for user
 */
export async function getFeatureLimit(
  userId: string, 
  feature: keyof FeatureFlags
): Promise<number | 'unlimited'> {
  const features = await getUserFeatures(userId);
  const value = features[feature];
  
  if (value === 'unlimited' || typeof value === 'number') {
    return value;
  }
  
  return value ? 'unlimited' : 0;
}

// === Transaction History ===

/**
 * Record a new transaction
 */
export async function recordTransaction(data: {
  userId: string;
  planId?: string;
  subscriptionId?: string; // Add this to match interface
  amount: number;
  currency: string;
  status: TransactionStatus;
  gateway: string;
  gatewayRef?: string;
  refId?: string;
  cardPan?: string;
  description?: string;
  metadata?: any;
  completedAt?: Date;
}): Promise<string> {
  
  const tx = await prisma.transaction.create({
    data: {
      userId: data.userId,
      planId: data.planId,
      // subscriptionId: data.subscriptionId, // Add to schema if needed
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      gateway: data.gateway,
      trackId: data.gatewayRef,
      refId: data.refId,
      cardPan: data.cardPan,
      description: data.description,
      metadata: data.metadata ? data.metadata : undefined,
      completedAt: data.completedAt,
    }
  });

  return tx.id;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  additionalData?: Partial<Transaction>
): Promise<void> {
  
  const updates: any = { status };
  
  if (status === 'completed') {
    updates.completedAt = new Date();
  } else if (status === 'refunded') {
    updates.refundedAt = new Date(); // Ensure schema has this
  }
  
  if (additionalData) {
     if (additionalData.refId) updates.refId = additionalData.refId;
     // if (additionalData.metadata) updates.metadata = additionalData.metadata;
  }
  
  await prisma.transaction.update({
    where: { id: transactionId },
    data: updates
  });
}

/**
 * Get user's transaction history
 */
export async function getUserTransactions(
  userId: string,
  limitCount = 10
): Promise<Transaction[]> {
  const txs = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limitCount
  });
  
  return txs.map(t => ({
    id: t.id,
    userId: t.userId,
    planId: t.planId || "",
    amount: t.amount,
    currency: t.currency as Currency,
    status: t.status as TransactionStatus,
    gateway: t.gateway,
    refId: t.refId || undefined,
    cardPan: t.cardPan || undefined,
    description: t.description || "No description",
    createdAt: t.createdAt,
    completedAt: t.completedAt || undefined,
  }));
}
