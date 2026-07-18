import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قوانین استفاده",
  description: "شرایط و قوانین استفاده از پلتفرم کارنکس.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "قوانین استفاده | کارنکس",
    url: "https://www.karnex.ir/terms",
    type: "website",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
