import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in development, reduce in production
  
  // Session Replay - only in production
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text and block all media by default for privacy
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Only initialize in production or when DSN is set
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment
  environment: process.env.NODE_ENV,
  
  // Filter out sensitive data
  beforeSend(event) {
    // Don't send events in development unless specifically enabled
    if (process.env.NODE_ENV === 'development' && !process.env.SENTRY_DEBUG) {
      return null;
    }
    return event;
  },
});
