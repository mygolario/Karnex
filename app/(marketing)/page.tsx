import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { HeroSection } from "@/components/marketing/hero-section";
import { JsonLd } from "@/components/shared/json-ld";
import { FAQ_ITEMS } from "@/lib/marketing/faq-data";

const HowItWorksSection = dynamic(
  () => import("@/components/marketing/how-it-works-section").then((m) => m.HowItWorksSection),
  { loading: () => <div className="min-h-[400px]" /> }
);
const ProductShowcase = dynamic(
  () => import("@/components/marketing/product-showcase").then((m) => m.ProductShowcase),
  { loading: () => <div className="min-h-[400px]" /> }
);
const PricingSection = dynamic(
  () => import("@/components/marketing/pricing-section").then((m) => m.PricingSection),
  { loading: () => <div className="min-h-[400px]" /> }
);
const FAQ = dynamic(() => import("@/components/marketing/faq").then((m) => m.FAQ), {
  loading: () => <div className="min-h-[300px]" />,
});
const TrustLinksSection = dynamic(
  () => import("@/components/marketing/trust-links-section").then((m) => m.TrustLinksSection),
  { loading: () => <div className="min-h-[150px]" /> }
);
const CTASection = dynamic(
  () => import("@/components/marketing/cta-section").then((m) => m.CTASection),
  { loading: () => <div className="min-h-[200px]" /> }
);

export const metadata: Metadata = {
  title: "کارنکس | هم‌بنیان‌گذار هوشمند استارتاپ",
  description:
    "کارنکس هم‌بنیان‌گذار هوشمند برای استارتاپ‌های ایرانی است. از ایده تا بوم کسب‌وکار، نقشه راه و پیچ‌دک — با هوش مصنوعی.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "کارنکس | هم‌بنیان‌گذار هوشمند استارتاپ",
    description:
      "ایده با تو، مسیرش با کارنکس. بوم، نقشه راه، پیچ‌دک و کوپایلوت برای بنیان‌گذاران ایرانی.",
    url: "https://www.karnex.ir",
    type: "website",
  },
};

export default function MarketingPage() {
  return (
    <div
      className="min-h-screen w-full bg-background overflow-x-hidden selection:bg-primary/20 font-sans"
      dir="rtl"
    >
      <JsonLd
        includeSoftware
        faqItems={FAQ_ITEMS.map((item) => ({ question: item.question, answer: item.answer }))}
      />
      <Navbar />

      <main id="main-content">
        <HeroSection />
        <HowItWorksSection />
        <ProductShowcase />
        <PricingSection />
        <FAQ />
        <TrustLinksSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
