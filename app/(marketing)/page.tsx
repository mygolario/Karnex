"use client";

import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { HeroSection } from "@/components/marketing/hero-section";
import { FeaturesSection } from "@/components/marketing/features-section";
import { HowItWorksSection } from "@/components/marketing/how-it-works-section";

import { PricingSection } from "@/components/marketing/pricing-section";
import { FAQ } from "@/components/marketing/faq";
import { CTASection } from "@/components/marketing/cta-section";

export default function MarketingPage() {
  return (
    <div className="min-h-screen w-full bg-background overflow-x-hidden selection:bg-primary/20 font-sans" dir="rtl">
      {/* Navigation */}
      <Navbar />

      <main>
        {/* Hero - Animated mesh gradients, tagline, Three Pillars preview */}
        <HeroSection />

        {/* Features - Bento Grid layout with hover effects */}
        <FeaturesSection />

        {/* How It Works - 4 steps with connector lines */}
        <HowItWorksSection />



        {/* Pricing - 4 plans with monthly/yearly toggle */}
        <PricingSection />

        {/* FAQ - Accordion style */}
        <FAQ />

        {/* CTA - Premium black section with gradients */}
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
