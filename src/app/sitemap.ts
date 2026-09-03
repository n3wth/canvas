import type {MetadataRoute} from 'next';
import {fetchQuery} from 'convex/nextjs';
import {api} from '../../convex/_generated/api';

const baseUrl = 'https://canvas.n3wth.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  try {
    const publicCanvases = await fetchQuery(api.canvases.listPublic, {});

    const canvasPages: MetadataRoute.Sitemap = publicCanvases.map((canvas) => ({
      url: `${baseUrl}/c/${canvas.slug}`,
      lastModified: new Date(canvas.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...canvasPages];
  } catch {
    return staticPages;
  }
}
