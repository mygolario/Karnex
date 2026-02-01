import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ProjectProvider } from '@/contexts/project-context';
import { ThemeProvider } from '@/components/shared/theme-provider';
<<<<<<< HEAD
import { JsonLd } from '@/components/shared/json-ld';
=======
import { NetworkStatus } from '@/components/shared/network-status';
import { CookieBanner } from '@/components/shared/cookie-banner'; 
import { GoogleAnalytics } from '@/components/shared/analytics'; // Fixed Import
>>>>>>> Karnex-Completion

const vazir = Vazirmatn({ subsets: ['arabic', 'latin'] });

export const metadata: Metadata = {
<<<<<<< HEAD
  title: {
    default: 'کارنکس | دستیار هوشمند کارآفرینی',
    template: '%s | کارنکس',
  },
  description: 'با هوش مصنوعی، ایده خود را در ۳۰ ثانیه به یک بیزینس تبدیل کنید. بوم کسب‌وکار، نقشه راه و استراتژی بازاریابی رایگان.',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  keywords: [
    'کارآفرینی',
    'استارتاپ',
    'هوش مصنوعی',
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
=======
  title: 'کارنکس | هم‌بنیان‌گذار هوشمند استارتاپ‌ها، کسب‌وکارها و کریتورها',
  description: 'پلتفرم جامع برای راه‌اندازی استارتاپ، کسب‌وکار سنتی و برند شخصی. با Genesis Flow ایده خود را به واقعیت تبدیل کنید.',
>>>>>>> Karnex-Completion
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
<<<<<<< HEAD
    title: 'کارنکس | دستیار هوشمند کارآفرینی',
    description: 'با هوش مصنوعی، ایده خود را به یک بیزینس تبدیل کنید. بوم کسب‌وکار، نقشه راه و استراتژی بازاریابی رایگان.',
    url: 'https://www.karnex.ir',
    siteName: 'Karnex',
=======
    title: 'کارنکس | هم‌بنیان‌گذار هوشمند استارتاپ‌ها، کسب‌وکارها و کریتورها',
    description: 'ابزار تخصصی برای استارتاپ‌ها (Visionary)، کسب‌وکارهای سنتی (Owner) و کریتورها (Creator).',
    url: 'https://www.karnex.ir',
    siteName: 'Karnex',
    images: ['/logo-official.png'],
>>>>>>> Karnex-Completion
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
<<<<<<< HEAD
    title: 'کارنکس | دستیار هوشمند کارآفرینی',
    description: 'با هوش مصنوعی، ایده خود را به یک بیزینس تبدیل کنید.',
    creator: '@karnex_ir',
  },
  manifest: '/manifest.json',

  verification: {
    // Add your verification codes here when you have them
    // google: 'your-google-verification-code',
=======
    title: 'کارنکس | هم‌بنیان‌گذار هوشمند استارتاپ‌ها، کسب‌وکارها و کریتورها',
    description: 'ابزار تخصصی برای استارتاپ‌ها (Visionary)، کسب‌وکارهای سنتی (Owner) و کریتورها (Creator).',
    images: ['/logo-official.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo-official.png',
    apple: '/logo-official.png',
>>>>>>> Karnex-Completion
  },
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
          <AuthProvider>
             <GoogleAnalytics />
            <ProjectProvider>
              <NetworkStatus />
              {children}
              <CookieBanner />
            </ProjectProvider>
          </AuthProvider>
        </ThemeProvider>
        
        {/* JSON-LD for Google Knowledge Graph */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Karnex",
              "url": "https://www.karnex.ir",
              "logo": "https://www.karnex.ir/logo-official.png",
              "sameAs": [
                "https://twitter.com/karnex_ir",
                "https://instagram.com/karnex.ir",
                "https://linkedin.com/company/karnex"
              ],
              "description": "دستیار هوشمند کارآفرینی برای استارتاپ‌ها، کسب‌وکارهای سنتی و تولیدکنندگان محتوا."
            })
          }}
        />
      </body>
    </html>
  );
}
