/**
 * Subscription Service
 * 
 * Manages user subscriptions, feature access, and billing.
 */

import { createClient } from '@/lib/supabase';
import { 
  Subscription, 
  SubscriptionStatus, 
  SubscriptionUpdate,
  Transaction,
  TransactionStatus,
  PlanTier,
  FeatureFlags,
  DEFAULT_FEATURES,
  BillingCycle
} from '../payment/types';
import { getPlanById } from '../payment/pricing';

// === Subscription Management ===

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
       console.error('Error getting subscription:', error);
       return null;
    }
    
    if (!data) {
      return null;
    }
    
    return {
      id: data.id,
      userId: data.user_id,
      planId: data.plan_id,
      tier: data.tier as PlanTier,
      status: data.status as SubscriptionStatus,
      billingCycle: data.billing_cycle as BillingCycle,
      currentPeriodStart: new Date(data.current_period_start),
      currentPeriodEnd: new Date(data.current_period_end),
      cancelAtPeriodEnd: data.cancel_at_period_end || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
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
  const supabase = createClient();
  const plan = getPlanById(planId);
  if (!plan) {
    throw new Error(`Plan not found: ${planId}`);
  }
  
  const now = new Date();
  const periodEnd = new Date(now);
  
  if (billingCycle === 'monthly') {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  } else {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  }
  
  const subscriptionData = {
    user_id: userId,
    plan_id: planId,
    tier: plan.tier,
    status: 'active',
    billing_cycle: billingCycle,
    current_period_start: now.toISOString(),
    current_period_end: periodEnd.toISOString(),
    cancel_at_period_end: false,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  const { data, error } = await supabase
    .from('subscriptions')
    .upsert(subscriptionData, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  
  // Also update user profile for quick access if needed (optional since we query subscriptions table)
  // But let's keep it if other parts of the app rely on profile.subscription
  await supabase.from('profiles').update({
     subscription: {
        planId: planId,
        status: 'active',
        autoRenew: true
     }
  }).eq('id', userId);
  
  return {
    id: data.id,
    userId,
    planId,
    tier: plan.tier,
    status: 'active',
    billingCycle,
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Update subscription
 */
export async function updateSubscription(
  userId: string,
  updates: SubscriptionUpdate
): Promise<void> {
  const supabase = createClient();
  
  const dbUpdates: any = {
      updated_at: new Date().toISOString()
  };

  if (updates.status) dbUpdates.status = updates.status;
  if (updates.cancelAtPeriodEnd !== undefined) dbUpdates.cancel_at_period_end = updates.cancelAtPeriodEnd;
  if (updates.currentPeriodEnd) dbUpdates.current_period_end = updates.currentPeriodEnd.toISOString();
  if (updates.planId) dbUpdates.plan_id = updates.planId;
  // Add other mappings as needed

  const { error } = await supabase
    .from('subscriptions')
    .update(dbUpdates)
    .eq('user_id', userId);

  if (error) throw error;
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
  
  // For number/unlimited features, true if > 0 or 'unlimited'
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
  
  // Boolean features don't have limits
  return value ? 'unlimited' : 0;
}

// === Transaction History ===

/**
 * Record a transaction
 */
export async function recordTransaction(
  transaction: Omit<Transaction, 'id' | 'createdAt'>
): Promise<string> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      user_id: transaction.userId,
      plan_id: transaction.planId,
      subscription_id: transaction.subscriptionId,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      gateway: transaction.gateway,
      card_pan: transaction.cardPan,
      ref_id: transaction.refId,
      description: transaction.description,
      metadata: transaction.metadata,
      created_at: new Date().toISOString(),
      completed_at: transaction.completedAt ? transaction.completedAt.toISOString() : null
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  additionalData?: Partial<Transaction>
): Promise<void> {
  const supabase = createClient();
  
  const updates: any = { status };
  
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  } else if (status === 'refunded') {
    updates.refunded_at = new Date().toISOString();
  }
  
  if (additionalData) {
     if (additionalData.refId) updates.ref_id = additionalData.refId;
     if (additionalData.metadata) updates.metadata = additionalData.metadata;
     // map other fields if needed
  }
  
  const { error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', transactionId);

  if (error) throw error;
}

/**
 * Get user's transaction history
 */
export async function getUserTransactions(
  userId: string,
  limitCount = 10
): Promise<Transaction[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limitCount);
  
  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  
  return data.map((t: any) => ({
    id: t.id,
    userId: t.user_id,
    planId: t.plan_id,
    subscriptionId: t.subscription_id,
    amount: t.amount,
    currency: t.currency,
    status: t.status,
    gateway: t.gateway,
    refId: t.ref_id,
    cardPan: t.card_pan,
    description: t.description,
    metadata: t.metadata,
    createdAt: new Date(t.created_at),
    completedAt: t.completed_at ? new Date(t.completed_at) : undefined,
    refundedAt: t.refunded_at ? new Date(t.refunded_at) : undefined,
  })) as Transaction[];
}
