import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/api/'], // Don't index private dashboard pages
    },
    sitemap: 'https://www.karnex.ir/sitemap.xml',
  };
}
