'use client';

import Script from 'next/script';

// Organization structured data for Karnex
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'کارنکس',
  alternateName: 'Karnex',
  url: 'https://www.karnex.ir',
  logo: 'https://www.karnex.ir/logo-light.png',
  description: 'دستیار هوشمند کارآفرینی - با هوش مصنوعی ایده خود را به کسب‌وکار تبدیل کنید',
  sameAs: [],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    availableLanguage: ['Persian', 'English'],
  },
};

// WebSite schema for search features
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'کارنکس',
  alternateName: 'Karnex',
  url: 'https://www.karnex.ir',
  inLanguage: 'fa-IR',
  description: 'با هوش مصنوعی، ایده خود را در ۳۰ ثانیه به یک بیزینس تبدیل کنید',
};

// SoftwareApplication schema for the SaaS platform
const softwareSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'کارنکس',
  alternateName: 'Karnex',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'IRR',
    description: 'شروع رایگان',
  },
  description: 'دستیار هوشمند راه‌اندازی کسب‌وکار با هوش مصنوعی',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '500',
    bestRating: '5',
    worstRating: '1',
  },
};

export function JsonLd() {
  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <Script
        id="software-schema"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema),
        }}
      />
    </>
  );
}
