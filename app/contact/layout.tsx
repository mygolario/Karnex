import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "تماس با ما",
  description:
    "با تیم پشتیبانی کارنکس در تماس باشید. ارسال تیکت، ایمیل پشتیبانی و ثبت بازخورد.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "تماس با تیم کارنکس",
    description: "سوالات، پیشنهادات و مشکلات خود را با تیم کارنکس در میان بگذارید.",
    url: "https://www.karnex.ir/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "تماس با تیم کارنکس",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
