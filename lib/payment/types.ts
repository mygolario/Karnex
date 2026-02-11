/**
 * Gateway-Agnostic Payment Types
 * 
 * These types are designed to work with any payment gateway:
 * - Iranian gateways: Zarinpal, Zibal, IDPay
 * - International: Stripe, PayPal
 */

// === Plan & Pricing Types ===

export type PlanTier = 'free' | 'plus' | 'pro' | 'ultra';
export type BillingCycle = 'monthly' | 'yearly';
export type Currency = 'IRR' | 'USD' | 'EUR';

export interface PricingPlan {
  id: string;
  name: string;
  nameEn: string;
  tier: PlanTier;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: Currency;
  features: PlanFeature[];
  highlighted?: boolean;
  badge?: string;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: string | number;
  tooltip?: string;
}

// === Payment Gateway Types ===

export interface PaymentGateway {
  name: string;
  createSession(params: PaymentParams): Promise<PaymentSession>;
  verifyPayment(token: string): Promise<PaymentResult>;
  refund?(transactionId: string, amount?: number): Promise<RefundResult>;
}

export interface PaymentParams {
  amount: number;
  currency: Currency;
  planId: string;
  userId: string;
  userEmail?: string;
  returnUrl: string;
  callbackUrl: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface PaymentSession {
  sessionId: string;
  redirectUrl: string;
  authority?: string; // Zarinpal-specific
  expiresAt?: Date;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  refId?: string; // Zarinpal reference ID
  cardPan?: string; // Masked card number
  error?: PaymentError;
}

export interface PaymentError {
  code: string;
  message: string;
  details?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: PaymentError;
}

// === Subscription Types ===

export type SubscriptionStatus = 
  | 'active' 
  | 'trialing' 
  | 'past_due' 
  | 'cancelled' 
  | 'expired';

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  tier: PlanTier;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionUpdate {
  planId?: string;
  tier?: PlanTier;
  status?: SubscriptionStatus;
  billingCycle?: BillingCycle;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
}

// === Transaction Types ===

export type TransactionStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded' 
  | 'partially_refunded';

export interface Transaction {
  id: string;
  userId: string;
  planId: string;
  subscriptionId?: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  gateway: string;
  gatewayRef?: string;
  refId?: string;
  cardPan?: string;
  description: string;
  metadata?: Record<string, string>;
  createdAt: Date;
  completedAt?: Date;
  refundedAt?: Date;
}

// === Feature Access Types ===

/**
 * Simplified feature flags — all features are unlocked for all tiers.
 * Only project count and AI request count are limited.
 */
export interface FeatureFlags {
  projectLimit: number | 'unlimited';
  aiRequestsPerMonth: number | 'unlimited';
  prioritySupport: boolean;
  dedicatedConsulting: boolean;
}

// Default feature flags per tier (Option A — Recommended)
export const DEFAULT_FEATURES: Record<PlanTier, FeatureFlags> = {
  free: {
    projectLimit: 1,
    aiRequestsPerMonth: 20,
    prioritySupport: false,
    dedicatedConsulting: false,
  },
  plus: {
    projectLimit: 5,
    aiRequestsPerMonth: 100,
    prioritySupport: false,
    dedicatedConsulting: false,
  },
  pro: {
    projectLimit: 15,
    aiRequestsPerMonth: 500,
    prioritySupport: true,
    dedicatedConsulting: false,
  },
  ultra: {
    projectLimit: 'unlimited',
    aiRequestsPerMonth: 2000,
    prioritySupport: true,
    dedicatedConsulting: true,
  },
};
