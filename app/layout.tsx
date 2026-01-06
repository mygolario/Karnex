import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ProjectProvider } from '@/contexts/project-context';
import { ThemeProvider } from '@/components/shared/theme-provider';

const vazir = Vazirmatn({ subsets: ['arabic', 'latin'] });

export const metadata: Metadata = {
  title: 'کارنکس | دستیار هوشمند کارآفرینی - 41123370',
  description: 'با هوش مصنوعی، ایده خود را در ۳۰ ثانیه به یک بیزینس تبدیل کنید. بوم کسب‌وکار، نقشه راه و استراتژی بازاریابی رایگان.',
  metadataBase: new URL('https://www.karnex.ir'),
  openGraph: {
    title: 'کارنکس | دستیار هوشمند کارآفرینی - 41123370',
    description: 'با هوش مصنوعی، ایده خود را به یک بیزینس تبدیل کنید.',
    url: 'https://www.karnex.ir',
    siteName: 'Karnex',
    images: ['/logo-light.png'],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'کارنکس | دستیار هوشمند کارآفرینی - 41123370',
    description: 'با هوش مصنوعی، ایده خود را به یک بیزینس تبدیل کنید.',
    images: ['/logo-light.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo-dark.png',
    apple: '/logo-dark.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className={`${vazir.className} theme-transition`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            <ProjectProvider>
              {children}
            </ProjectProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
