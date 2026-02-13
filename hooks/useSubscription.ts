/**
 * useSubscription Hook
 * 
 * React hook for accessing user subscription state and feature access.
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
// Imports removed to prevent server code leaking to client
// import { 
//   getUserSubscription, 
//   getUserTier, 
//   getUserFeatures,
// } from '@/lib/subscription';
import { 
  Subscription, 
  PlanTier, 
  FeatureFlags,
  DEFAULT_FEATURES 
} from '@/lib/payment/types';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  tier: PlanTier;
  features: FeatureFlags;
  loading: boolean;
  error: Error | null;
  isPlus: boolean;
  isPro: boolean;
  isUltra: boolean;
  isPaid: boolean;
  hasFeature: (feature: keyof FeatureFlags) => boolean;
  getLimit: (feature: keyof FeatureFlags) => number | 'unlimited';
  refresh: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user, loading: authLoading } = useAuth();
  
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tier, setTier] = useState<PlanTier>('free');
  const [features, setFeatures] = useState<FeatureFlags>(DEFAULT_FEATURES.free);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setTier('free');
      setFeatures(DEFAULT_FEATURES.free);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/user-data?type=subscription');
      if (!res.ok) throw new Error('Failed to fetch subscription');
      
      const data = await res.json();
      
      setSubscription(data.subscription || null);
      setTier(data.tier || 'free');
      setFeatures(data.features || DEFAULT_FEATURES.free);
    } catch (err) {
      console.error('Error fetching subscription:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
      // Fall back to free tier on error
      setTier('free');
      setFeatures(DEFAULT_FEATURES.free);
    } finally {
      setLoading(false);
    }
  }, [user]);
  
  useEffect(() => {
    if (!authLoading) {
      fetchSubscription();
    }
  }, [authLoading, fetchSubscription]);
  
  // Helper functions
  const hasFeature = useCallback((feature: keyof FeatureFlags): boolean => {
    const value = features[feature];
    if (typeof value === 'boolean') return value;
    return value === 'unlimited' || (typeof value === 'number' && value > 0);
  }, [features]);
  
  const getLimit = useCallback((feature: keyof FeatureFlags): number | 'unlimited' => {
    const value = features[feature];
    if (value === 'unlimited' || typeof value === 'number') return value;
    return value ? 'unlimited' : 0;
  }, [features]);
  
  return {
    subscription,
    tier,
    features,
    loading: loading || authLoading,
    error,
    isPlus: tier === 'plus' || tier === 'pro' || tier === 'ultra',
    isPro: tier === 'pro' || tier === 'ultra',
    isUltra: tier === 'ultra',
    isPaid: tier !== 'free',
    hasFeature,
    getLimit,
    refresh: fetchSubscription,
  };
}

/**
 * useFeatureGate Hook
 * 
 * Simple hook for checking if a specific feature is available.
 */
export function useFeatureGate(feature: keyof FeatureFlags) {
  const { hasFeature, loading, tier } = useSubscription();
  
  return {
    isEnabled: hasFeature(feature),
    loading,
    tier,
  };
}

/**
 * useUpgradePrompt Hook
 * 
 * Hook for showing upgrade prompts when limits are reached.
 */
export function useUpgradePrompt() {
  const { tier, isPaid } = useSubscription();
  const [showPrompt, setShowPrompt] = useState(false);
  const [requiredTier, setRequiredTier] = useState<PlanTier>('plus');
  
  const promptUpgrade = useCallback((minTier: PlanTier = 'plus') => {
    setRequiredTier(minTier);
    setShowPrompt(true);
  }, []);
  
  const dismissPrompt = useCallback(() => {
    setShowPrompt(false);
  }, []);
  
  return {
    showPrompt,
    requiredTier,
    currentTier: tier,
    promptUpgrade,
    dismissPrompt,
    needsUpgrade: !isPaid,
  };
}
