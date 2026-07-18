/**
 * Account Center — shared types for unified account, settings & personalization.
 *
 * `User.settings` and `User.profile` are stored as JSONB in Prisma. These types
 * describe the canonical shapes used by the Account Center UI and APIs.
 */

export type ThemeMode = "light" | "dark" | "system";
export type AccentColor = "pink" | "violet" | "emerald" | "amber" | "blue";
export type Density = "comfortable" | "compact";
export type DateFormat = "jalali" | "gregorian";
export type AppLanguage = "fa" | "en";
export type DefaultLanding = "overview" | "roadmap" | "copilot" | "last-project";
export type ProjectType = "startup" | "traditional" | "creator";

/** Notification channel × category matrix stored in User.settings.notifications */
export type NotificationChannel = "email" | "inApp" | "push";

export interface NotificationSettings {
  channels: Record<NotificationChannel, boolean>;
  categories: Record<string, Record<NotificationChannel, boolean>>;
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "07:00"
  };
  weeklyDigest: boolean;
  marketing: boolean;
}

/** All app preferences persisted in `User.settings` */
export interface UserSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  theme: ThemeMode;
  language: AppLanguage;
  accent: AccentColor;
  density: Density;
  fontSize: "sm" | "md" | "lg";
  dateFormat: DateFormat;
  defaultLanding: DefaultLanding;
  defaultProjectType: ProjectType;
  dashboardLayout?: string[]; // ordered quick-access tile ids
  notifications: NotificationSettings;
}

/** Extensible profile data persisted in `User.profile` */
export interface UserProfileData {
  displayName?: string;
  pronouns?: string;
  location?: string;
  city?: string;
  timezone?: string;
  // Creator channel links
  channelLinks?: {
    youtube?: string;
    instagram?: string;
    telegram?: string;
    linkedin?: string;
    website?: string;
  };
  // Optional: which creator niche the user focuses on
  niche?: string;
}

export const NOTIFICATION_CATEGORIES = [
  "aiInsights",
  "roadmap",
  "streaks",
  "billing",
  "product",
] as const;

export type NotificationCategory = (typeof NOTIFICATION_CATEGORIES)[number];

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  channels: { email: true, inApp: true, push: false },
  categories: {
    aiInsights: { email: true, inApp: true, push: false },
    roadmap: { email: true, inApp: true, push: false },
    streaks: { email: false, inApp: true, push: false },
    billing: { email: true, inApp: true, push: false },
    product: { email: true, inApp: false, push: false },
  },
  quietHours: { enabled: false, start: "22:00", end: "07:00" },
  weeklyDigest: true,
  marketing: false,
};

export const DEFAULT_USER_SETTINGS: UserSettings = {
  emailNotifications: true,
  smsNotifications: false,
  theme: "system",
  language: "fa",
  accent: "pink",
  density: "comfortable",
  fontSize: "md",
  dateFormat: "jalali",
  defaultLanding: "overview",
  defaultProjectType: "startup",
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
};

/** Merge persisted JSON settings over defaults (defensive against partial/old data). */
export function mergeSettings(raw: unknown): UserSettings {
  const base: UserSettings = { ...DEFAULT_USER_SETTINGS };
  if (!raw || typeof raw !== "object") return base;
  const s = raw as Record<string, unknown>;
  const notificationsRaw =
    s.notifications && typeof s.notifications === "object"
      ? (s.notifications as Record<string, unknown>)
      : {};
  const channelsRaw =
    notificationsRaw.channels && typeof notificationsRaw.channels === "object"
      ? (notificationsRaw.channels as Partial<NotificationSettings["channels"]>)
      : {};
  const quietRaw =
    notificationsRaw.quietHours && typeof notificationsRaw.quietHours === "object"
      ? (notificationsRaw.quietHours as Partial<NotificationSettings["quietHours"]>)
      : {};
  const categoriesRaw =
    notificationsRaw.categories && typeof notificationsRaw.categories === "object"
      ? (notificationsRaw.categories as NotificationSettings["categories"])
      : {};

  return {
    ...base,
    ...(s as Partial<UserSettings>),
    notifications: {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...(notificationsRaw as Partial<NotificationSettings>),
      channels: { ...DEFAULT_NOTIFICATION_SETTINGS.channels, ...channelsRaw },
      quietHours: { ...DEFAULT_NOTIFICATION_SETTINGS.quietHours, ...quietRaw },
      categories: { ...DEFAULT_NOTIFICATION_SETTINGS.categories, ...categoriesRaw },
    },
  };
}

export function mergeProfileData(raw: unknown): UserProfileData {
  if (!raw || typeof raw !== "object") return {};
  return raw as UserProfileData;
}

export const ACCENT_LABELS: Record<AccentColor, string> = {
  pink: "صورتی‌-نارنجی (پیش‌فرض)",
  violet: "بنفش هوش مصنوعی",
  emerald: "سبز زمردی",
  amber: "کهربایی",
  blue: "آبی",
};

export const ACCENT_HEX: Record<AccentColor, { primary: string; secondary: string }> = {
  pink: { primary: "#ec4899", secondary: "#f97316" },
  violet: { primary: "#7c6cf0", secondary: "#a855f7" },
  emerald: { primary: "#10b981", secondary: "#34d399" },
  amber: { primary: "#f59e0b", secondary: "#fbbf24" },
  blue: { primary: "#3b82f6", secondary: "#22d3ee" },
};
