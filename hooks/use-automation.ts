"use client";

import { useEffect, useCallback } from 'react';
import { automationEngine, emitAutomationEvent } from '@/lib/automation';
import type { AutomationTrigger, AutomationContext, SmartNotification } from '@/lib/automation';
import { useNotification } from '@/contexts/notification-context';
import { useLocale } from '@/hooks/use-translations';

/**
 * Hook to integrate the automation engine with React components
 * Connects automation events to the notification system
 */
export function useAutomation() {
  const { showNotification } = useNotification();
  const { locale } = useLocale();

  // Connect automation engine to notification system
  useEffect(() => {
    const handleNotification = (notification: SmartNotification) => {
      // Map SmartNotification to simple notification type
      const typeMap: Record<SmartNotification['type'], 'success' | 'info' | 'error'> = {
        welcome: 'success',
        milestone: 'success',
        reminder: 'info',
        suggestion: 'info',
        achievement: 'success',
        update: 'info',
        warning: 'error',
        system: 'info',
      };
      
      showNotification(typeMap[notification.type], notification.message, 6000);
    };

    automationEngine.setNotificationHandler(handleNotification);
  }, [showNotification]);

  // Helper to emit events with current locale
  const emit = useCallback((trigger: AutomationTrigger, context: Omit<AutomationContext, 'locale'>) => {
    emitAutomationEvent(trigger, {
      ...context,
      locale: locale as 'en' | 'fa',
    });
  }, [locale]);

  return {
    emit,
    emitUserSignup: (userId: string) => emit('user_signup', { userId }),
    emitProjectCreated: (userId: string, projectId: string, projectName: string) => 
      emit('project_created', { userId, projectId, projectName }),
    emitStepCompleted: (userId: string, projectId: string, stepName: string, completedSteps: number, totalSteps: number) =>
      emit('roadmap_step_completed', { userId, projectId, stepName, completedSteps, totalSteps }),
    emitAllStepsCompleted: (userId: string, projectId: string, projectName: string) =>
      emit('all_steps_completed', { userId, projectId, projectName }),
    emitPlanGenerated: (userId: string, projectId: string, projectName: string) =>
      emit('plan_generated', { userId, projectId, projectName }),
  };
}

/**
 * Hook to request push notification permission
 */
export function usePushNotifications() {
  const requestPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'unsupported';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    if (Notification.permission === 'denied') {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    return permission;
  }, []);

  const isSupported = typeof window !== 'undefined' && 'Notification' in window;
  const permission = typeof window !== 'undefined' && 'Notification' in window 
    ? Notification.permission 
    : 'unsupported';

  return {
    isSupported,
    permission,
    requestPermission,
  };
}
