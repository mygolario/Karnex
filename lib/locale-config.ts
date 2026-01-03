// Locale configuration - shared between client and server
// This file contains only static config, no server-side code

export const locales = ['en', 'fa'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'fa';

export const localeMetadata: Record<Locale, { name: string; nativeName: string; dir: 'ltr' | 'rtl' }> = {
  en: { name: 'English', nativeName: 'English', dir: 'ltr' },
  fa: { name: 'Persian', nativeName: 'فارسی', dir: 'rtl' }
};

export const localeFonts: Record<Locale, string> = {
  en: 'Inter, system-ui, sans-serif',
  fa: 'Vazirmatn, system-ui, sans-serif'
};
