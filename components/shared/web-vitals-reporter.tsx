"use client";

import { useEffect } from "react";
import { onCLS, onINP, onLCP, onFCP, onTTFB } from "web-vitals";
import { reportWebVital } from "@/lib/web-vitals";

export function WebVitalsReporter() {
  useEffect(() => {
    onCLS(reportWebVital);
    onINP(reportWebVital);
    onLCP(reportWebVital);
    onFCP(reportWebVital);
    onTTFB(reportWebVital);
  }, []);

  return null;
}
