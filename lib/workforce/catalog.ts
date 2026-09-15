import type { WorkforceAgentId } from "./types";

export type WorkforcePillar = "startup" | "traditional" | "creator";

export interface WorkforceAgentDef {
  id: Exclude<WorkforceAgentId, "night_shift">;
  name: string;
  role: string;
  tagline: string;
  description: string;
  dispatchLabel: string;
  icon: "radar" | "list-checks" | "megaphone" | "presentation";
  accent: "teal" | "amber" | "pink" | "violet";
  creditFeature: string;
  pillars: readonly WorkforcePillar[];
}

export const WORKFORCE_AGENTS: readonly WorkforceAgentDef[] = [
  {
    id: "research",
    name: "عامل تحقیق",
    role: "رادار بازار",
    tagline: "رقبا و بازار را این هفته چک می‌کند",
    description:
      "بر اساس پروژهٔ تو، حرکت رقبا، تهدیدها و ۳ کار بعدی تحقیق را آماده می‌کند. تا تأیید نکنی چیزی روی پروژه نوشته نمی‌شود.",
    dispatchLabel: "بفرست دنبال بازار",
    icon: "radar",
    accent: "teal",
    creditFeature: "agent-research",
    pillars: ["startup", "traditional", "creator"],
  },
  {
    id: "execution",
    name: "عامل اجرا",
    role: "هفتهٔ کاری",
    tagline: "نقشه راه را به مأموریت‌های قابل انجام تبدیل می‌کند",
    description:
      "گام بعدی نقشه راه را خرد می‌کند: زمان، چک‌لیست، و متن آمادهٔ کپی. بعد از تأیید، یادداشت روی همان گام نوشته می‌شود.",
    dispatchLabel: "بساز هفتهٔ کاری",
    icon: "list-checks",
    accent: "amber",
    creditFeature: "agent-execution",
    pillars: ["startup", "traditional", "creator"],
  },
  {
    id: "growth",
    name: "عامل رشد",
    role: "خروجی این هفته",
    tagline: "پست، پیام و سوال مصاحبه آماده می‌کند",
    description:
      "۳ کپشن اینستاگرام/تلگرام، یک اسکریپت مصاحبه با مشتری، و یک پیام دایرکت. با تأیید، پست‌ها وارد تقویم محتوا می‌شوند.",
    dispatchLabel: "بساز بسته رشد",
    icon: "megaphone",
    accent: "pink",
    creditFeature: "agent-growth",
    pillars: ["startup", "traditional", "creator"],
  },
  {
    id: "capital",
    name: "عامل سرمایه",
    role: "میز سرمایه‌گذار",
    tagline: "یک‌خطی، پرسش‌های سخت و پاسخ آماده",
    description:
      "برای استارتاپ: وان‌لاینر، درخواست سرمایه، ۵ سوال پرتکرار سرمایه‌گذار و اعتراض‌های رایج — از روی بوم همین پروژه.",
    dispatchLabel: "آماده‌سازی پیچ",
    icon: "presentation",
    accent: "violet",
    creditFeature: "agent-capital",
    pillars: ["startup"],
  },
] as const;

export const NIGHT_SHIFT = {
  id: "night_shift" as const,
  name: "شب‌کاری کارنکس",
  tagline: "چند عامل با هم کار می‌کنند؛ صبح تو فقط تأیید می‌کنی",
  creditFeature: "agent-night-shift",
};

export function getAgentDef(id: string): WorkforceAgentDef | undefined {
  return WORKFORCE_AGENTS.find((a) => a.id === id);
}

export function agentsForPillar(pillar: string | undefined): WorkforceAgentDef[] {
  const p = (pillar || "startup") as WorkforcePillar;
  return WORKFORCE_AGENTS.filter((a) => a.pillars.includes(p));
}

export function creditFeatureForAgent(id: string): string {
  if (id === "night_shift") return NIGHT_SHIFT.creditFeature;
  return getAgentDef(id)?.creditFeature ?? "agent-execution";
}
