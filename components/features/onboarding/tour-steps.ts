import { TourStep } from "./tour-context";

export const TOUR_STEPS: Record<string, TourStep[]> = {
  dashboard: [
    {
      id: "welcome",
      targetId: "dashboard-root",
      title: "به کارنکس خوش آمدید",
      description: "فرماندهی کسب‌وکار شما از اینجا شروع می‌شود. بیایید یک تور سریع داشته باشیم.",
      position: "bottom"
    },
    {
      id: "sidebar",
      targetId: "sidebar-nav",
      title: "جعبه ابزار شما",
      description: "دسترسی سریع به تمام بخش‌های پروژه: از بوم مدل کسب‌وکار تا نقشه راه و اسکریپت‌ها.",
      position: "left"
    },
    {
      id: "stats",
      targetId: "stats-strip",
      title: "نبض کسب‌وکار",
      description: "وضعیت کلی پروژه، امتیاز فعلی و روزهای فعالیت شما در یک نگاه.",
      position: "bottom"
    },
    {
      id: "help",
      targetId: "help-button",
      title: "شروع مجدد",
      description: "هر زمان نیاز به راهنمایی داشتید، روی این دکمه کلیک کنید.",
      position: "bottom"
    },
    {
      id: "finish",
      targetId: "dashboard-root",
      title: "شروع کنید!",
      description: "همه چیز آماده است. اولین قدم را بردارید.",
      position: "bottom"
    }
  ],
  roadmap: [
    {
      id: "roadmap-welcome",
      targetId: "roadmap-header",
      title: "نقشه راه کسب‌وکار",
      description: "اینجا می‌توانید مسیر موفقیت پروژه خود را مرحله به مرحله ببینید.",
      position: "bottom"
    },
    {
      id: "roadmap-phases",
      targetId: "phases-container",
      title: "فازهای پروژه",
      description: "پروژه شما به فازهای مشخص تقسیم شده است که باید یکی‌یکی تکمیل شوند.",
      position: "bottom"
    },
    {
      id: "roadmap-kanban",
      targetId: "kanban-board",
      title: "مدیریت تسک‌ها",
      description: "کارهایی که باید انجام دهید را اینجا مدیریت کنید.",
      position: "left"
    }
  ],
  canvas: [
    {
      id: "canvas-welcome",
      targetId: "canvas-header",
      title: "بوم مدل کسب‌وکار",
      description: "قلب استراتژی بیزینس شما. تمام اجزای کلیدی را اینجا طراحی کنید.",
      position: "bottom"
    },
    {
      id: "canvas-board",
      targetId: "canvas-board",
      title: "بلوک‌های بوم",
      description: "روی هر بلوک کلیک کنید تا جزئیات آن (مثل مشتریان یا ارزش پیشنهادی) را ویرایش کنید.",
      position: "top"
    },
    {
      id: "canvas-ai",
      targetId: "ai-auto-fill",
      title: "تکمیل خودکار",
      description: "از هوش مصنوعی بخواهید بوم شما را بر اساس ایده اولیه پر کند.",
      position: "bottom"
    }
  ],
  copilot: [
    {
      id: "copilot-welcome",
      targetId: "copilot-header",
      title: "دستیار هوشمند (کوپایلت)",
      description: "مشاور ۲۴ ساعته شما. هر سوالی دارید بپرسید.",
      position: "bottom"
    },
    {
      id: "copilot-chat",
      targetId: "chat-input",
      title: "چت با هوش مصنوعی",
      description: "سوال خود را بنویسید یا از دکمه ضبط صدا استفاده کنید.",
      position: "top"
    },
    {
      id: "copilot-templates",
      targetId: "prompt-templates",
      title: "دستورات آماده",
      description: "برای شروع سریع، از این پیشنهادها استفاده کنید.",
      position: "top"
    }
  ],
  calendar: [
    {
      id: "calendar-welcome",
      targetId: "calendar-header",
      title: "تقویم محتوا",
      description: "برنامه‌ریزی، تولید و انتشار محتوا را اینجا مدیریت کنید.",
      position: "bottom"
    },
    {
      id: "calendar-view",
      targetId: "calendar-grid",
      title: "نمای تقویم",
      description: "رویدادهای خود را در نمای ماهانه ببینید و مدیریت کنید.",
      position: "top"
    },
    {
      id: "calendar-ai",
      targetId: "ai-strategy-btn",
      title: "استراتژی هوشمند",
      description: "به کارنکس بگویید چه هدفی دارید تا برنامه محتوایی شما را بچیند.",
      position: "left"
    }
  ],
  scripts: [
    {
      id: "scripts-welcome",
      targetId: "scripts-header",
      title: "مدیریت اسکریپت‌ها",
      description: "سناریوی ویدیوها و متون تبلیغاتی خود را اینجا بنویسید.",
      position: "bottom"
    },
    {
      id: "new-script",
      targetId: "new-script-btn",
      title: "نوشتن اسکریپت جدید",
      description: "با کمک قالب‌های آماده یا هوش مصنوعی، متن‌های حرفه‌ای بنویسید.",
      position: "left"
    }
  ],
  sponsorship: [
    {
      id: "sponsor-welcome",
      targetId: "sponsor-header",
      title: "تعرفه اسپانسری",
      description: "مدیریت و محاسبه نرخ تبلیغات و همکاری‌های شما.",
      position: "bottom"
    },
    {
      id: "sponsor-calculator",
      targetId: "rate-calculator",
      title: "محاسبه‌گر نرخ",
      description: "بر اساس بازدید و تعامل، قیمت منصفانه تبلیغات خود را محاسبه کنید.",
      position: "top"
    }
  ],
  "pitch-deck": [
    {
      id: "deck-welcome",
      targetId: "deck-header",
      title: "داستان استارتاپ شما",
      description: "پیچ‌دک شما آماده است! اینجا می‌توانید تمام اسلایدها را یکجا ببینید.",
      position: "bottom"
    },
    {
      id: "deck-grid",
      targetId: "deck-grid",
      title: "ویرایش اسلایدها",
      description: "برای ویرایش محتوا یا تغییر عکس هر اسلاید، کافیست روی آن کلیک کنید.",
      position: "top"
    },
    {
      id: "add-slide",
      targetId: "add-slide-btn",
      title: "افزودن اسلاید جدید",
      description: "اگر نیاز به اسلاید بیشتری دارید، از اینجا اضافه کنید.",
      position: "left"
    },
    {
      id: "deck-actions",
      targetId: "deck-actions",
      title: "خروجی و تنظیمات",
      description: "پیچ‌دک خود را به صورت PDF دانلود کنید یا در صورت نیاز همه چیز را از اول بسازید.",
      position: "bottom"
    }
  ],
  "location-analyzer": [
    {
      id: "location-welcome",
      targetId: "location-header",
      title: "تحلیلگر منطقه هوشمند",
      description: "با استفاده از هوش مصنوعی، بهترین مکان را برای کسب‌وکار خود پیدا کنید.",
      position: "bottom"
    },
    {
      id: "location-inputs",
      targetId: "location-inputs",
      title: "انتخاب منطقه",
      description: "شهر و محله مورد نظر خود را وارد کنید تا اطلاعات دقیقی درباره آن دریافت کنید.",
      position: "top"
    },
    {
      id: "analyze-btn",
      targetId: "analyze-btn",
      title: "شروع تحلیل",
      description: "با کلیک بر روی این دکمه، آنالیز جمعیت‌شناسی، رقبا و پتاسیل منطقه انجام می‌شود.",
      position: "left"
    },
    {
      id: "results-area",
      targetId: "results-placeholder",
      title: "نمایش نتایج",
      description: "نتایج تحلیل شامل امتیاز منطقه، رقبا و پیشنهادهای هوشمند در اینجا نمایش داده خواهد شد.",
      position: "top"
    }
  ]
};
