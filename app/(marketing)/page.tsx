import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { HeroSection } from "@/components/marketing/hero-section";
import { JsonLd } from "@/components/shared/json-ld";
import { FAQ_ITEMS } from "@/lib/marketing/faq-data";

const StatsBar = dynamic(
  () => import("@/components/marketing/stats-bar").then((m) => m.StatsBar),
  { loading: () => <div className="min-h-[100px]" /> }
);
const PillarsSection = dynamic(
  () => import("@/components/marketing/pillars-section").then((m) => m.PillarsSection),
  { loading: () => <div className="min-h-[400px]" /> }
);
const FeaturesSection = dynamic(
  () => import("@/components/marketing/features-section").then((m) => m.FeaturesSection),
  { loading: () => <div className="min-h-[400px]" /> }
);

const ProductShowcase = dynamic(
  () => import("@/components/marketing/product-showcase").then((m) => m.ProductShowcase),
  { loading: () => <div className="min-h-[400px]" /> }
);
const HowItWorksSection = dynamic(
  () => import("@/components/marketing/how-it-works-section").then((m) => m.HowItWorksSection),
  { loading: () => <div className="min-h-[400px]" /> }
);
const Testimonials = dynamic(
  () => import("@/components/marketing/testimonials").then((m) => m.Testimonials),
  { loading: () => <div className="min-h-[300px]" /> }
);
const PricingSection = dynamic(
  () => import("@/components/marketing/pricing-section").then((m) => m.PricingSection),
  { loading: () => <div className="min-h-[400px]" /> }
);
const FAQ = dynamic(() => import("@/components/marketing/faq").then((m) => m.FAQ), {
  loading: () => <div className="min-h-[300px]" />,
});
const CTASection = dynamic(
  () => import("@/components/marketing/cta-section").then((m) => m.CTASection),
  { loading: () => <div className="min-h-[200px]" /> }
);

export const metadata: Metadata = {
  title: "کارنکس | دستیار هوشمند کارآفرینی",
  description:
    "با دستیار کارنکس، ایده خود را در ۳۰ ثانیه به یک بیزینس تبدیل کنید. بوم کسب‌وکار، نقشه راه و استراتژی بازاریابی رایگان.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "کارنکس | دستیار هوشمند کارآفرینی",
    description:
      "با دستیار کارنکس، ایده خود را به یک بیزینس تبدیل کنید. بوم کسب‌وکار، نقشه راه و استراتژی بازاریابی رایگان.",
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
        <StatsBar />
        <PillarsSection />
        <FeaturesSection />
        <ProductShowcase />
        <HowItWorksSection />
        <Testimonials />
        <PricingSection />
        <FAQ />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
