import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "نسخه موبایل",
  description:
    "کارنکس را روی موبایل نصب کنید. دسترسی سریع به نقشه راه، دستیار هوشمند و بوم کسب‌وکار.",
  alternates: { canonical: "/mobile-app" },
  openGraph: {
    title: "نسخه موبایل کارنکس",
    description: "نصب PWA کارنکس روی iOS و Android برای دسترسی آفلاین و سریع.",
    url: "https://www.karnex.ir/mobile-app",
    type: "website",
  },
};

export default function MobileAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
