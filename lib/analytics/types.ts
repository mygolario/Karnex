/**
 * Analytics Types and Configuration
 * 
 * Provides a provider-agnostic analytics interface that can be
 * configured to use different backends (Mixpanel, Amplitude, Posthog, etc.)
 */

export type AnalyticsProvider = 'mixpanel' | 'amplitude' | 'posthog' | 'console';

export interface AnalyticsConfig {
  provider: AnalyticsProvider;
  apiKey?: string;
  debug?: boolean;
  enabled?: boolean;
}

export interface UserProperties {
  id?: string;
  email?: string;
  name?: string;
  locale?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  createdAt?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface EventProperties {
  [key: string]: string | number | boolean | undefined | null;
}

// Standard event names for consistency
export const ANALYTICS_EVENTS = {
  // Auth events
  SIGN_UP: 'sign_up',
  LOGIN: 'login',
  LOGOUT: 'logout',
  
  // Project events
  PROJECT_CREATED: 'project_created',
  PROJECT_OPENED: 'project_opened',
  PROJECT_DELETED: 'project_deleted',
  PLAN_GENERATED: 'plan_generated',
  
  // Feature usage
  AI_CHAT_SENT: 'ai_chat_sent',
  ROADMAP_STEP_COMPLETED: 'roadmap_step_completed',
  BRAND_COLOR_COPIED: 'brand_color_copied',
  CONTENT_GENERATED: 'content_generated',
  LEGAL_DOC_GENERATED: 'legal_doc_generated',
  
  // Engagement
  PAGE_VIEW: 'page_view',
  BUTTON_CLICK: 'button_click',
  FEATURE_USED: 'feature_used',
  FEEDBACK_SUBMITTED: 'feedback_submitted',
  
  // Team events
  TEAM_MEMBER_INVITED: 'team_member_invited',
  TEAM_MEMBER_REMOVED: 'team_member_removed',
  
  // Conversion events
  UPGRADE_CLICKED: 'upgrade_clicked',
  UPGRADE_COMPLETED: 'upgrade_completed',
  TRIAL_STARTED: 'trial_started',
} as const;

export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];

// Default config - console only in development, disabled in production without API key
export const DEFAULT_ANALYTICS_CONFIG: AnalyticsConfig = {
  provider: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER as AnalyticsProvider || 'console',
  apiKey: process.env.NEXT_PUBLIC_ANALYTICS_API_KEY,
  debug: process.env.NODE_ENV === 'development',
  enabled: true,
};
