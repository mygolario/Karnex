/**
 * Gateway-Agnostic Payment Types
 * 
 * These types are designed to work with any payment gateway:
 * - Iranian gateways: Zarinpal, Zibal, IDPay
 * - International: Stripe, PayPal
 */

// === Plan & Pricing Types ===

export type PlanTier = 'free' | 'pro' | 'team' | 'enterprise';
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

export interface FeatureFlags {
  aiAssistant: boolean;
  aiGenerations: number | 'unlimited';
  projectLimit: number | 'unlimited';
  exportPdf: boolean;
  brandKit: boolean;
  teamMembers: number;
  prioritySupport: boolean;
  customDomain: boolean;
  apiAccess: boolean;
  analytics: 'basic' | 'advanced' | 'enterprise';
}

// Default feature flags per tier
export const DEFAULT_FEATURES: Record<PlanTier, FeatureFlags> = {
  free: {
    aiAssistant: true,
    aiGenerations: 5,
    projectLimit: 1,
    exportPdf: false,
    brandKit: false,
    teamMembers: 0,
    prioritySupport: false,
    customDomain: false,
    apiAccess: false,
    analytics: 'basic',
  },
  pro: {
    aiAssistant: true,
    aiGenerations: 100,
    projectLimit: 10,
    exportPdf: true,
    brandKit: true,
    teamMembers: 0,
    prioritySupport: false,
    customDomain: false,
    apiAccess: false,
    analytics: 'advanced',
  },
  team: {
    aiAssistant: true,
    aiGenerations: 'unlimited',
    projectLimit: 'unlimited',
    exportPdf: true,
    brandKit: true,
    teamMembers: 10,
    prioritySupport: true,
    customDomain: false,
    apiAccess: true,
    analytics: 'advanced',
  },
  enterprise: {
    aiAssistant: true,
    aiGenerations: 'unlimited',
    projectLimit: 'unlimited',
    exportPdf: true,
    brandKit: true,
    teamMembers: 100,
    prioritySupport: true,
    customDomain: true,
    apiAccess: true,
    analytics: 'enterprise',
  },
};
