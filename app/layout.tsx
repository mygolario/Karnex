import type { Metadata } from 'next';
import { Vazirmatn, Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ProjectProvider } from '@/contexts/project-context';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { I18nProvider } from '@/components/shared/i18n-provider';
import { getLocale } from 'next-intl/server';
import { localeMetadata, type Locale } from '@/lib/locale-config';

// Load both fonts
const vazir = Vazirmatn({ 
  subsets: ['arabic', 'latin'],
  variable: '--font-vazir'
});

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
});

// Dynamic metadata based on locale
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale() as Locale;
  
  const metadata: Record<Locale, { title: string; description: string }> = {
    fa: {
      title: 'کارنکس | دستیار هوشمند کارآفرینی',
      description: 'با هوش مصنوعی، ایده خود را در ۳۰ ثانیه به یک بیزینس تبدیل کنید. بوم کسب‌وکار، نقشه راه و استراتژی بازاریابی رایگان.'
    },
    en: {
      title: 'Karnex | Smart Entrepreneurship Assistant',
      description: 'Transform your idea into a business in 30 seconds with AI. Free business canvas, roadmap, and marketing strategy.'
    }
  };

  return {
    title: metadata[locale].title,
    description: metadata[locale].description,
    metadataBase: new URL('https://www.karnex.ir'),
    openGraph: {
      title: metadata[locale].title,
      description: metadata[locale].description,
      url: 'https://www.karnex.ir',
      siteName: 'Karnex',
      images: ['/logo-light.png'],
      locale: locale === 'fa' ? 'fa_IR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata[locale].title,
      description: metadata[locale].description,
      images: ['/logo-light.png'],
    },
    manifest: '/manifest.json',
    icons: {
      icon: '/logo-dark.png',
      apple: '/logo-dark.png',
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale() as Locale;
  const { dir } = localeMetadata[locale];
  
  // Select font based on locale
  const fontClass = locale === 'fa' 
    ? `${vazir.variable} ${vazir.className}` 
    : `${inter.variable} ${inter.className}`;

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <body className={`${fontClass} theme-transition`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <I18nProvider>
            <AuthProvider>
              <ProjectProvider>
                {children}
              </ProjectProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
