
export type PlanTier = 'free' | 'plus' | 'pro';

export const PLANS = {
  free: {
    id: 'free',
    name: 'رایگان',
    price: 0,
    features: [
      'ساخت ۳ پروژه',
      'دسترسی به ابزارهای پایه',
      'خروجی PDF ساده',
      'پشتیبانی ایمیلی'
    ],
    limits: {
      projects: 3,
      aiTokens: 5000,
    }
  },
  plus: {
    id: 'plus',
    name: 'پلاس',
    price: 249000,
    features: [
      'پروژه نامحدود',
      'دسترسی به ابزارهای تخصصی',
      'خروجی PDF بدون واترمارک',
      'اولویت در پردازش AI',
      'پشتیبانی چت آنلاین'
    ],
    limits: {
      projects: Infinity,
      aiTokens: 50000,
    }
  },
  pro: {
    id: 'pro',
    name: 'حرفه‌ای',
    price: 399000,
    features: [
      'همه امکانات پلاس',
      'دسترسی API',
      'مشاوره اختصاصی (۱ جلسه)',
      'ابزارهای تحلیل پیشرفته',
      'پنل مدیریت تیم'
    ],
    limits: {
      projects: Infinity,
      aiTokens: 150000,
    }
  }
} as const;

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};
