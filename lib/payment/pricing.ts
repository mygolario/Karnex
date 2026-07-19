/**
 * Pricing Plans Configuration
 *
 * Launch tiers (display): رایگان / پرو / تیم
 * Internal plan ids kept for payment + subscription compatibility:
 *   free → رایگان
 *   plus → پرو (hero paid)
 *   pro  → تیم
 * ultra remains in feature map for legacy subscribers but is not sold.
 */

import { PricingPlan, PlanTier } from './types';
import { toPersianDigits } from '@/lib/utils';

/** Plans shown on marketing / checkout (Ultra not sold at launch) */
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'رایگان',
    nameEn: 'Free',
    tier: 'free',
    description: 'یک پروژه واقعی بساز و قدرت کارنکس را حس کن',
    price: {
      monthly: 0,
      yearly: 0,
    },
    currency: 'IRR',
    features: [
      { name: '۱ پروژه فعال', included: true, limit: 1 },
      { name: '۴۰ واحد اعتبار AI در ماه', included: true, limit: 40, tooltip: 'درخواست‌های سنگین چند واحد مصرف می‌کنند' },
      { name: 'بوم، نقشه راه، پیچ‌دک، اعتبارسنجی و تحلیل رقبا', included: true },
      { name: 'پشتیبانی جامعه', included: true },
    ],
  },
  {
    id: 'plus',
    name: 'پرو',
    nameEn: 'Pro',
    tier: 'plus',
    description: 'برای بنیان‌گذار جدی',
    price: {
      monthly: 299000,
      yearly: 2870400, // 239,200 × 12 (20% off)
    },
    currency: 'IRR',
    highlighted: true,
    badge: 'محبوب‌ترین',
    features: [
      { name: '۳ پروژه فعال', included: true, limit: 3 },
      { name: '۱۰۰ واحد اعتبار AI در ماه', included: true, limit: 100, tooltip: 'درخواست‌های سنگین چند واحد مصرف می‌کنند' },
      { name: 'همه ابزارهای استارتاپ', included: true },
      { name: 'تحقیق بازار با داده زنده وب', included: true },
    ],
  },
  {
    id: 'pro',
    name: 'تیم',
    nameEn: 'Team',
    tier: 'pro',
    description: 'برای هم‌بنیان‌گذاران و تیم کوچک',
    price: {
      monthly: 699000,
      yearly: 6710400, // 559,200 × 12 (20% off)
    },
    currency: 'IRR',
    features: [
      { name: '۸ پروژه فعال', included: true, limit: 8 },
      { name: '۳۵۰ واحد اعتبار AI در ماه', included: true, limit: 350, tooltip: 'درخواست‌های سنگین چند واحد مصرف می‌کنند' },
      { name: 'تحقیق بازار عمیق', included: true },
      { name: 'پشتیبانی اولویت‌دار', included: true },
    ],
  },
];

/** Purchasable / active plan lookup — ultra is not sold */
export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.id === planId);
}

/** Display helper for legacy ultra subscriptions */
export function getPlanForDisplay(planId: string): PricingPlan | undefined {
  if (planId === 'ultra') {
    return PRICING_PLANS.find((p) => p.id === 'pro');
  }
  return getPlanById(planId);
}

export function getPlanByTier(tier: PlanTier): PricingPlan | undefined {
  if (tier === 'ultra') return PRICING_PLANS.find((p) => p.id === 'pro');
  if (tier === 'team') return PRICING_PLANS.find((p) => p.id === 'pro');
  return PRICING_PLANS.find((p) => p.tier === tier);
}

export function getHighlightedPlan(): PricingPlan | undefined {
  return PRICING_PLANS.find((p) => p.highlighted);
}

export function formatPrice(amount: number, showCurrency = true): string {
  if (amount === 0) return 'رایگان';

  const formatted = toPersianDigits(new Intl.NumberFormat('en-US').format(amount));
  return showCurrency ? `${formatted} تومان` : formatted;
}

export function getYearlySavings(plan: PricingPlan): number {
  const monthlyTotal = plan.price.monthly * 12;
  const yearly = plan.price.yearly;
  return monthlyTotal - yearly;
}

export function getYearlySavingsPercent(plan: PricingPlan): number {
  if (plan.price.monthly === 0) return 0;
  const savings = getYearlySavings(plan);
  return Math.round((savings / (plan.price.monthly * 12)) * 100);
}
