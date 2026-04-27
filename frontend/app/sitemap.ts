import { MetadataRoute } from 'next';

const API = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://dealnamaa.com';

async function fetchJson(path: string) {
  try {
    const res = await fetch(`${API}${path}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [countries, cities, retailers, offers] = await Promise.all([
    fetchJson('/api/countries'),
    fetchJson('/api/cities'),
    fetchJson('/api/retailers'),
    fetchJson('/api/offers'),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE}/privacy`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/terms`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.2 },
  ];

  const countryRoutes: MetadataRoute.Sitemap = countries.map((c: any) => ({
    url: `${SITE}/cities/${c.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const cityRoutes: MetadataRoute.Sitemap = cities.map((c: any) => ({
    url: `${SITE}/retailers/${c.id}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  const retailerRoutes: MetadataRoute.Sitemap = retailers.map((r: any) => ({
    url: `${SITE}/offers/${r.id}`,
    lastModified: new Date(r.updatedAt || new Date()),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));

  const offerRoutes: MetadataRoute.Sitemap = offers.map((o: any) => ({
    url: `${SITE}/view/${o.id}`,
    lastModified: new Date(o.updatedAt || new Date()),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...countryRoutes, ...cityRoutes, ...retailerRoutes, ...offerRoutes];
}
