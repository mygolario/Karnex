import {
  Rocket,
  Store,
  Video,
  Code,
  Users,
  Globe,
  MapPin,
  Zap,
  Smartphone,
  Camera,
  Mic,
  Lightbulb,
  Hammer,
  TrendingUp,
} from "lucide-react";

export type ProjectType = "startup" | "traditional" | "creator";

export interface PillarQuestionOption {
  id: string;
  label: string;
  icon: typeof Code;
}

export interface PillarQuestion {
  id: string;
  question: string;
  options: PillarQuestionOption[];
}

export interface Pillar {
  id: ProjectType;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Code;
  /** On-brand gradient built from brand tokens. */
  accent: string;
  projectPlaceholder: string;
  visionHint: string;
  visionExamples: string[];
  questions: PillarQuestion[];
}

export const PILLARS: Pillar[] = [
  {
    id: "startup",
    title: "استارتاپ و رشد",
    subtitle: "برای پیشروها",
    description:
      "ساخت یونیکورن بعدی. تمرکز بر تکنولوژی، مقیاس‌پذیری و جذب سرمایه.",
    icon: Rocket,
    accent: "from-brand-primary to-brand-accent",
    projectPlaceholder: "مثلاً: اسنپ، دیجی‌کالا، علی‌بابا...",
    visionHint:
      "چه مشکلی را حل می‌کنید، راه‌حل شما چه ویژگی‌هایی دارد و چه کسانی مخاطب شما هستند؟",
    visionExamples: [
      "پلتفرمی برای رزرو آنلاین نوبت پزشکان با تمرکز بر کاهش زمان انتظار.",
      "اپلیکیشن مدیریت مالی شخصی که با هوش مصنوعی هزینه‌ها را تحلیل می‌کند.",
    ],
    questions: [
      {
        id: "tech_stack",
        question: "چگونه آن را می‌سازید؟",
        options: [
          { id: "code", label: "کدنویسی اختصاصی", icon: Code },
          { id: "nocode", label: "ابزارهای کم‌کد (No-Code)", icon: Zap },
          { id: "cms", label: "سیستم آماده (WordPress)", icon: Globe },
        ],
      },
      {
        id: "stage",
        question: "در چه مرحله‌ای هستید؟",
        options: [
          { id: "idea", label: "فقط ایده", icon: Lightbulb },
          { id: "mvp", label: "ساخت نمونه اولیه", icon: Hammer },
          { id: "growth", label: "توسعه و رشد", icon: TrendingUp },
        ],
      },
    ],
  },
  {
    id: "traditional",
    title: "کسب‌وکار سنتی",
    subtitle: "برای سازندگان",
    description:
      "ارزش واقعی در دنیای واقعی. فروشگاه، خدمات و تجارت محلی.",
    icon: Store,
    accent: "from-brand-secondary to-brand-primary",
    projectPlaceholder: "مثلاً: رستوران نایب، فروشگاه افق، املاک تهران...",
    visionHint:
      "چه محصول یا خدمتی ارائه می‌دهید، کجا فعالیت می‌کنید و چه مزیت رقابتی دارید؟",
    visionExamples: [
      "کافه‌رستوران تخصصی صبحانه با فضای دلنشین در منطقه زعفرانیه.",
      "فروشگاه آنلاین لوازم خانگی با ارسال سریع در تهران و گارانتی اصالت.",
    ],
    questions: [
      {
        id: "location_type",
        question: "کجا فعالیت می‌کنید؟",
        options: [
          { id: "physical", label: "فروشگاه فیزیکی", icon: Store },
          { id: "online", label: "فقط آنلاین", icon: Globe },
          { id: "hybrid", label: "ترکیبی", icon: MapPin },
        ],
      },
    ],
  },
  {
    id: "creator",
    title: "تولید محتوا",
    subtitle: "برای اثرگذاران",
    description:
      "برند شما، کسب‌وکار شماست. محتوا، جامعه و کسب درآمد.",
    icon: Video,
    accent: "from-brand-accent to-brand-secondary",
    projectPlaceholder:
      "مثلاً: کانال یوتیوب تکنولوژی، ولاگ سفر، اینستاگرام آشپزی...",
    visionHint:
      "محتوای شما درباره چیست، مخاطب هدف شما کیست و چگونه می‌خواهید درآمد بسازید؟",
    visionExamples: [
      "کانال یوتیوب آموزش تکنولوژی برای فارسی‌زبانان با تمرکز بر بررسی گوشی‌ها.",
      "پیج اینستاگرام آشپزی با دستورهای سریع و معرفی مواد اولیه ایرانی.",
    ],
    questions: [
      {
        id: "platform",
        question: "پلتفرم اصلی؟",
        options: [
          { id: "youtube", label: "یوتیوب", icon: Video },
          { id: "instagram", label: "اینستاگرام", icon: Camera },
          { id: "tiktok", label: "تیک‌تاک", icon: Smartphone },
          { id: "aparat", label: "آپارات", icon: Video },
          { id: "podcast", label: "پادکست", icon: Mic },
        ],
      },
    ],
  },
];
