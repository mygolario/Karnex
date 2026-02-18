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
      title: "راهنمای هوشمند",
      description: "با پاسخ به چند سوال ساده، دستیار کارنکس تمام بخش‌های بوم شما را به صورت حرفه‌ای تکمیل می‌کند.",
      position: "bottom"
    }
  ],
  copilot: [
    {
      id: "copilot-welcome",
      targetId: "copilot-header",
      title: "دستیار هوشمند کارنکس",
      description: "مشاور ۲۴ ساعته اختصاصی شما. این هوش مصنوعی تمام جزئیات پروژه شما را می‌داند.",
      position: "bottom"
    },
    {
      id: "copilot-templates",
      targetId: "prompt-templates",
      title: "شروع سریع",
      description: "برای شروع، می‌توانید از این دستورات آماده که مخصوص پروژه شما ساخته شده‌اند استفاده کنید.",
      position: "top",
      offset: 160
    },
    {
      id: "copilot-input",
      targetId: "chat-input-container",
      title: "چت با دستیار",
      description: "هر سوالی دارید بپرسید. دستیار کارنکس همیشه آماده پاسخگویی است.",
      position: "top",
      offset: 160
    },
    {
      id: "copilot-mentions",
      targetId: "chat-input-container",
      title: "منوی اشاره (Feature ویژه)",
      description: "با تایپ کردن کاراکتر @، منوی «اشاره» باز می‌شود. می‌توانید بخش‌های خاصی از پروژه (مثل یک تسک خاص، یا یک بلوک از بوم) را به دستیار بدهید تا دقیقاً روی همان بخش تمرکز کند.",
      position: "top",
      offset: 160
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
      description: "با کمک قالب‌های آماده یا دستیار کارنکس، متن‌های حرفه‌ای بنویسید.",
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
      description: "پیچ‌دک شما با کمک دستیار کارنکس آماده شده است! اینجا می‌توانید داستان خود را مرور و ویرایش کنید.",
      position: "bottom"
    },
    {
      id: "deck-grid",
      targetId: "deck-grid",
      title: "ویرایش و شخصی‌سازی",
      description: "روی هر اسلاید کلیک کنید تا محتوا را ویرایش کنید. دستیار کارنکس ساختار استاندارد جذب سرمایه را برای شما چیده است.",
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
      title: "دستیار هوشمند و خروجی",
      description: "با دکمه «کمک گرفتن از دستیار کارنکس» دک را با دستیار کارنکس بازنویسی کنید، یا فایل پاورپوینت (PPTX) قابل ویرایش بگیرید.",
      position: "bottom"
    }
  ],
  "location-analyzer": [
    {
      id: "location-welcome",
      targetId: "location-header",
      title: "هاب هوشمند موقعیت",
      description: "به نسخه جدید خوش آمدید! اینجا می‌توانید تحلیل‌های عمیق و حرفه‌ای از هر موقعیت مکانی داشته باشید.",
      position: "bottom"
    },
    {
      id: "location-search",
      targetId: "location-search",
      title: "جستجوی دقیق",
      description: "شهر و آدرس دقیق ملک را وارد کنید. دستیار کارنکس با بررسی داده‌های لحظه‌ای، آنالیز را شروع می‌کند.",
      position: "bottom"
    },
    {
      id: "location-tabs",
      targetId: "location-tabs",
      title: "ابعاد مختلف تحلیل",
      description: "نتایج در ۵ بخش مجزا شامل رقبا، جمعیت‌شناسی، SWOT و پیشنهادات عملیاتی دسته‌بندی شده‌اند.",
      position: "top"
    },
    {
      id: "location-history",
      targetId: "history-btn",
      title: "تاریخچه تحلیل‌ها",
      description: "تمام تحلیل‌های قبلی شما اینجا ذخیره می‌شوند و می‌توانید دوباره به آن‌ها دسترسی داشته باشید.",
      position: "bottom"
    },
    {
      id: "location-compare",
      targetId: "compare-btn",
      title: "مقایسه پیشرفته",
      description: "می‌توانید تا ۳ موقعیت مختلف را برای مقایسه دقیق کنار هم قرار دهید.",
      position: "bottom"
    }
  ]
};
