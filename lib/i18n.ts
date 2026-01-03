import { getRequestConfig } from 'next-intl/server';
import { headers } from 'next/headers';
import { locales, defaultLocale, type Locale } from './locale-config';

// Re-export for convenience
export { locales, defaultLocale, type Locale } from './locale-config';

// Configure next-intl (server-side only - called by next-intl plugin)
export default getRequestConfig(async () => {
  // Try to get locale from middleware header
  const headersList = await headers();
  const localeHeader = headersList.get('x-locale');
  
  let locale: Locale = defaultLocale;
  
  if (localeHeader && locales.includes(localeHeader as Locale)) {
    locale = localeHeader as Locale;
  }

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default
  };
});
