/**
 * Pricing Plans Configuration
 * 
 * Central configuration for all pricing plans.
 * 4 tiers: Free, Plus, Pro, Ultra
 * All features unlocked — only project count and AI requests are limited.
 */

import { PricingPlan, PlanTier } from './types';

// Pricing plans (prices in Toman)
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'رایگان',
    nameEn: 'Free',
    tier: 'free',
    description: 'شروع کنید و امتحان کنید',
    price: {
      monthly: 0,
      yearly: 0,
    },
    currency: 'IRR',
    features: [
      { name: '۱ پروژه فعال', included: true, limit: 1 },
      { name: '۲۰ درخواست AI در ماه', included: true, limit: 20 },
      { name: 'دسترسی به تمام امکانات', included: true },
      { name: 'تمام حالت‌های داشبورد', included: true },
    ],
  },
  {
    id: 'plus',
    name: 'پلاس',
    nameEn: 'Plus',
    tier: 'plus',
    description: 'برای کارآفرینان جدی',
    price: {
      monthly: 299000,
      yearly: 2870400, // 239,200 × 12 (20% off)
    },
    currency: 'IRR',
    features: [
      { name: '۵ پروژه فعال', included: true, limit: 5 },
      { name: '۱۰۰ درخواست AI در ماه', included: true, limit: 100 },
      { name: 'دسترسی به تمام امکانات', included: true },
      { name: 'تمام حالت‌های داشبورد', included: true },
    ],
  },
  {
    id: 'pro',
    name: 'پرو',
    nameEn: 'Pro',
    tier: 'pro',
    description: 'محبوب‌ترین انتخاب',
    price: {
      monthly: 699000,
      yearly: 6710400, // 559,200 × 12 (20% off)
    },
    currency: 'IRR',
    highlighted: true,
    badge: 'محبوب‌ترین',
    features: [
      { name: '۱۵ پروژه فعال', included: true, limit: 15 },
      { name: '۵۰۰ درخواست AI در ماه', included: true, limit: 500 },
      { name: 'دسترسی به تمام امکانات', included: true },
      { name: 'تمام حالت‌های داشبورد', included: true },
      { name: 'پشتیبانی اولویت‌دار', included: true },
    ],
  },
  {
    id: 'ultra',
    name: 'اولترا',
    nameEn: 'Ultra',
    tier: 'ultra',
    description: 'بدون محدودیت',
    price: {
      monthly: 1490000,
      yearly: 14304000, // 1,192,000 × 12 (20% off)
    },
    currency: 'IRR',
    features: [
      { name: 'پروژه نامحدود', included: true, limit: 'نامحدود' },
      { name: '۲,۰۰۰ درخواست AI در ماه', included: true, limit: 2000 },
      { name: 'دسترسی به تمام امکانات', included: true },
      { name: 'تمام حالت‌های داشبورد', included: true },
      { name: 'پشتیبانی اولویت‌دار', included: true },
      { name: 'مشاوره اختصاصی', included: true },
    ],
  },
];

// Helper functions
export function getPlanById(planId: string): PricingPlan | undefined {
  return PRICING_PLANS.find(p => p.id === planId);
}

export function getPlanByTier(tier: PlanTier): PricingPlan | undefined {
  return PRICING_PLANS.find(p => p.tier === tier);
}

export function getHighlightedPlan(): PricingPlan | undefined {
  return PRICING_PLANS.find(p => p.highlighted);
}

export function formatPrice(amount: number, showCurrency = true): string {
  if (amount === 0) return 'رایگان';
  
  const formatted = new Intl.NumberFormat('fa-IR').format(amount);
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
