/** Map business category slugs / free-text hints to Overpass OSM queries */

export interface OsmCategoryQuery {
  tags: string[];
  defaultRadius: number;
}

const CATEGORY_MAP: Record<string, OsmCategoryQuery> = {
  cafe: { tags: ['amenity="cafe"'], defaultRadius: 500 },
  restaurant: { tags: ['amenity="restaurant"', 'amenity="fast_food"'], defaultRadius: 600 },
  bakery: { tags: ['shop="bakery"', 'craft="bakery"'], defaultRadius: 500 },
  clothing: { tags: ['shop="clothes"', 'shop="boutique"'], defaultRadius: 700 },
  electronics: { tags: ['shop="electronics"', 'shop="mobile_phone"'], defaultRadius: 800 },
  pharmacy: { tags: ['amenity="pharmacy"'], defaultRadius: 800 },
  salon: { tags: ['shop="hairdresser"', 'shop="beauty"'], defaultRadius: 600 },
  clinic: { tags: ['amenity="clinic"', 'amenity="doctors"'], defaultRadius: 1000 },
  gym: { tags: ['leisure="fitness_centre"', 'leisure="sports_centre"'], defaultRadius: 800 },
  grocery: { tags: ['shop="supermarket"', 'shop="convenience"'], defaultRadius: 600 },
  bookstore: { tags: ['shop="books"'], defaultRadius: 800 },
  jewelry: { tags: ['shop="jewelry"', 'shop="watches"'], defaultRadius: 700 },
  other: { tags: ['shop', 'amenity'], defaultRadius: 500 },
};

const KEYWORD_HINTS: Array<{ pattern: RegExp; slug: string }> = [
  { pattern: /کافه|coffee|cafe/i, slug: "cafe" },
  { pattern: /رستوران|فست.?فود|restaurant|food/i, slug: "restaurant" },
  { pattern: /نان|شیرینی|bakery/i, slug: "bakery" },
  { pattern: /پوشاک|لباس|cloth|fashion/i, slug: "clothing" },
  { pattern: /موبایل|الکترونیک|electronics/i, slug: "electronics" },
  { pattern: /دارو|pharmacy/i, slug: "pharmacy" },
  { pattern: /آرایش|سالن|salon|beauty/i, slug: "salon" },
  { pattern: /کلینیک|مطب|clinic|doctor/i, slug: "clinic" },
  { pattern: /باشگاه|ورزش|gym|fitness/i, slug: "gym" },
  { pattern: /سوپر|مواد.?غذایی|grocery|supermarket/i, slug: "grocery" },
  { pattern: /کتاب|book/i, slug: "bookstore" },
  { pattern: /جواهر|jewelry/i, slug: "jewelry" },
];

export function inferCategoryFromText(
  businessDescription: string,
  categorySlug?: string
): string {
  if (categorySlug && CATEGORY_MAP[categorySlug]) return categorySlug;
  for (const { pattern, slug } of KEYWORD_HINTS) {
    if (pattern.test(businessDescription)) return slug;
  }
  return categorySlug || "other";
}

export function getOsmQueryForCategory(slug: string): OsmCategoryQuery {
  return CATEGORY_MAP[slug] || CATEGORY_MAP.other;
}

export function buildOverpassCompetitorQuery(
  lat: number,
  lon: number,
  radius: number,
  categorySlug: string
): string {
  const { tags } = getOsmQueryForCategory(categorySlug);
  const filters = tags
    .map((tag) => {
      if (tag.includes("=")) {
        const [k, v] = tag.split("=");
        return `node[${k}=${v}](around:${radius},${lat},${lon});`;
      }
      return `node[${tag}](around:${radius},${lat},${lon});`;
    })
    .join("");
  return `[out:json][timeout:25];(${filters});out center;`;
}

export function suggestRadius(categorySlug: string): number {
  return getOsmQueryForCategory(categorySlug).defaultRadius;
}
