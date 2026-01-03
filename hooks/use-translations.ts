"use client";

import { useTranslations as useNextIntlTranslations, useLocale as useNextIntlLocale } from 'next-intl';
import { localeMetadata, type Locale } from '@/lib/locale-config';

// Re-export the useTranslations hook with better typing
export function useTranslations(namespace?: string) {
  return useNextIntlTranslations(namespace);
}

// Custom hook for locale with metadata
export function useLocale() {
  const locale = useNextIntlLocale() as Locale;
  const metadata = localeMetadata[locale];
  
  return {
    locale,
    isRTL: metadata.dir === 'rtl',
    dir: metadata.dir,
    name: metadata.name,
    nativeName: metadata.nativeName
  };
}

// Type-safe translation keys for common namespaces
export type CommonTranslationKey = 
  | 'loading' | 'error' | 'retry' | 'save' | 'cancel' | 'delete' 
  | 'edit' | 'create' | 'back' | 'next' | 'submit' | 'search'
  | 'filter' | 'sort' | 'viewAll' | 'seeMore' | 'close' | 'confirm'
  | 'success' | 'copied';

export type NavTranslationKey = 
  | 'home' | 'features' | 'pricing' | 'login' | 'signup' 
  | 'dashboard' | 'logout' | 'profile' | 'settings';

