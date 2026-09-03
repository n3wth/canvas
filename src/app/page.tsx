import {CanvasIndex} from '@/components/CanvasIndex';

const siteUrl = 'https://canvas.n3wth.com';
const siteName = 'n3wth/canvas';
const siteDescription =
  'Make a tool, share the URL. Create interactive HTML, React, and markdown canvases that update live.';

const jsonLdWebPage = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': siteUrl,
  url: siteUrl,
  name: siteName,
  description: siteDescription,
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
  mainEntity: {
    '@type': 'SoftwareApplication',
    name: siteName,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    description: siteDescription,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLdWebPage)}}
      />
      <CanvasIndex />
    </>
  );
}
