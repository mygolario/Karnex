/**
 * Gateway-Agnostic Payment Types
 * 
 * These types are designed to work with any payment gateway:
 * - Iranian gateways: Zarinpal, Zibal, IDPay
 * - International: Stripe, PayPal
 */

// === Plan & Pricing Types ===

/** Launch sells free / plus(پرو) / pro(تیم). ultra + team kept for legacy mapping. */
export type PlanTier = 'free' | 'plus' | 'pro' | 'ultra' | 'team';
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
  currentPeriodEnd: Date | null;
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
 * Launch limits: project count + weighted AI credits (see lib/ai/credit-weights.ts).
 * aiRequestsPerMonth = monthly credit budget (not raw HTTP count).
 * liveWebResearch / deepMarketResearch are plan-gated AI capabilities.
 * prioritySupport stays false until phone/queue support is actually delivered.
 */
export interface FeatureFlags {
  projectLimit: number | 'unlimited';
  aiRequestsPerMonth: number | 'unlimited';
  liveWebResearch: boolean;
  deepMarketResearch: boolean;
  prioritySupport: boolean;
  dedicatedConsulting: boolean;
}

/**
 * Normalize legacy / alias plan ids to the launch feature map key.
 * plus = پرو, pro = تیم, ultra|team → pro limits.
 */
export function resolveFeatureTier(planIdOrTier: string): PlanTier {
  switch (planIdOrTier) {
    case 'free':
      return 'free';
    case 'plus':
      return 'plus';
    case 'pro':
    case 'team':
    case 'ultra':
      return 'pro';
    default:
      return 'free';
  }
}

export const DEFAULT_FEATURES: Record<PlanTier, FeatureFlags> = {
  free: {
    projectLimit: 1,
    aiRequestsPerMonth: 40,
    liveWebResearch: false,
    deepMarketResearch: false,
    prioritySupport: false,
    dedicatedConsulting: false,
  },
  /** پرو — hero paid plan */
  plus: {
    projectLimit: 3,
    aiRequestsPerMonth: 100,
    liveWebResearch: true,
    deepMarketResearch: false,
    prioritySupport: false,
    dedicatedConsulting: false,
  },
  /** تیم */
  pro: {
    projectLimit: 8,
    aiRequestsPerMonth: 350,
    liveWebResearch: true,
    deepMarketResearch: true,
    prioritySupport: false,
    dedicatedConsulting: false,
  },
  /** Legacy alias → same as تیم */
  team: {
    projectLimit: 8,
    aiRequestsPerMonth: 350,
    liveWebResearch: true,
    deepMarketResearch: true,
    prioritySupport: false,
    dedicatedConsulting: false,
  },
  /** Legacy ultra subscribers → تیم limits (no fake consulting) */
  ultra: {
    projectLimit: 8,
    aiRequestsPerMonth: 350,
    liveWebResearch: true,
    deepMarketResearch: true,
    prioritySupport: false,
    dedicatedConsulting: false,
  },
}
