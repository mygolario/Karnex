import { getSiteUrl } from "@/lib/site-url";

const SITE_URL = getSiteUrl();

const SOCIAL_URLS = [
  "https://instagram.com/karnex.ir",
  "https://youtube.com/@karnex",
  "https://twitter.com/karnex_ir",
  "https://linkedin.com/company/karnex",
];

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "کارنکس",
  alternateName: "Karnex",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-light.png`,
  description: "هم‌بنیان‌گذار هوشمند برای استارتاپ‌های ایرانی — از ایده تا بوم، نقشه راه و پیچ‌دک",
  sameAs: SOCIAL_URLS,
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Persian", "English"],
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "کارنکس",
  alternateName: "Karnex",
  url: SITE_URL,
  inLanguage: "fa-IR",
  description: "هم‌بنیان‌گذار هوشمند برای استارتاپ‌های ایرانی",
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "کارنکس",
  alternateName: "Karnex",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "IRR",
    description: "شروع رایگان",
  },
  description: "هم‌بنیان‌گذار هوشمند برای استارتاپ‌های ایرانی با بوم، نقشه راه و پیچ‌دک",
};

type JsonLdProps = {
  includeSoftware?: boolean;
  faqItems?: { question: string; answer: string }[];
};

function JsonLdScript({ id, data }: { id: string; data: object }) {
  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function JsonLd({ includeSoftware = false, faqItems }: JsonLdProps) {
  const faqSchema = faqItems?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  return (
    <>
      <JsonLdScript id="organization-schema" data={organizationSchema} />
      <JsonLdScript id="website-schema" data={websiteSchema} />
      {includeSoftware && <JsonLdScript id="software-schema" data={softwareSchema} />}
      {faqSchema && <JsonLdScript id="faq-schema" data={faqSchema} />}
    </>
  );
}
