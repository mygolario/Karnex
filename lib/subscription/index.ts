/**
 * Subscription Service
 * 
 * Manages user subscriptions, feature access, and billing.
 */

import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { app } from '@/lib/firebase';
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

const db = getFirestore(app);

// === Subscription Management ===

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string): Promise<Subscription | null> {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      return null;
    }
    
    const data = subscriptionDoc.data();
    return {
      id: subscriptionDoc.id,
      userId,
      planId: data.planId,
      tier: data.tier as PlanTier,
      status: data.status as SubscriptionStatus,
      billingCycle: data.billingCycle as BillingCycle,
      currentPeriodStart: data.currentPeriodStart?.toDate() || new Date(),
      currentPeriodEnd: data.currentPeriodEnd?.toDate() || new Date(),
      cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
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
  
  const subscription: Omit<Subscription, 'id'> = {
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
  
  const subscriptionRef = doc(db, 'subscriptions', userId);
  await setDoc(subscriptionRef, {
    ...subscription,
    currentPeriodStart: Timestamp.fromDate(now),
    currentPeriodEnd: Timestamp.fromDate(periodEnd),
    createdAt: Timestamp.fromDate(now),
    updatedAt: Timestamp.fromDate(now),
  });
  
  // Also update user document for quick access
  const userRef = doc(db, 'users', userId);
  await setDoc(userRef, {
    subscriptionStatus: plan.tier,
    subscriptionDate: Timestamp.fromDate(now),
    planId,
  }, { merge: true });
  
  return { id: userId, ...subscription };
}

/**
 * Update subscription
 */
export async function updateSubscription(
  userId: string,
  updates: SubscriptionUpdate
): Promise<void> {
  const subscriptionRef = doc(db, 'subscriptions', userId);
  await updateDoc(subscriptionRef, {
    ...updates,
    updatedAt: Timestamp.now(),
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
  const transactionsRef = collection(db, 'transactions');
  const newTransactionRef = doc(transactionsRef);
  
  await setDoc(newTransactionRef, {
    ...transaction,
    createdAt: Timestamp.now(),
  });
  
  return newTransactionRef.id;
}

/**
 * Update transaction status
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: TransactionStatus,
  additionalData?: Partial<Transaction>
): Promise<void> {
  const transactionRef = doc(db, 'transactions', transactionId);
  
  const updates: Record<string, unknown> = { status };
  
  if (status === 'completed') {
    updates.completedAt = Timestamp.now();
  } else if (status === 'refunded') {
    updates.refundedAt = Timestamp.now();
  }
  
  if (additionalData) {
    Object.assign(updates, additionalData);
  }
  
  await updateDoc(transactionRef, updates);
}

/**
 * Get user's transaction history
 */
export async function getUserTransactions(
  userId: string,
  limitCount = 10
): Promise<Transaction[]> {
  const transactionsRef = collection(db, 'transactions');
  const q = query(
    transactionsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      userId: data.userId,
      planId: data.planId,
      subscriptionId: data.subscriptionId,
      amount: data.amount,
      currency: data.currency,
      status: data.status,
      gateway: data.gateway,
      gatewayRef: data.gatewayRef,
      refId: data.refId,
      cardPan: data.cardPan,
      description: data.description,
      metadata: data.metadata,
      createdAt: data.createdAt?.toDate() || new Date(),
      completedAt: data.completedAt?.toDate(),
      refundedAt: data.refundedAt?.toDate(),
    } as Transaction;
  });
}
