/**
 * Analytics Engine
 * 
 * A flexible analytics wrapper that can be configured to use
 * different providers. Designed to be easily swappable.
 */

import { 
  AnalyticsConfig, 
  UserProperties, 
  EventProperties, 
  AnalyticsEventName,
  DEFAULT_ANALYTICS_CONFIG 
} from './types';

class AnalyticsEngine {
  private config: AnalyticsConfig;
  private userId?: string;
  private initialized = false;

  constructor(config: AnalyticsConfig = DEFAULT_ANALYTICS_CONFIG) {
    this.config = config;
  }

  /**
   * Initialize the analytics provider
   */
  async init(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;
    if (!this.config.enabled) return;

    try {
      switch (this.config.provider) {
        case 'mixpanel':
          await this.initMixpanel();
          break;
        case 'amplitude':
          await this.initAmplitude();
          break;
        case 'posthog':
          await this.initPosthog();
          break;
        case 'console':
        default:
          if (this.config.debug) {
            console.log('[Analytics] Console provider initialized');
          }
          break;
      }
      this.initialized = true;
    } catch (error) {
      console.error('[Analytics] Failed to initialize:', error);
    }
  }

  private async initMixpanel(): Promise<void> {
    if (!this.config.apiKey) return;
    
    // Dynamic import with type ignore for optional dependency
    try {
      // @ts-ignore - mixpanel-browser is an optional dependency
      const mixpanel = await import('mixpanel-browser');
      mixpanel.default.init(this.config.apiKey, {
        debug: this.config.debug,
        track_pageview: true,
        persistence: 'localStorage',
      });
    } catch {
      console.warn('[Analytics] Mixpanel not installed. Run: npm install mixpanel-browser');
    }
  }

  private async initAmplitude(): Promise<void> {
    if (!this.config.apiKey) return;
    
    // Placeholder for Amplitude initialization
    // const amplitude = await import('@amplitude/analytics-browser');
    // amplitude.init(this.config.apiKey);
    console.log('[Analytics] Amplitude initialization placeholder');
  }

  private async initPosthog(): Promise<void> {
    if (!this.config.apiKey) return;
    
    // Placeholder for PostHog initialization
    // const posthog = await import('posthog-js');
    // posthog.default.init(this.config.apiKey);
    console.log('[Analytics] PostHog initialization placeholder');
  }

  /**
   * Identify a user
   */
  identify(userId: string, properties?: UserProperties): void {
    if (!this.config.enabled) return;
    
    this.userId = userId;

    if (this.config.debug) {
      console.log('[Analytics] Identify:', userId, properties);
    }

    switch (this.config.provider) {
      case 'mixpanel':
        if (typeof window !== 'undefined' && (window as any).mixpanel) {
          (window as any).mixpanel.identify(userId);
          if (properties) {
            (window as any).mixpanel.people.set(properties);
          }
        }
        break;
      // Add other providers as needed
    }
  }

  /**
   * Track an event
   */
  track(event: AnalyticsEventName | string, properties?: EventProperties): void {
    if (!this.config.enabled) return;

    const enrichedProperties = {
      ...properties,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      locale: typeof document !== 'undefined' 
        ? document.cookie.match(/NEXT_LOCALE=([^;]+)/)?.[1] 
        : undefined,
    };

    if (this.config.debug) {
      console.log('[Analytics] Track:', event, enrichedProperties);
    }

    switch (this.config.provider) {
      case 'mixpanel':
        if (typeof window !== 'undefined' && (window as any).mixpanel) {
          (window as any).mixpanel.track(event, enrichedProperties);
        }
        break;
      case 'console':
      default:
        // Console logging for development
        break;
    }
  }

  /**
   * Track a page view
   */
  pageView(path: string, properties?: EventProperties): void {
    this.track('page_view', {
      path,
      ...properties,
    });
  }

  /**
   * Reset user identity (on logout)
   */
  reset(): void {
    this.userId = undefined;

    if (this.config.debug) {
      console.log('[Analytics] Reset');
    }

    switch (this.config.provider) {
      case 'mixpanel':
        if (typeof window !== 'undefined' && (window as any).mixpanel) {
          (window as any).mixpanel.reset();
        }
        break;
    }
  }

  /**
   * Set super properties (attached to all future events)
   */
  setSuperProperties(properties: EventProperties): void {
    if (!this.config.enabled) return;

    if (this.config.debug) {
      console.log('[Analytics] Super Properties:', properties);
    }

    switch (this.config.provider) {
      case 'mixpanel':
        if (typeof window !== 'undefined' && (window as any).mixpanel) {
          (window as any).mixpanel.register(properties);
        }
        break;
    }
  }
}

// Singleton instance
export const analytics = new AnalyticsEngine();

// Export for custom configurations
export { AnalyticsEngine };
