
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { HeroSection } from "@/components/marketing/hero-section";
import { StatsBar } from "@/components/marketing/stats-bar";
import { PillarsSection } from "@/components/marketing/pillars-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";
import { Testimonials } from "@/components/marketing/testimonials";
import { PricingSection } from "@/components/marketing/pricing-section";
import { FAQ } from "@/components/marketing/faq";
import { CTASection } from "@/components/marketing/cta-section";

export default function MarketingPage() {
  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden selection:bg-primary/20 font-sans" dir="rtl">
      {/* Navigation */}
      <Navbar />

      <main>
        {/* 1. Hero — Split layout, dual CTA, dashboard mockup, trust avatars */}
        <HeroSection />

        {/* 2. Stats Bar — Animated counters */}
        <StatsBar />

        {/* 3. Pillars — Interactive tabbed selector for startup/traditional/creator */}
        <PillarsSection />

        {/* 4. Features — True bento grid with varying sizes */}
        <FeaturesSection />

        {/* 5. Product Showcase — Dashboard preview with hotspots */}
        <ProductShowcase />

        {/* 6. How It Works — 4 steps with visual demos */}
        <HowItWorksSection />

        {/* 7. Testimonials — Marquee carousel */}
        <Testimonials />

        {/* 8. Pricing — Plans + trust signals */}
        <PricingSection />

        {/* 9. FAQ — Expanded accordion + bottom CTA */}
        <FAQ />

        {/* 10. Final CTA — Risk reversals + dual CTA */}
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
