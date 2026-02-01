import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth-context';
import { ProjectProvider } from '@/contexts/project-context';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { NetworkStatus } from '@/components/shared/network-status';
import { CookieBanner } from '@/components/shared/cookie-banner'; 
import { GoogleAnalytics } from '@/components/shared/analytics'; // Fixed Import

const vazir = Vazirmatn({ subsets: ['arabic', 'latin'] });

export const metadata: Metadata = {
  title: 'کارنکس | هم‌بنیان‌گذار هوشمند استارتاپ‌ها، کسب‌وکارها و کریتورها',
  description: 'پلتفرم جامع برای راه‌اندازی استارتاپ، کسب‌وکار سنتی و برند شخصی. با Genesis Flow ایده خود را به واقعیت تبدیل کنید.',
  metadataBase: new URL('https://www.karnex.ir'),
  openGraph: {
    title: 'کارنکس | هم‌بنیان‌گذار هوشمند استارتاپ‌ها، کسب‌وکارها و کریتورها',
    description: 'ابزار تخصصی برای استارتاپ‌ها (Visionary)، کسب‌وکارهای سنتی (Owner) و کریتورها (Creator).',
    url: 'https://www.karnex.ir',
    siteName: 'Karnex',
    images: ['/logo-official.png'],
    locale: 'fa_IR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'کارنکس | هم‌بنیان‌گذار هوشمند استارتاپ‌ها، کسب‌وکارها و کریتورها',
    description: 'ابزار تخصصی برای استارتاپ‌ها (Visionary)، کسب‌وکارهای سنتی (Owner) و کریتورها (Creator).',
    images: ['/logo-official.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/logo-official.png',
    apple: '/logo-official.png',
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
