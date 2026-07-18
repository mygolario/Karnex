import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قیمت‌گذاری",
  description:
    "پلن‌های کارنکس را مقایسه کنید. از پلن رایگان تا اولترا — برای هر مرحله از کسب‌وکار شما.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "قیمت‌گذاری کارنکس",
    description: "پلن رایگان، پلاس، پرو و اولترا. بدون نیاز به کارت اعتباری برای شروع.",
    url: "https://www.karnex.ir/pricing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "قیمت‌گذاری کارنکس",
    description: "پلن رایگان، پلاس، پرو و اولترا.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
