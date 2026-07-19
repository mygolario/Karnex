import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قیمت‌گذاری",
  description:
    "پلن‌های کارنکس را مقایسه کنید. رایگان، پرو و تیم — برای هر مرحله از مسیر استارتاپ شما.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "قیمت‌گذاری کارنکس",
    description: "پلن رایگان، پرو و تیم. بدون نیاز به کارت اعتباری برای شروع.",
    url: "https://www.karnex.ir/pricing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "قیمت‌گذاری کارنکس",
    description: "پلن رایگان، پرو و تیم.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
