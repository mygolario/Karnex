import type { TourDefinition, ChecklistItem, TourStep, TourStepContext } from "./types";

export const TOUR_VERSION = "2.0.0";

export const ACCENT_CLASSES: Record<string, { gradient: string; ring: string; text: string; bg: string }> = {
  primary: { gradient: "from-primary to-violet-600", ring: "ring-primary/50", text: "text-primary", bg: "bg-primary/10" },
  indigo: { gradient: "from-indigo-500 to-indigo-700", ring: "ring-indigo-500/50", text: "text-indigo-500", bg: "bg-indigo-500/10" },
  violet: { gradient: "from-violet-500 to-purple-700", ring: "ring-violet-500/50", text: "text-violet-500", bg: "bg-violet-500/10" },
  emerald: { gradient: "from-emerald-500 to-teal-600", ring: "ring-emerald-500/50", text: "text-emerald-500", bg: "bg-emerald-500/10" },
  amber: { gradient: "from-amber-500 to-orange-600", ring: "ring-amber-500/50", text: "text-amber-500", bg: "bg-amber-500/10" },
  sky: { gradient: "from-sky-500 to-blue-600", ring: "ring-sky-500/50", text: "text-sky-500", bg: "bg-sky-500/10" },
  rose: { gradient: "from-rose-500 to-pink-600", ring: "ring-rose-500/50", text: "text-rose-500", bg: "bg-rose-500/10" },
  fuchsia: { gradient: "from-fuchsia-500 to-purple-600", ring: "ring-fuchsia-500/50", text: "text-fuchsia-500", bg: "bg-fuchsia-500/10" },
  teal: { gradient: "from-teal-500 to-cyan-600", ring: "ring-teal-500/50", text: "text-teal-500", bg: "bg-teal-500/10" },
};

function filterSteps(steps: TourStep[], ctx: TourStepContext): TourStep[] {
  return steps.filter((step) => {
    if (step.showIf && !step.showIf(ctx)) return false;
    if (step.personas?.length && ctx.persona !== "general" && !step.personas.includes(ctx.persona)) {
      return false;
    }
    return true;
  });
}

export const TOUR_REGISTRY: Record<string, TourDefinition> = {
  dashboard: {
    id: "dashboard",
    title: "تور پیشخوان",
    description: "آشنایی با داشبورد و ابزارهای اصلی",
    accent: "primary",
    route: "/dashboard/overview",
    helpCenterHref: "/dashboard/help",
    xpReward: 50,
    checklistItem: true,
    steps: [
      {
        id: "welcome",
        target: "dashboard-root",
        title: "به کارنکس خوش آمدید",
        description: "در اینجا نمایی کلی از وضعیت پروژه، ابزارها و آمارهای کلیدی خود را مشاهده می‌کنید.",
        type: "centered",
        mood: "welcome",
        position: "bottom",
      },
      {
        id: "sidebar",
        target: "sidebar-nav",
        title: "جعبه ابزار شما",
        description: "دسترسی سریع به تمام بخش‌های پروژه: از بوم مدل کسب‌وکار تا نقشه راه و اسکریپت‌ها.",
        mood: "tip",
        position: "left",
      },
      {
        id: "stats",
        target: "stats-strip",
        title: "نبض کسب‌وکار",
        description: "وضعیت کلی پروژه، امتیاز فعلی و روزهای فعالیت شما در یک نگاه.",
        mood: "tip",
        position: "top",
      },
      {
        id: "missions-hint",
        target: "setup-checklist",
        title: "مرکز مأموریت",
        description: "مأموریت‌ها و XP راه‌اندازی را از چک‌لیست و مرکز راهنما دنبال کنید.",
        mood: "action",
        position: "top",
        personas: ["founder", "creator", "marketer", "general"],
      },
      {
        id: "help",
        target: "help-button",
        title: "مرکز راهنما",
        description: "هر زمان نیاز به راهنمایی داشتید، از اینجا تورها را بازپخش کنید یا چک‌لیست را ببینید.",
        mood: "action",
        position: "bottom",
      },
      {
        id: "finish",
        target: "dashboard-root",
        title: "شروع کنید!",
        description: "تور آموزشی به پایان رسید. حالا می‌توانید با استفاده از بخش‌های مختلف، مدیریت پروژه خود را آغاز کنید.",
        type: "centered",
        mood: "success",
        position: "bottom",
      },
    ],
  },
  roadmap: {
    id: "roadmap",
    title: "تور نقشه راه",
    description: "مسیر گام‌به‌گام موفقیت پروژه",
    accent: "indigo",
    route: "/dashboard/roadmap",
    helpCenterHref: "/dashboard/help",
    xpReward: 40,
    checklistItem: true,
    steps: [
      {
        id: "roadmap-welcome",
        target: "roadmap-header",
        title: "نقشه راه کسب‌وکار",
        description: "اینجا می‌توانید مسیر موفقیت پروژه خود را مرحله به مرحله ببینید.",
        route: "/dashboard/roadmap",
        mood: "welcome",
        position: "bottom",
      },
      {
        id: "roadmap-phases",
        target: "phases-container",
        title: "فازهای پروژه",
        description: "پروژه شما به فازهای مشخص تقسیم شده است که باید یکی‌یکی تکمیل شوند.",
        mood: "tip",
        position: "bottom",
      },
      {
        id: "roadmap-kanban",
        target: "roadmap-toolbar",
        title: "مدیریت تسک‌ها",
        description: "با تغییر نما می‌توانید تسک‌ها را در Kanban، لیست یا تقویم مدیریت کنید.",
        mood: "action",
        position: "bottom",
      },
    ],
  },
  canvas: {
    id: "canvas",
    title: "تور بوم کسب‌وکار",
    description: "طراحی استراتژی در یک نگاه",
    accent: "violet",
    route: "/dashboard/canvas",
    helpCenterHref: "/dashboard/help",
    xpReward: 40,
    checklistItem: true,
    steps: [
      {
        id: "canvas-welcome",
        target: "canvas-header",
        title: "بوم مدل کسب‌وکار",
        description: "قلب استراتژی بیزینس شما. تمام اجزای کلیدی را اینجا طراحی کنید.",
        route: "/dashboard/canvas",
        mood: "welcome",
        position: "bottom",
      },
      {
        id: "canvas-board",
        target: "canvas-board",
        title: "بلوک‌های بوم",
        description: "روی هر بلوک کلیک کنید تا جزئیات آن (مثل مشتریان یا ارزش پیشنهادی) را ویرایش کنید.",
        mood: "tip",
        position: "top",
      },
      {
        id: "canvas-ai",
        target: "ai-auto-fill",
        title: "راهنمای هوشمند",
        description: "با پاسخ به چند سوال ساده، دستیار کارنکس تمام بخش‌های بوم شما را به صورت حرفه‌ای تکمیل می‌کند.",
        type: "interactive",
        actionTarget: "ai-auto-fill",
        mood: "action",
        position: "bottom",
        proTip: "می‌توانید بعداً هم از این دکمه برای بازنویسی بخش‌ها استفاده کنید.",
      },
    ],
  },
  copilot: {
    id: "copilot",
    title: "تور دستیار کارنکس",
    description: "مشاور ۲۴ ساعته اختصاصی",
    accent: "emerald",
    route: "/dashboard/copilot",
    helpCenterHref: "/dashboard/help",
    xpReward: 35,
    checklistItem: true,
    steps: [
      {
        id: "copilot-welcome",
        target: "copilot-header",
        title: "دستیار هوشمند کارنکس",
        description: "مشاور ۲۴ ساعته اختصاصی شما. این هوش مصنوعی تمام جزئیات پروژه شما را می‌داند.",
        route: "/dashboard/copilot",
        mood: "welcome",
        position: "bottom",
      },
      {
        id: "copilot-templates",
        target: "prompt-templates",
        title: "شروع سریع",
        description: "برای شروع، می‌توانید از این دستورات آماده که مخصوص پروژه شما ساخته شده‌اند استفاده کنید.",
        mood: "tip",
        position: "top",
        offset: 160,
      },
      {
        id: "copilot-input",
        target: "chat-input-container",
        title: "چت با دستیار",
        description: "هر سوالی دارید بپرسید. دستیار کارنکس همیشه آماده پاسخگویی است.",
        mood: "action",
        position: "top",
        offset: 160,
      },
      {
        id: "copilot-mentions",
        target: "chat-input-container",
        title: "منوی اشاره",
        description: "با تایپ @، بخش‌های خاص پروژه را به دستیار بدهید تا دقیقاً روی همان بخش تمرکز کند.",
        type: "pro-tip",
        mood: "tip",
        position: "top",
        offset: 160,
      },
    ],
  },
  calendar: {
    id: "calendar",
    title: "تور تقویم محتوا",
    description: "برنامه‌ریزی و انتشار محتوا",
    accent: "amber",
    route: "/dashboard/content-calendar",
    helpCenterHref: "/dashboard/help",
    xpReward: 35,
    checklistItem: true,
    projectTypes: ["creator"],
    personas: ["creator", "marketer"],
    steps: [
      {
        id: "calendar-welcome",
        target: "calendar-header",
        title: "تقویم محتوا",
        description: "برنامه‌ریزی، تولید و انتشار محتوا را اینجا مدیریت کنید.",
        route: "/dashboard/content-calendar",
        mood: "welcome",
        position: "bottom",
      },
      {
        id: "calendar-view",
        target: "calendar-grid",
        title: "نمای تقویم",
        description: "رویدادهای خود را در نمای ماهانه ببینید و مدیریت کنید.",
        mood: "tip",
        position: "top",
      },
      {
        id: "calendar-ai",
        target: "ai-strategy-btn",
        title: "استراتژی هوشمند",
        description: "به کارنکس بگویید چه هدفی دارید تا برنامه محتوایی شما را بچیند.",
        mood: "action",
        position: "left",
      },
    ],
  },
  scripts: {
    id: "scripts",
    title: "تور اسکریپت‌نویسی",
    description: "نوشتن سناریو و متن تبلیغاتی",
    accent: "sky",
    route: "/dashboard/scripts",
    helpCenterHref: "/dashboard/help",
    xpReward: 30,
    checklistItem: true,
    projectTypes: ["creator"],
    personas: ["creator"],
    steps: [
      {
        id: "scripts-welcome",
        target: "scripts-header",
        title: "مدیریت اسکریپت‌ها",
        description: "سناریوی ویدیوها و متون تبلیغاتی خود را اینجا بنویسید.",
        route: "/dashboard/scripts",
        mood: "welcome",
        position: "bottom",
      },
      {
        id: "new-script",
        target: "new-script-btn",
        title: "نوشتن اسکریپت جدید",
        description: "با کمک قالب‌های آماده یا دستیار کارنکس، متن‌های حرفه‌ای بنویسید.",
        mood: "action",
        position: "left",
      },
    ],
  },
  sponsorship: {
    id: "sponsorship",
    title: "تور تعرفه اسپانسری",
    description: "محاسبه نرخ تبلیغات",
    accent: "rose",
    route: "/dashboard/sponsor-rates",
    helpCenterHref: "/dashboard/help",
    xpReward: 30,
    checklistItem: true,
    projectTypes: ["creator"],
    personas: ["creator", "marketer"],
    steps: [
      {
        id: "sponsor-welcome",
        target: "sponsor-header",
        title: "تعرفه اسپانسری",
        description: "مدیریت و محاسبه نرخ تبلیغات و همکاری‌های شما.",
        route: "/dashboard/sponsor-rates",
        mood: "welcome",
        position: "bottom",
      },
      {
        id: "sponsor-calculator",
        target: "rate-calculator",
        title: "محاسبه‌گر نرخ",
        description: "بر اساس بازدید و تعامل، قیمت منصفانه تبلیغات خود را محاسبه کنید.",
        mood: "tip",
        position: "top",
      },
    ],
  },
  "pitch-deck": {
    id: "pitch-deck",
    title: "تور پیچ‌دک",
    description: "داستان استارتاپ برای جذب سرمایه",
    accent: "fuchsia",
    route: "/dashboard/pitch-deck",
    helpCenterHref: "/dashboard/help",
    xpReward: 40,
    checklistItem: true,
    projectTypes: ["startup"],
    personas: ["founder"],
    steps: [
      {
        id: "deck-welcome",
        target: "deck-header",
        title: "داستان استارتاپ شما",
        description: "پیچ‌دک شما با کمک دستیار کارنکس آماده شده است! اینجا می‌توانید داستان خود را مرور و ویرایش کنید.",
        route: "/dashboard/pitch-deck",
        mood: "welcome",
        position: "bottom",
      },
      {
        id: "deck-grid",
        target: "deck-grid",
        title: "ویرایش و شخصی‌سازی",
        description: "روی هر اسلاید کلیک کنید تا محتوا را ویرایش کنید.",
        mood: "tip",
        position: "top",
      },
      {
        id: "add-slide",
        target: "add-slide-btn",
        title: "افزودن اسلاید جدید",
        description: "اگر نیاز به اسلاید بیشتری دارید، از اینجا اضافه کنید.",
        mood: "action",
        position: "left",
      },
      {
        id: "deck-actions",
        target: "deck-actions",
        title: "دستیار هوشمند و خروجی",
        description: "با دستیار کارنکس دک را بازنویسی کنید، یا فایل PPTX قابل ویرایش بگیرید.",
        mood: "success",
        position: "bottom",
      },
    ],
  },
  "location-analyzer": {
    id: "location-analyzer",
    title: "تور تحلیل موقعیت",
    description: "تحلیل حرفه‌ای موقعیت مکانی",
    accent: "teal",
    route: "/dashboard/location",
    helpCenterHref: "/dashboard/help",
    xpReward: 40,
    checklistItem: true,
    projectTypes: ["traditional"],
    steps: [
      {
        id: "location-welcome",
        target: "location-header",
        title: "هاب هوشمند موقعیت",
        description: "تحلیل‌های عمیق و حرفه‌ای از هر موقعیت مکانی.",
        route: "/dashboard/location",
        mood: "welcome",
        position: "bottom",
      },
      {
        id: "location-search",
        target: "location-search",
        title: "جستجوی دقیق",
        description: "شهر و آدرس دقیق ملک را وارد کنید تا آنالیز شروع شود.",
        mood: "action",
        position: "bottom",
      },
      {
        id: "location-tabs",
        target: "location-tabs",
        title: "ابعاد مختلف تحلیل",
        description: "نتایج در بخش‌های رقبا، جمعیت‌شناسی، SWOT و پیشنهادات عملیاتی دسته‌بندی شده‌اند.",
        mood: "tip",
        position: "top",
      },
      {
        id: "location-history",
        target: "history-btn",
        title: "تاریخچه تحلیل‌ها",
        description: "تمام تحلیل‌های قبلی شما اینجا ذخیره می‌شوند.",
        mood: "tip",
        position: "bottom",
      },
      {
        id: "location-compare",
        target: "compare-btn",
        title: "مقایسه پیشرفته",
        description: "می‌توانید تا ۳ موقعیت مختلف را برای مقایسه دقیق کنار هم قرار دهید.",
        mood: "success",
        position: "bottom",
      },
    ],
  },
  "whats-new": {
    id: "whats-new",
    title: "تازه‌های کارنکس",
    description: "ویژگی‌های جدید نسخه ۲",
    accent: "primary",
    route: "/dashboard/overview",
    xpReward: 25,
    version: TOUR_VERSION,
    steps: [
      {
        id: "whats-new-welcome",
        target: "dashboard-root",
        title: "راهنمای جدید کارنکس!",
        description: "سیستم راهنمای تعاملی جدید با راهنمای متحرک، چک‌لیست و پاداش XP اضافه شد.",
        type: "centered",
        mood: "celebrate",
        position: "bottom",
      },
      {
        id: "whats-new-checklist",
        target: "setup-checklist",
        title: "چک‌لیست راه‌اندازی",
        description: "پیشرفت خود را دنبال کنید و با تکمیل هر بخش XP بگیرید.",
        mood: "tip",
        position: "top",
      },
      {
        id: "whats-new-launcher",
        target: "help-button",
        title: "مرکز تورها",
        description: "از دکمه راهنما می‌توانید هر تور را دوباره اجرا کنید.",
        mood: "success",
        position: "bottom",
      },
    ],
  },
};

export const CHECKLIST_ITEMS: ChecklistItem[] = Object.values(TOUR_REGISTRY)
  .filter((t) => t.checklistItem)
  .map((t, i) => ({
    id: `checklist-${t.id}`,
    tourId: t.id,
    title: t.title.replace("تور ", ""),
    description: t.description,
    xpReward: t.xpReward,
    order: i,
    personas: t.personas,
    projectTypes: t.projectTypes,
  }))
  .sort((a, b) => a.order - b.order);

export function getTour(tourId: string): TourDefinition | undefined {
  return TOUR_REGISTRY[tourId];
}

export function getAllTours(): TourDefinition[] {
  return Object.values(TOUR_REGISTRY);
}

export function getVisibleSteps(tourId: string, ctx: TourStepContext): TourStep[] {
  const tour = getTourWithDynamic(tourId);
  if (!tour) return [];
  if (
    tour.projectTypes?.length &&
    ctx.projectType &&
    !tour.projectTypes.includes(ctx.projectType as "startup" | "traditional" | "creator")
  ) {
    return [];
  }
  if (
    tour.personas?.length &&
    ctx.persona !== "general" &&
    !tour.personas.includes(ctx.persona)
  ) {
    return [];
  }
  return filterSteps(tour.steps, ctx);
}

export function getToursForProjectType(projectType?: string): TourDefinition[] {
  return getAllTours().filter((t) => {
    if (!t.projectTypes?.length) return true;
    if (!projectType) return true;
    return t.projectTypes.includes(projectType as "startup" | "traditional" | "creator");
  });
}

export function getNextRecommendedTour(
  completedTours: string[],
  projectType?: string
): TourDefinition | null {
  const available = getToursForProjectType(projectType).filter(
    (t) => t.id !== "whats-new" && !completedTours.includes(t.id)
  );
  const priority = ["dashboard", "roadmap", "canvas", "copilot"];
  for (const id of priority) {
    const found = available.find((t) => t.id === id);
    if (found) return found;
  }
  return available[0] ?? null;
}

/** Dynamic micro-tours registered at runtime */
const dynamicRegistry: Record<string, TourDefinition> = {};

export function registerTour(definition: TourDefinition) {
  dynamicRegistry[definition.id] = definition;
}

export function unregisterTour(tourId: string) {
  delete dynamicRegistry[tourId];
}

export function getTourWithDynamic(tourId: string): TourDefinition | undefined {
  return dynamicRegistry[tourId] ?? TOUR_REGISTRY[tourId];
}

export function getAllToursWithDynamic(): TourDefinition[] {
  const ids = new Set<string>();
  const result: TourDefinition[] = [];
  for (const t of [...Object.values(TOUR_REGISTRY), ...Object.values(dynamicRegistry)]) {
    if (!ids.has(t.id)) {
      ids.add(t.id);
      result.push(t);
    }
  }
  return result;
}
