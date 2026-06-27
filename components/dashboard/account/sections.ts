import {
  LayoutDashboard,
  User,
  Sparkles,
  CreditCard,
  Gauge,
  Bell,
  Sliders,
  Plug,
  Shield,
  Database,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

export type AccountSectionId =
  | "overview"
  | "profile"
  | "ai"
  | "billing"
  | "usage"
  | "notifications"
  | "preferences"
  | "integrations"
  | "security"
  | "data"
  | "danger";

export interface AccountSection {
  id: AccountSectionId;
  label: string;
  icon: LucideIcon;
  group: "account" | "settings" | "danger";
  accent: "primary" | "violet" | "emerald" | "amber" | "danger";
}

export const ACCOUNT_SECTIONS: AccountSection[] = [
  { id: "overview", label: "نمای کلی", icon: LayoutDashboard, group: "account", accent: "primary" },
  { id: "profile", label: "پروفایل", icon: User, group: "account", accent: "primary" },
  { id: "ai", label: "دستیار هوشمند", icon: Sparkles, group: "account", accent: "violet" },
  { id: "billing", label: "اشتراک و صورت‌حساب", icon: CreditCard, group: "account", accent: "amber" },
  { id: "usage", label: "مصرف و اعتبار", icon: Gauge, group: "account", accent: "emerald" },
  { id: "notifications", label: "اعلان‌ها", icon: Bell, group: "settings", accent: "amber" },
  { id: "preferences", label: "ترجیحات", icon: Sliders, group: "settings", accent: "primary" },
  { id: "integrations", label: "یکپارچه‌سازی‌ها", icon: Plug, group: "settings", accent: "emerald" },
  { id: "security", label: "امنیت", icon: Shield, group: "settings", accent: "primary" },
  { id: "data", label: "داده و حریم خصوصی", icon: Database, group: "settings", accent: "emerald" },
  { id: "danger", label: "خطرات", icon: AlertTriangle, group: "danger", accent: "danger" },
];

export const ACCOUNT_GROUP_LABELS: Record<AccountSection["group"], string> = {
  account: "حساب کاربری",
  settings: "تنظیمات",
  danger: "منطقه خطر",
};
