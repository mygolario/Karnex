"use client";

import { useEffect } from "react";
import type { TourDefinition } from "@/lib/tour/types";
import { registerTour, unregisterTour } from "@/lib/tour/registry";

/** Register a page-level micro-tour at runtime */
export function useRegisterTour(definition: TourDefinition | null) {
  useEffect(() => {
    if (!definition) return;
    registerTour(definition);
    return () => unregisterTour(definition.id);
  }, [definition]);
}
