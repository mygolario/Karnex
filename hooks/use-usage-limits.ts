"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface UsageCheckResult {
  allowed: boolean;
  used: number;
  limit: number | 'unlimited';
  remaining: number | 'unlimited';
}

interface UsageSummary {
  ai: UsageCheckResult;
  projects: UsageCheckResult;
  tier: string;
}

interface UseUsageLimitsReturn {
  ai: UsageCheckResult | null;
  projects: UsageCheckResult | null;
  tier: string;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  aiLimitReached: boolean;
  projectLimitReached: boolean;
}

export function useUsageLimits(): UseUsageLimitsReturn {
  const { user } = useAuth();
  const [data, setData] = useState<UsageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/usage');
      if (!res.ok) throw new Error('Failed to fetch usage');

      const summary: UsageSummary = await res.json();
      setData(summary);
    } catch (err) {
      console.error('Error fetching usage:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsage();
  }, [fetchUsage]);

  return {
    ai: data?.ai || null,
    projects: data?.projects || null,
    tier: data?.tier || 'free',
    isLoading,
    error,
    refresh: fetchUsage,
    aiLimitReached: data?.ai ? !data.ai.allowed : false,
    projectLimitReached: data?.projects ? !data.projects.allowed : false,
  };
}
