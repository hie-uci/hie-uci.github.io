import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hie.eng.uci.edu';

  // Define all your main routes here
  const routes = [
    '',
    '/research',
    '/research-projects',
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
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));
}
