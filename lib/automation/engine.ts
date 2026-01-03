// Automation Engine - Event Bus and Rule Execution
// This is the core of the smart automation system

import { 
  AutomationTrigger, 
  AutomationContext, 
  AutomationRule, 
  DEFAULT_AUTOMATION_RULES,
  NOTIFICATION_TEMPLATES,
  SmartNotification,
  NotificationChannel
} from './types';

type EventListener = (context: AutomationContext) => void;

class AutomationEngine {
  private static instance: AutomationEngine;
  private rules: AutomationRule[] = DEFAULT_AUTOMATION_RULES;
  private listeners: Map<AutomationTrigger, EventListener[]> = new Map();
  private cooldowns: Map<string, number> = new Map();
  private notificationQueue: SmartNotification[] = [];
  private onNotification: ((notification: SmartNotification) => void) | null = null;

  private constructor() {
    // Initialize listeners for each trigger type
    const triggers: AutomationTrigger[] = [
      'user_signup',
      'project_created',
      'roadmap_step_completed',
      'all_steps_completed',
      'inactive_7_days',
      'inactive_14_days',
      'plan_generated',
      'first_login_after_break',
      'competitor_data_stale',
      'legal_checklist_incomplete'
    ];
    
    triggers.forEach(trigger => {
      this.listeners.set(trigger, []);
    });
  }

  static getInstance(): AutomationEngine {
    if (!AutomationEngine.instance) {
      AutomationEngine.instance = new AutomationEngine();
    }
    return AutomationEngine.instance;
  }

  // Register notification handler
  setNotificationHandler(handler: (notification: SmartNotification) => void) {
    this.onNotification = handler;
    // Flush any queued notifications
    this.notificationQueue.forEach(n => handler(n));
    this.notificationQueue = [];
  }

  // Emit an event
  emit(trigger: AutomationTrigger, context: AutomationContext) {
    console.log(`[Automation] Event: ${trigger}`, context);
    
    // Find matching rules
    const matchingRules = this.rules
      .filter(rule => rule.trigger === trigger && rule.enabled)
      .filter(rule => !rule.condition || rule.condition(context))
      .filter(rule => !this.isOnCooldown(rule.id, rule.cooldownMinutes))
      .sort((a, b) => a.priority - b.priority);

    // Execute each matching rule
    matchingRules.forEach(rule => {
      this.executeRule(rule, context);
      if (rule.cooldownMinutes) {
        this.setCooldown(rule.id, rule.cooldownMinutes);
      }
    });

    // Call registered listeners
    const listeners = this.listeners.get(trigger) || [];
    listeners.forEach(listener => listener(context));
  }

  // Execute a rule
  private executeRule(rule: AutomationRule, context: AutomationContext) {
    const { action } = rule;
    const locale = context.locale || 'fa';
    const template = NOTIFICATION_TEMPLATES[action.template];
    
    if (!template) {
      console.warn(`[Automation] Template not found: ${action.template}`);
      return;
    }

    const localizedContent = template[locale];
    
    // Replace variables in message
    let message = localizedContent.message;
    let title = localizedContent.title;
    
    if (context.projectName) {
      message = message.replace('{projectName}', context.projectName);
      title = title.replace('{projectName}', context.projectName);
    }
    if (context.stepName) {
      message = message.replace('{stepName}', context.stepName);
      title = title.replace('{stepName}', context.stepName);
    }
    if (action.variables) {
      Object.entries(action.variables).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, value);
        title = title.replace(`{${key}}`, value);
      });
    }

    const notification: SmartNotification = {
      id: `${rule.id}-${Date.now()}`,
      type: this.getNotificationType(action.template),
      title,
      message,
      channel: action.channels,
      priority: action.priority,
      actionUrl: this.getActionUrl(action.template, context),
      actionLabel: localizedContent.actionLabel,
      createdAt: new Date().toISOString(),
      metadata: {
        ruleId: rule.id,
        trigger: rule.trigger,
        projectId: context.projectId,
      }
    };

    console.log(`[Automation] Sending notification:`, notification);

    // Send to each channel
    action.channels.forEach(channel => {
      this.sendToChannel(channel, notification);
    });

    // Trigger in-app notification
    if (action.channels.includes('in-app')) {
      if (this.onNotification) {
        this.onNotification(notification);
      } else {
        this.notificationQueue.push(notification);
      }
    }
  }

  private sendToChannel(channel: NotificationChannel, notification: SmartNotification) {
    switch (channel) {
      case 'in-app':
        // Handled by onNotification callback
        break;
      case 'push':
        this.sendPushNotification(notification);
        break;
      case 'email':
        // TODO: Integrate with email service (Resend, SendGrid)
        console.log('[Automation] Email notification queued:', notification.title);
        break;
    }
  }

  private async sendPushNotification(notification: SmartNotification) {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        const reg = await navigator.serviceWorker?.ready;
        if (reg) {
          reg.showNotification(notification.title, {
            body: notification.message,
            icon: '/logo-icon-dark.png',
            badge: '/logo-icon-dark.png',
            tag: notification.id,
            data: {
              url: notification.actionUrl
            }
          });
        }
      } catch (error) {
        console.warn('[Automation] Push notification failed:', error);
      }
    }
  }

  private getNotificationType(template: string): SmartNotification['type'] {
    const typeMap: Record<string, SmartNotification['type']> = {
      welcome: 'welcome',
      project_created: 'milestone',
      step_completed: 'achievement',
      phase_complete: 'achievement',
      inactive_reminder: 'reminder',
      come_back: 'reminder',
      suggestion: 'suggestion',
    };
    return typeMap[template] || 'system';
  }

  private getActionUrl(template: string, context: AutomationContext): string {
    const urlMap: Record<string, string> = {
      welcome: '/new-project',
      project_created: '/dashboard/roadmap',
      step_completed: '/dashboard/roadmap',
      phase_complete: '/dashboard/overview',
      inactive_reminder: '/dashboard/overview',
      come_back: '/dashboard/overview',
    };
    return urlMap[template] || '/dashboard/overview';
  }

  private isOnCooldown(ruleId: string, cooldownMinutes?: number): boolean {
    if (!cooldownMinutes) return false;
    const lastRun = this.cooldowns.get(ruleId);
    if (!lastRun) return false;
    const cooldownMs = cooldownMinutes * 60 * 1000;
    return Date.now() - lastRun < cooldownMs;
  }

  private setCooldown(ruleId: string, cooldownMinutes: number) {
    this.cooldowns.set(ruleId, Date.now());
  }

  // Add custom rule
  addRule(rule: AutomationRule) {
    this.rules.push(rule);
  }

  // Remove rule
  removeRule(ruleId: string) {
    this.rules = this.rules.filter(r => r.id !== ruleId);
  }

  // Toggle rule
  toggleRule(ruleId: string, enabled: boolean) {
    const rule = this.rules.find(r => r.id === ruleId);
    if (rule) {
      rule.enabled = enabled;
    }
  }

  // Subscribe to events
  on(trigger: AutomationTrigger, listener: EventListener) {
    const listeners = this.listeners.get(trigger) || [];
    listeners.push(listener);
    this.listeners.set(trigger, listeners);
  }

  // Unsubscribe
  off(trigger: AutomationTrigger, listener: EventListener) {
    const listeners = this.listeners.get(trigger) || [];
    this.listeners.set(trigger, listeners.filter(l => l !== listener));
  }

  // Get all rules
  getRules(): AutomationRule[] {
    return [...this.rules];
  }
}

// Export singleton instance
export const automationEngine = AutomationEngine.getInstance();

// Convenience function for emitting events
export function emitAutomationEvent(trigger: AutomationTrigger, context: AutomationContext) {
  automationEngine.emit(trigger, context);
}
