import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale, type Locale } from '@/lib/locale-config';

// Simple middleware that reads locale from cookie and sets header for next-intl
export function middleware(request: NextRequest) {
  // Get locale from cookie
  const localeCookie = request.cookies.get('NEXT_LOCALE');
  let locale: Locale = defaultLocale;
  
  if (localeCookie && locales.includes(localeCookie.value as Locale)) {
    locale = localeCookie.value as Locale;
  } else {
    // Try Accept-Language header
    const acceptLanguage = request.headers.get('Accept-Language');
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim().split('-')[0])
        .find(lang => locales.includes(lang as Locale));
      
      if (preferredLocale) {
        locale = preferredLocale as Locale;
      }
    }
  }
  
  // Create response with locale header for next-intl to read
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);
  
  return response;
}

export const config = {
  // Match all routes except API, static files, etc.
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ]
};

