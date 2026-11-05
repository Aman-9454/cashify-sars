import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://casmik-one.vercel.app';
  const lastModified = new Date();

  const routes = [
    '',
    '/how-it-works',
    '/why-camsik',
    '/faq',
    '/contact-us',
    '/buy-refurbished',
    '/exchange-device',
    '/repair-device',
    '/track-order',
    '/privacy',
    '/terms',
    '/disclaimer',
    '/sitemap',
    '/login',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.startsWith('/privacy') || route.startsWith('/terms') ? 0.5 : 0.8,
  }));
}
