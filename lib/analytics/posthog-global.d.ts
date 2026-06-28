export type AnalyticsPayload = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: AnalyticsPayload) => void;
      identify?: (id: string, properties?: Record<string, unknown>) => void;
    };
  }
}

export {};
