import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: "سیاست حریم خصوصی کارنکس — نحوه جمع‌آوری، استفاده و محافظت از داده‌های شما.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "حریم خصوصی | کارنکس",
    url: "https://www.karnex.ir/privacy",
    type: "website",
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
