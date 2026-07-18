import type { CanvasTemplate, CanvasType } from "./types";

export const CANVAS_TEMPLATES: Record<CanvasType, CanvasTemplate> = {
  BMC: {
    type: "BMC",
    name: "Business Model Canvas",
    nameFa: "بوم مدل کسب‌وکار",
    description: "۹ بخش استاندارد استراتژی کسب‌وکار",
    sections: [
      { id: "keyPartners", title: "شرکای کلیدی", icon: "Handshake", color: "cyan", area: "partners", description: "تامین‌کنندگان، شرکا و متحدان استراتژیک" },
      { id: "keyActivities", title: "فعالیت‌های کلیدی", icon: "Activity", color: "blue", area: "activities", description: "مهم‌ترین فعالیت‌های روزمره کسب‌وکار" },
      { id: "keyResources", title: "منابع کلیدی", icon: "Package", color: "indigo", area: "resources", description: "دارایی‌های فیزیکی، انسانی و معنوی" },
      { id: "uniqueValue", title: "ارزش پیشنهادی", icon: "Gem", color: "pink", area: "value", description: "چرا مشتری شما را انتخاب می‌کند" },
      { id: "customerRelations", title: "روابط مشتری", icon: "Heart", color: "rose", area: "relations", description: "نوع رابطه و تعامل با مشتری" },
      { id: "channels", title: "کانال‌ها", icon: "Megaphone", color: "orange", area: "channels", description: "مسیرهای دسترسی به مشتری" },
      { id: "customerSegments", title: "بخش‌های مشتری", icon: "Users", color: "purple", area: "segments", description: "مشتریان هدف و ویژگی‌های آن‌ها" },
      { id: "costStructure", title: "ساختار هزینه", icon: "PiggyBank", color: "red", area: "cost", description: "هزینه‌های ثابت و متغیر" },
      { id: "revenueStream", title: "جریان درآمد", icon: "Banknote", color: "green", area: "revenue", description: "مدل درآمدی و منابع کسب درآمد" },
    ],
    gridTemplateAreas: `"partners activities value relations segments" "partners resources value channels segments" "cost cost cost revenue revenue"`,
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(2, minmax(340px, 1fr)) 200px",
  },
  LEAN: {
    type: "LEAN",
    name: "Lean Canvas",
    nameFa: "بوم ناب",
    description: "نسخه بهینه‌شده برای استارتاپ‌ها",
    sections: [
      { id: "problem", title: "مشکل", icon: "AlertTriangle", color: "red", area: "problem", description: "سه مشکل کلیدی که حل می‌کنید" },
      { id: "solution", title: "راه‌حل", icon: "Lightbulb", color: "green", area: "solution", description: "سه راه‌حل کلیدی" },
      { id: "uniqueValue", title: "ارزش پیشنهادی", icon: "Gem", color: "pink", area: "value", description: "پیام واحد ارزش" },
      { id: "revenueStream", title: "جریان درآمد", icon: "Banknote", color: "green", area: "revenue", description: "مدل درآمدی" },
      { id: "costStructure", title: "ساختار هزینه", icon: "PiggyBank", color: "red", area: "cost", description: "هزینه‌های کلیدی" },
      { id: "customerSegments", title: "بخش مشتری", icon: "Users", color: "purple", area: "segments", description: "مشتریان هدف" },
      { id: "keyMetrics", title: "معیارهای کلیدی", icon: "BarChart", color: "blue", area: "metrics", description: "اعداد کلیدی کسب‌وکار" },
      { id: "unfairAdvantage", title: "مزیت رقابتی", icon: "Trophy", color: "amber", area: "advantage", description: "چیزهایی که رقبا نمی‌توانند کپی کنند" },
      { id: "channels", title: "کانال‌ها", icon: "Megaphone", color: "orange", area: "channels", description: "مسیرهای دسترسی" },
    ],
    gridTemplateAreas: `"problem solution value segments segments" "problem solution value segments segments" "cost cost revenue metrics advantage" "channels channels revenue metrics advantage"`,
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(2, minmax(300px, 1fr)) repeat(2, 180px)",
  },
  BRAND: {
    type: "BRAND",
    name: "Brand Canvas",
    nameFa: "بوم برند شخصی",
    description: "مخصوص کریییتورها و برندهای شخصی",
    sections: [
      { id: "identity", title: "هویت برند", icon: "Gem", color: "purple", area: "identity", description: "شخصیت و هویت برند شما" },
      { id: "promise", title: "وعده برند", icon: "Star", color: "amber", area: "promise", description: "چه چیزی به مخاطب قول می‌دهید" },
      { id: "audience", title: "مخاطب هدف", icon: "Users", color: "blue", area: "audience", description: "مخاطبان اصلی شما کیستند" },
      { id: "contentStrategy", title: "استراتژی محتوا", icon: "LayoutGrid", color: "pink", area: "content", description: "ستون‌های محتوایی شما" },
      { id: "channels", title: "کانال‌ها", icon: "Share2", color: "violet", area: "channels", description: "پلتفرم‌های انتشار" },
      { id: "monetization", title: "درآمد", icon: "Banknote", color: "emerald", area: "monetization", description: "مدل‌های کسب درآمد" },
      { id: "resources", title: "منابع", icon: "Package", color: "cyan", area: "resources", description: "ابزارها و منابع لازم" },
      { id: "collaborators", title: "همکاران", icon: "Handshake", color: "rose", area: "collaborators", description: "شبکه و شرکا" },
      { id: "investment", title: "سرمایه", icon: "PiggyBank", color: "red", area: "investment", description: "سرمایه و بودجه" },
    ],
    gridTemplateAreas: `"identity promise promise audience audience" "identity content content audience audience" "channels channels monetization resources collaborators" "investment investment monetization resources collaborators"`,
    gridTemplateColumns: "repeat(5, 1fr)",
    gridTemplateRows: "repeat(2, minmax(300px, 1fr)) repeat(2, 180px)",
  },
  SWOT: {
    type: "SWOT",
    name: "SWOT Analysis",
    nameFa: "تحلیل سوات",
    description: "نقاط قوت، ضعف، فرصت‌ها و تهدیدها",
    sections: [
      { id: "strengths", title: "نقاط قوت", icon: "ShieldCheck", color: "green", area: "strengths", description: "ویژگی‌های مثبت داخلی" },
      { id: "weaknesses", title: "نقاط ضعف", icon: "AlertCircle", color: "red", area: "weaknesses", description: "ویژگی‌های منفی داخلی" },
      { id: "opportunities", title: "فرصت‌ها", icon: "TrendingUp", color: "blue", area: "opportunities", description: "فرصت‌های محیطی خارجی" },
      { id: "threats", title: "تهدیدها", icon: "AlertTriangle", color: "orange", area: "threats", description: "خطرات محیطی خارجی" },
    ],
    gridTemplateAreas: `"strengths weaknesses" "opportunities threats"`,
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "repeat(2, minmax(320px, 1fr))",
  },
  EMPATHY: {
    type: "EMPATHY",
    name: "Empathy Map",
    nameFa: "نقشه همدلی",
    description: "درک عمیق مشتری و نیازهای او",
    sections: [
      { id: "says", title: "می‌گوید", icon: "MessageSquare", color: "blue", area: "says", description: "آنچه مشتری می‌گوید" },
      { id: "thinks", title: "فکر می‌کند", icon: "Brain", color: "purple", area: "thinks", description: "آنچه در ذهن دارد" },
      { id: "does", title: "انجام می‌دهد", icon: "Activity", color: "green", area: "does", description: "رفتارها و اقدامات" },
      { id: "feels", title: "حس می‌کند", icon: "Heart", color: "rose", area: "feels", description: "احساسات و هیجانات" },
      { id: "pains", title: "درد‌ها", icon: "AlertTriangle", color: "red", area: "pains", description: "ترس‌ها و نگرانی‌ها" },
      { id: "gains", title: "دستاوردها", icon: "Trophy", color: "amber", area: "gains", description: "آرزوها و خواسته‌ها" },
    ],
    gridTemplateAreas: `"says thinks" "does feels" "pains gains"`,
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "repeat(3, minmax(260px, 1fr))",
  },
  VPC: {
    type: "VPC",
    name: "Value Proposition Canvas",
    nameFa: "بوم ارزش پیشنهادی",
    description: "تطبیق محصول با نیاز مشتری",
    sections: [
      { id: "customerJobs", title: "کارهای مشتری", icon: "Briefcase", color: "blue", area: "jobs", description: "کارهایی که مشتری می‌خواهد انجام دهد" },
      { id: "customerPains", title: "درد‌های مشتری", icon: "AlertTriangle", color: "red", area: "pains", description: "موانع و چالش‌های مشتری" },
      { id: "customerGains", title: "انتظارات مشتری", icon: "TrendingUp", color: "green", area: "gains", description: "آنچه مشتری انتظار دارد" },
      { id: "productsServices", title: "محصولات و خدمات", icon: "Package", color: "purple", area: "products", description: "آنچه ارائه می‌دهید" },
      { id: "painRelievers", title: "درد‌شکن‌ها", icon: "Heart", color: "rose", area: "relievers", description: "چگونه درد را برطرف می‌کنید" },
      { id: "gainCreators", title: "خلق ارزش", icon: "Sparkles", color: "amber", area: "creators", description: "چگونه ارزش ایجاد می‌کنید" },
    ],
    gridTemplateAreas: `"jobs products" "pains products" "pains relievers" "gains relievers" "gains creators"`,
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "repeat(5, minmax(200px, 1fr))",
  },
  OKR: {
    type: "OKR",
    name: "OKR Map",
    nameFa: "نقشه اهداف و نتایج کلیدی",
    description: "اهداف، نتایج کلیدی و اقدامات",
    sections: [
      { id: "objective", title: "هدف اصلی", icon: "Target", color: "indigo", area: "objective", description: "هدف کیفی و الهام‌بخش" },
      { id: "keyResults", title: "نتایج کلیدی", icon: "TrendingUp", color: "blue", area: "keyResults", description: "معیارهای قابل اندازه‌گیری" },
      { id: "initiatives", title: "اقدامات", icon: "Activity", color: "green", area: "initiatives", description: "کارهایی که باید انجام دهید" },
      { id: "owner", title: "مسئولان", icon: "Users", color: "amber", area: "owner", description: "افراد مسئول هر نتایج" },
    ],
    gridTemplateAreas: `"objective objective" "keyResults initiatives" "keyResults owner"`,
    gridTemplateColumns: "repeat(2, 1fr)",
    gridTemplateRows: "minmax(200px, auto) repeat(2, minmax(280px, 1fr))",
  },
};

export const DEFAULT_CANVAS_TYPE: CanvasType = "BMC";

export function getTemplate(type: CanvasType): CanvasTemplate {
  return CANVAS_TEMPLATES[type] || CANVAS_TEMPLATES.BMC;
}

export function getSectionDef(type: CanvasType, sectionId: string): CanvasTemplate["sections"][0] | undefined {
  return CANVAS_TEMPLATES[type]?.sections.find((s) => s.id === sectionId);
}

export function getDefaultCanvasType(projectType?: string): CanvasType {
  if (projectType === "creator") return "BRAND";
  return "BMC";
}
