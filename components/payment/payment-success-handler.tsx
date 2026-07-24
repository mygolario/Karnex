"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/auth-context";
import { trackProductEvent } from "@/lib/analytics/product";

type PaymentSuccessHandlerProps = {
  planId?: string | null;
  amount?: number;
  transactionId?: string;
  billingCycle?: string | null;
};

export function PaymentSuccessHandler({
  planId,
  amount,
  transactionId,
  billingCycle,
}: PaymentSuccessHandlerProps) {
  const { refreshProfile } = useAuth();
  const tracked = useRef(false);

  useEffect(() => {
    // Force refresh user profile to update subscription status
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackProductEvent("payment_completed", {
      plan: planId ?? undefined,
      amount: typeof amount === "number" ? amount : undefined,
      transaction_id: transactionId,
      billing_cycle: billingCycle ?? undefined,
    });
  }, [planId, amount, transactionId, billingCycle]);

  return null;
}
