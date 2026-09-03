import type {Metadata} from 'next';
import {fetchQuery} from 'convex/nextjs';
import {api} from '../../../../convex/_generated/api';
import {CanvasWorkspace} from '@/components/CanvasWorkspace';

type Params = {slug: string};

const siteUrl = 'https://canvas.n3wth.com';
const siteName = 'n3wth/canvas';

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const {slug} = await params;

  const meta = await fetchQuery(api.canvases.getMetaBySlug, {slug}).catch(
    () => null,
  );

  if (!meta) {
    return {
      title: `canvas / ${slug}`,
      robots: {index: false, follow: false},
    };
  }

  const title = meta.title || 'Untitled canvas';
  const description =
    meta.description || `Interactive ${meta.kind} canvas on ${siteName}`;
  const canonicalUrl = `${siteUrl}/c/${slug}`;
  const ogImageUrl = `${siteUrl}/api/og/${slug}`;

  const isPublic = meta.visibility === 'public';

  return {
    title,
    description,
    openGraph: {
      type: 'article',
      title,
      description,
      url: canonicalUrl,
      siteName,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      modifiedTime: new Date(meta.updatedAt).toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@olivernewth',
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: isPublic
      ? {index: true, follow: true}
      : {index: false, follow: false},
  };
}

function jsonLdWebPage(slug: string, title: string, description: string) {
  const url = `${siteUrl}/c/${slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': url,
    url,
    name: title,
    description,
    isPartOf: {
      '@type': 'WebSite',
      name: siteName,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'n3wth',
      url: 'https://n3wth.com',
      email: 'hey@n3wth.com',
    },
  };
}

export default async function CanvasPage({params}: {params: Promise<Params>}) {
  const {slug} = await params;

  const meta = await fetchQuery(api.canvases.getMetaBySlug, {slug}).catch(
    () => null,
  );

  const title = meta?.title || 'Untitled canvas';
  const description =
    meta?.description || `Interactive ${meta?.kind || 'html'} canvas`;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLdWebPage(slug, title, description)),
        }}
      />
      <CanvasWorkspace slug={slug} />
    </>
  );
}
