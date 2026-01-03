"use client";

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { analytics, ANALYTICS_EVENTS, EventProperties, AnalyticsEventName } from '@/lib/analytics';

/**
 * Hook for analytics tracking in React components
 */
export function useAnalytics() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Initialize analytics and identify user
  useEffect(() => {
    analytics.init();
  }, []);

  // Identify user when they log in
  useEffect(() => {
    if (user) {
      analytics.identify(user.uid, {
        email: user.email || undefined,
        name: user.displayName || undefined,
      });
    } else {
      analytics.reset();
    }
  }, [user]);

  // Track page views
  useEffect(() => {
    analytics.pageView(pathname);
  }, [pathname]);

  // Track custom event
  const track = useCallback((
    event: AnalyticsEventName | string, 
    properties?: EventProperties
  ) => {
    analytics.track(event, properties);
  }, []);

  // Convenience methods for common events
  const trackClick = useCallback((
    buttonName: string, 
    properties?: EventProperties
  ) => {
    analytics.track(ANALYTICS_EVENTS.BUTTON_CLICK, {
      button: buttonName,
      ...properties,
    });
  }, []);

  const trackFeatureUsed = useCallback((
    feature: string, 
    properties?: EventProperties
  ) => {
    analytics.track(ANALYTICS_EVENTS.FEATURE_USED, {
      feature,
      ...properties,
    });
  }, []);

  return {
    track,
    trackClick,
    trackFeatureUsed,
    events: ANALYTICS_EVENTS,
  };
}

/**
 * Hook for tracking a specific feature's usage
 */
export function useFeatureTracking(featureName: string) {
  const { trackFeatureUsed } = useAnalytics();

  const trackUsage = useCallback((
    action?: string,
    properties?: EventProperties
  ) => {
    trackFeatureUsed(featureName, {
      action,
      ...properties,
    });
  }, [featureName, trackFeatureUsed]);

  return trackUsage;
}
