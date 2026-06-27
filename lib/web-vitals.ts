import type { Metric } from "web-vitals";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function reportWebVital(metric: Metric) {
  if (typeof window === "undefined") return;

  const payload = {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    id: metric.id,
    navigationType: metric.navigationType,
  };

  if (window.gtag && process.env.NEXT_PUBLIC_GA_ID) {
    window.gtag("event", metric.name, {
      event_category: "Web Vitals",
      event_label: metric.id,
      value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
      non_interaction: true,
    });
  }

  if (process.env.NODE_ENV === "development") {
    console.debug("[Web Vitals]", payload);
  }
}
