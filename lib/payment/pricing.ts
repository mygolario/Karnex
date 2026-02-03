/**
 * Pricing Plans Configuration
 * 
 * Central configuration for all pricing plans.
 * Easy to update when pricing changes.
 */

import { PricingPlan, PlanTier, PlanFeature } from './types';

// Feature definitions with Persian labels
const FEATURES = {
  aiAssistant: {
    name: 'دستیار کارنکس',
    tooltip: 'چت با AI برای دریافت مشاوره و راهنمایی',
  },
  aiGenerations: {
    name: 'تولید محتوا با AI',
    tooltip: 'تعداد درخواست‌های تولید محتوا با دستیار کارنکس',
  },
  projects: {
    name: 'تعداد پروژه',
    tooltip: 'تعداد پروژه‌هایی که می‌توانید ایجاد کنید',
  },
  exportPdf: {
    name: 'خروجی PDF',
    tooltip: 'دانلود طرح کسب‌وکار به صورت PDF',
  },
  brandKit: {
    name: 'کیت هویت بصری',
    tooltip: 'رنگ‌ها، فونت‌ها و راهنمای برند',
  },
  teamMembers: {
    name: 'اعضای تیم',
    tooltip: 'دعوت همکاران به پروژه',
  },
  prioritySupport: {
    name: 'پشتیبانی اولویت‌دار',
    tooltip: 'پاسخگویی سریع‌تر به درخواست‌های شما',
  },
  analytics: {
    name: 'تحلیل پیشرفته',
    tooltip: 'گزارش‌ها و تحلیل‌های دقیق‌تر',
  },
  apiAccess: {
    name: 'دسترسی API',
    tooltip: 'اتصال به سیستم‌های خارجی',
  },
} as const;

// Pricing plans
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'رایگان',
    nameEn: 'Free',
    tier: 'free',
    description: 'شروع سریع برای آزمایش ایده‌ها',
    price: {
      monthly: 0,
      yearly: 0,
    },
    currency: 'IRR',
    features: [
      { name: FEATURES.aiAssistant.name, included: true, tooltip: FEATURES.aiAssistant.tooltip },
      { name: FEATURES.aiGenerations.name, included: true, limit: '۵ بار در ماه', tooltip: FEATURES.aiGenerations.tooltip },
      { name: FEATURES.projects.name, included: true, limit: '۱', tooltip: FEATURES.projects.tooltip },
      { name: FEATURES.exportPdf.name, included: false },
      { name: FEATURES.brandKit.name, included: false },
      { name: FEATURES.teamMembers.name, included: false },
      { name: FEATURES.prioritySupport.name, included: false },
      { name: FEATURES.analytics.name, included: true, limit: 'پایه' },
    ],
  },
  {
    id: 'pro_monthly',
    name: 'حرفه‌ای',
    nameEn: 'Pro',
    tier: 'pro',
    description: 'برای کارآفرینان جدی',
    price: {
      monthly: 299000, // 299,000 Tomans
      yearly: 2990000, // 2,990,000 Tomans (2 months free)
    },
    currency: 'IRR',
    highlighted: true,
    badge: 'محبوب‌ترین',
    features: [
      { name: FEATURES.aiAssistant.name, included: true },
      { name: FEATURES.aiGenerations.name, included: true, limit: '۱۰۰ بار در ماه' },
      { name: FEATURES.projects.name, included: true, limit: '۱۰' },
      { name: FEATURES.exportPdf.name, included: true },
      { name: FEATURES.brandKit.name, included: true },
      { name: FEATURES.teamMembers.name, included: false },
      { name: FEATURES.prioritySupport.name, included: false },
      { name: FEATURES.analytics.name, included: true, limit: 'پیشرفته' },
    ],
  },
  {
    id: 'team_monthly',
    name: 'تیمی',
    nameEn: 'Team',
    tier: 'team',
    description: 'برای تیم‌ها و استارتاپ‌ها',
    price: {
      monthly: 799000, // 799,000 Tomans
      yearly: 7990000, // 7,990,000 Tomans
    },
    currency: 'IRR',
    features: [
      { name: FEATURES.aiAssistant.name, included: true },
      { name: FEATURES.aiGenerations.name, included: true, limit: 'نامحدود' },
      { name: FEATURES.projects.name, included: true, limit: 'نامحدود' },
      { name: FEATURES.exportPdf.name, included: true },
      { name: FEATURES.brandKit.name, included: true },
      { name: FEATURES.teamMembers.name, included: true, limit: 'تا ۱۰ نفر' },
      { name: FEATURES.prioritySupport.name, included: true },
      { name: FEATURES.analytics.name, included: true, limit: 'پیشرفته' },
      { name: FEATURES.apiAccess.name, included: true },
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
