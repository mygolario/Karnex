import { Rocket, Store, Video, Code, Users, Globe, MapPin, DollarSign, Camera, Mic, Briefcase, Zap, Smartphone, ShoppingCart, Wallet, BookOpen, Utensils, Heart, Gamepad2, Lightbulb, Hammer, TrendingUp, Codepen } from "lucide-react";

export type ProjectType = 'startup' | 'traditional' | 'creator';

export const GENESIS_STEPS = [
  { number: 0, title: "انتخاب مسیر", id: "pillar" },
  { number: 1, title: "پیکربندی", id: "core" }, // Divergent Step 1
  { number: 2, title: "هویت بصری", id: "identity" }, // Name & Vibe
  { number: 3, title: "چشم‌انداز", id: "vision" }, // Description
  { number: 4, title: "ساخت نهایی", id: "blueprint" }, // Final Review
];

export const PILLARS = [
  {
    id: 'startup',
    title: 'استارتاپ و رشد',
    subtitle: 'برای پیشروها',
    description: 'ساخت یونیکورن بعدی. تمرکز بر تکنولوژی، مقیاس‌پذیری و جذب سرمایه.',
    icon: Rocket,
    color: 'from-blue-600 to-indigo-600',
    gradient: 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20',
    projectPlaceholder: "مثلاً: اسنپ، دیجی‌کالا، علی‌بابا...",
    questions: [
      {
        id: 'tech_stack',
        question: "چگونه آن را می‌سازید؟",
        options: [
            { id: 'code', label: 'کدنویسی اختصاصی', icon: Code },
            { id: 'nocode', label: 'ابزارهای کم‌کد (No-Code)', icon: Zap },
            { id: 'cms', label: 'سیستم آماده (WordPress)', icon: Globe },
        ]
      },
      {
        id: 'stage',
        question: "در چه مرحله‌ای هستید؟",
        options: [
            { id: 'idea', label: 'فقط ایده', icon: Lightbulb },
            { id: 'mvp', label: 'ساخت نمونه اولیه', icon: Hammer },
            { id: 'growth', label: 'توسعه و رشد', icon: TrendingUp },
        ]
      }
    ]
  },
  {
    id: 'traditional',
    title: 'کسب‌وکار سنتی',
    subtitle: 'برای سازندگان',
    description: 'ارزش واقعی در دنیای واقعی. فروشگاه، خدمات و تجارت محلی.',
    icon: Store,
    color: 'from-emerald-600 to-teal-600',
    gradient: 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20',
    projectPlaceholder: "مثلاً: رستوران نایب، فروشگاه افق، املاک تهران...",
    questions: [
       {
        id: 'location_type',
        question: "کجا فعالیت می‌کنید؟",
        options: [
            { id: 'physical', label: 'فروشگاه فیزیکی', icon: Store },
            { id: 'online', label: 'فقط آنلاین', icon: Globe },
            { id: 'hybrid', label: 'ترکیبی', icon: MapPin },
        ]
      }
    ]
  },
  {
    id: 'creator',
    title: 'تولید محتوا',
    subtitle: 'برای اثرگذاران',
    description: 'برند شما، کسب‌وکار شماست. محتوا، جامعه و کسب درآمد.',
    icon: Video,
    color: 'from-pink-600 to-rose-600',
    gradient: 'bg-gradient-to-br from-pink-500/20 to-rose-500/20',
    projectPlaceholder: "مثلاً: کانال یوتیوب تکنولوژی، ولاگ سفر، اینستاگرام آشپزی...",
    questions: [
       {
        id: 'platform',
        question: "پلتفرم اصلی؟",
        options: [
            { id: 'youtube', label: 'یوتیوب', icon: Video },
            { id: 'instagram', label: 'اینستاگرام', icon: Camera },
            { id: 'tiktok', label: 'تیک‌تاک', icon: Smartphone },
            { id: 'aparat', label: 'آپارات', icon: Video },
            { id: 'podcast', label: 'پادکست', icon: Mic },
        ]
      }
    ]
  }
];

export const TEMPLATES = [
  // Startup
  { id: "saas", icon: Codepen, label: "SaaS Platform", category: "startup", description: "Subscription software" },
  { id: "marketplace", icon: ShoppingCart, label: "Marketplace", category: "startup", description: "Connect buyers & sellers" },
  { id: "mobile_app", icon: Smartphone, label: "Mobile App", category: "startup", description: "iOS & Android" },
  
  // Traditional
  { id: "restaurant", icon: Utensils, label: "Restaurant/Cafe", category: "traditional", description: "Food & Beverage" },
  { id: "retail", icon: Store, label: "Retail Shop", category: "traditional", description: "Physical products" },
  { id: "service", icon: Briefcase, label: "Service Business", category: "traditional", description: "Consulting, Beauty, etc." },

  // Creator
  { id: "vlog", icon: Video, label: "Vlogging", category: "creator", description: "Daily life & travel" },
  { id: "education", icon: BookOpen, label: "Education", category: "creator", description: "Courses & Tutorials" },
  { id: "gaming", icon: Gamepad2, label: "Gaming", category: "creator", description: "Streaming & reviews" },
];
