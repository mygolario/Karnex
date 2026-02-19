import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ProjectProvider } from '@/contexts/project-context';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { JsonLd } from '@/components/shared/json-ld';
import { NetworkStatus } from '@/components/shared/network-status';
import { CookieBanner } from '@/components/shared/cookie-banner'; 
import { GoogleAnalytics } from '@/components/shared/analytics';
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from '@/components/ui/toast';

const vazir = Vazirmatn({ subsets: ['arabic', 'latin'] });

export const metadata: Metadata = {
  title: {
    default: 'کارنکس | دستیار هوشمند کارآفرینی',
    template: '%s | کارنکس',
  },
  description: 'با دستیار کارنکس، ایده خود را در ۳۰ ثانیه به یک بیزینس تبدیل کنید. بوم کسب‌وکار، نقشه راه و استراتژی بازاریابی رایگان.',
  keywords: [
    'کارآفرینی',
    'استارتاپ',
    'دستیار کارنکس',
    'بوم کسب‌وکار',
    'بیزینس مدل',
    'ایده پردازی',
    'راه اندازی کسب و کار',
    'کارنکس',
    'Karnex',
    'startup',
    'business model canvas',
    'AI business assistant',
  ],
  authors: [{ name: 'Karnex Team', url: 'https://www.karnex.ir' }],
  creator: 'Karnex',
  publisher: 'Karnex',
  metadataBase: new URL('https://www.karnex.ir'),
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'کارنکس | دستیار هوشمند کارآفرینی',
    description: 'با دستیار کارنکس، ایده خود را به یک بیزینس تبدیل کنید. بوم کسب‌وکار، نقشه راه و استراتژی بازاریابی رایگان.',
    url: 'https://www.karnex.ir',
    siteName: 'Karnex',
    locale: 'fa_IR',
    type: 'website',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'کارنکس - دستیار هوشمند کارآفرینی' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'کارنکس | دستیار هوشمند کارآفرینی',
    description: 'با دستیار کارنکس، ایده خود را به یک بیزینس تبدیل کنید.',
    creator: '@karnex_ir',
    images: ['/opengraph-image.png'],
  },
  manifest: '/manifest.json',
  category: 'technology',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazir.className} theme-transition`}>
        <JsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SessionProvider>
            <AuthProvider>
              <ToastProvider>
                <GoogleAnalytics />
                <ProjectProvider>
                  <NetworkStatus />
                  {children}
                  <CookieBanner />
                </ProjectProvider>
              </ToastProvider>
            </AuthProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
