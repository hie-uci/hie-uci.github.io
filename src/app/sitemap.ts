import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hie.eng.uci.edu';

  const routes = [
    '',
    '/research',
    '/publications',
    '/team',
    '/chip-gallery',
    '/news',
    '/teaching',
    '/rf-toolbox',
    '/measurement-tutorial',
    '/contact',
    '/available-positions',
  ];

  return routes.map((route) => ({
    url: route === '' ? baseUrl : `${baseUrl}${route}/`,
    changeFrequency:
      route === '' || route === '/news' || route === '/publications'
        ? 'monthly' as const
        : 'yearly' as const,
    priority: route === '' ? 1 : route === '/research' || route === '/publications' ? 0.9 : 0.7,
  }));
}
