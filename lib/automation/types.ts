// Smart Notification Types and Configuration
// This module defines the types and rules for the automation engine

export type NotificationChannel = 'in-app' | 'push' | 'email';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface SmartNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel[];
  priority: NotificationPriority;
  actionUrl?: string;
  actionLabel?: string;
  icon?: string;
  createdAt: string;
  readAt?: string;
  metadata?: Record<string, unknown>;
}

export type NotificationType = 
  | 'welcome'
  | 'milestone'
  | 'reminder'
  | 'suggestion'
  | 'achievement'
  | 'update'
  | 'warning'
  | 'system';

// Automation Trigger Types
export type AutomationTrigger = 
  | 'user_signup'
  | 'project_created'
  | 'roadmap_step_completed'
  | 'all_steps_completed'
  | 'inactive_7_days'
  | 'inactive_14_days'
  | 'plan_generated'
  | 'first_login_after_break'
  | 'competitor_data_stale'
  | 'legal_checklist_incomplete';

// Automation Rule Definition
export interface AutomationRule {
  id: string;
  trigger: AutomationTrigger;
  condition?: (context: AutomationContext) => boolean;
  action: AutomationAction;
  enabled: boolean;
  priority: number;
  cooldownMinutes?: number; // Prevent spam
}

export interface AutomationContext {
  userId: string;
  projectId?: string;
  projectName?: string;
  stepName?: string;
  completedSteps?: number;
  totalSteps?: number;
  daysSinceLastActivity?: number;
  locale?: 'en' | 'fa';
}

export interface AutomationAction {
  type: 'notification' | 'email' | 'webhook';
  template: string;
  channels: NotificationChannel[];
  priority: NotificationPriority;
  variables?: Record<string, string>;
}

// Pre-defined automation rules
export const DEFAULT_AUTOMATION_RULES: AutomationRule[] = [
  {
    id: 'welcome_new_user',
    trigger: 'user_signup',
    action: {
      type: 'notification',
      template: 'welcome',
      channels: ['in-app'],
      priority: 'high',
    },
    enabled: true,
    priority: 1,
  },
  {
    id: 'project_created_congrats',
    trigger: 'project_created',
    action: {
      type: 'notification',
      template: 'project_created',
      channels: ['in-app', 'push'],
      priority: 'normal',
    },
    enabled: true,
    priority: 2,
  },
  {
    id: 'step_completed_celebrate',
    trigger: 'roadmap_step_completed',
    action: {
      type: 'notification',
      template: 'step_completed',
      channels: ['in-app'],
      priority: 'low',
    },
    enabled: true,
    priority: 3,
    cooldownMinutes: 5, // Max one notification per 5 minutes
  },
  {
    id: 'all_steps_completed_achievement',
    trigger: 'all_steps_completed',
    action: {
      type: 'notification',
      template: 'phase_complete',
      channels: ['in-app', 'push', 'email'],
      priority: 'high',
    },
    enabled: true,
    priority: 1,
  },
  {
    id: 'inactive_reminder_7d',
    trigger: 'inactive_7_days',
    action: {
      type: 'notification',
      template: 'inactive_reminder',
      channels: ['email', 'push'],
      priority: 'normal',
    },
    enabled: true,
    priority: 4,
    cooldownMinutes: 60 * 24 * 7, // Once per week max
  },
  {
    id: 'inactive_warning_14d',
    trigger: 'inactive_14_days',
    action: {
      type: 'notification',
      template: 'come_back',
      channels: ['email'],
      priority: 'high',
    },
    enabled: true,
    priority: 3,
    cooldownMinutes: 60 * 24 * 14, // Once per 2 weeks max
  },
];

// Notification Templates (localized)
export const NOTIFICATION_TEMPLATES: Record<string, Record<'en' | 'fa', { title: string; message: string; actionLabel?: string }>> = {
  welcome: {
    en: {
      title: 'Welcome to Karnex! 🚀',
      message: 'Your entrepreneurship journey starts here. Create your first project to get started.',
      actionLabel: 'Create Project',
    },
    fa: {
      title: 'به کارنکس خوش آمدید! 🚀',
      message: 'سفر کارآفرینی شما از اینجا شروع می‌شود. اولین پروژه‌تان را بسازید.',
      actionLabel: 'ساخت پروژه',
    },
  },
  project_created: {
    en: {
      title: 'Project Created! 🎉',
      message: 'Your business plan for "{projectName}" is ready. Start executing your roadmap!',
      actionLabel: 'View Roadmap',
    },
    fa: {
      title: 'پروژه ساخته شد! 🎉',
      message: 'برنامه کسب‌وکار "{projectName}" آماده است. نقشه راه خود را اجرا کنید!',
      actionLabel: 'مشاهده نقشه راه',
    },
  },
  step_completed: {
    en: {
      title: 'Great Progress! ✅',
      message: 'You completed "{stepName}". Keep up the momentum!',
    },
    fa: {
      title: 'پیشرفت عالی! ✅',
      message: 'شما "{stepName}" را تکمیل کردید. ادامه بدهید!',
    },
  },
  phase_complete: {
    en: {
      title: 'Phase Complete! 🏆',
      message: 'Congratulations! You\'ve completed all steps in this phase. You\'re making incredible progress!',
      actionLabel: 'See Your Progress',
    },
    fa: {
      title: 'فاز تکمیل شد! 🏆',
      message: 'تبریک! همه مراحل این فاز را تکمیل کردید. پیشرفت فوق‌العاده‌ای دارید!',
      actionLabel: 'مشاهده پیشرفت',
    },
  },
  inactive_reminder: {
    en: {
      title: 'We Miss You! 👋',
      message: 'Your startup journey is waiting. It\'s been a week - let\'s pick up where you left off.',
      actionLabel: 'Continue Building',
    },
    fa: {
      title: 'دلمان برایت تنگ شده! 👋',
      message: 'سفر استارتاپی‌ات منتظرت است. یک هفته گذشته - بیا از جایی که ماندی ادامه بدیم.',
      actionLabel: 'ادامه ساخت',
    },
  },
  come_back: {
    en: {
      title: 'Your Startup Awaits 🌟',
      message: 'It\'s been two weeks. Your business plan and roadmap are ready for you to continue.',
      actionLabel: 'Resume Journey',
    },
    fa: {
      title: 'استارتاپت منتظر توئه 🌟',
      message: 'دو هفته گذشته. برنامه کسب‌وکار و نقشه راهت آماده ادامه دادن هستند.',
      actionLabel: 'ادامه سفر',
    },
  },
  suggestion: {
    en: {
      title: 'Tip for You 💡',
      message: '{message}',
    },
    fa: {
      title: 'نکته برای شما 💡',
      message: '{message}',
    },
  },
};
