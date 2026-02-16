"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";

export function PaymentSuccessHandler() {
  const { refreshProfile } = useAuth();

  useEffect(() => {
    // Force refresh user profile to update subscription status
    refreshProfile();
  }, [refreshProfile]);

  return null;
}
