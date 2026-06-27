import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ProjectProvider } from '@/contexts/project-context';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { JsonLd } from '@/components/shared/json-ld';
import { NetworkStatus } from '@/components/shared/network-status';
import { CookieBanner } from '@/components/shared/cookie-banner'; 
import { GoogleAnalytics, PerformanceMonitoring } from '@/components/shared/analytics';
import { WebVitalsReporter } from '@/components/shared/web-vitals-reporter';
import { ToastProvider } from '@/components/ui/toast';
import { ServiceWorkerRegister } from '@/components/pwa/service-worker-register';

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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'کارنکس',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#7c3aed' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#7c3aed',
};

const vazirmatn = localFont({
  src: [
    {
      path: '../vazirmatn-v33.003/fonts/webfonts/Vazirmatn-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../vazirmatn-v33.003/fonts/webfonts/Vazirmatn-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../vazirmatn-v33.003/fonts/webfonts/Vazirmatn-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../vazirmatn-v33.003/fonts/webfonts/Vazirmatn-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-vazirmatn',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning className={vazirmatn.variable}>
      <head />
      <body className={`${vazirmatn.className} theme-transition`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          رفتن به محتوای اصلی
        </a>
        <JsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
              <ToastProvider>
                <GoogleAnalytics />
                <WebVitalsReporter />
                <PerformanceMonitoring />
                <ProjectProvider>
                  <NetworkStatus />
                  <ServiceWorkerRegister />
                  {children}
                  <CookieBanner />
                </ProjectProvider>
              </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
