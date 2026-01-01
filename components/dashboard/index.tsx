"use client";

import dynamic from "next/dynamic";

// Re-export core components directly
export { StatsCard } from "./stats-card";
export { ProgressRing } from "./progress-ring";

// Dynamic imports for code splitting - loads only when needed
export const StepGuide = dynamic(
  () => import("./step-guide").then((mod) => mod.StepGuide),
  { 
    loading: () => <div className="h-20 bg-muted/50 animate-pulse rounded-xl" />,
    ssr: false 
  }
);

export const AnalyzerButton = dynamic(
  () => import("./analyzer-button").then((mod) => mod.AnalyzerButton),
  { 
    loading: () => <div className="h-10 w-32 bg-muted/50 animate-pulse rounded-lg" />,
    ssr: false 
  }
);

export const BrandVisualizer = dynamic(
  () => import("./brand-visualizer").then((mod) => mod.BrandVisualizer),
  { 
    loading: () => <div className="h-64 bg-muted/50 animate-pulse rounded-2xl" />,
    ssr: false 
  }
);

export const ContentGeneratorButton = dynamic(
  () => import("./content-generator-button").then((mod) => mod.ContentGeneratorButton),
  { 
    loading: () => <div className="h-10 w-28 bg-muted/50 animate-pulse rounded-lg" />,
    ssr: false 
  }
);
