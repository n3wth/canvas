import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import {GoogleAnalytics} from '@next/third-parties/google';
import {Providers} from './providers';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

const siteUrl = 'https://canvas.n3wth.com';
const siteName = 'n3wth/canvas';
const siteDescription =
  'Make a tool, share the URL. Create interactive HTML, React, and markdown canvases that update live.';

export const metadata: Metadata = {
  title: {
    default: siteName,
    template: `%s — ${siteName}`,
  },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  authors: [{name: 'Oliver Newth', url: 'https://n3wth.com'}],
  creator: 'Oliver Newth',
  publisher: 'n3wth',
  keywords: [
    'canvas',
    'code editor',
    'live preview',
    'HTML',
    'React',
    'markdown',
    'interactive',
    'share',
    'tool builder',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: siteName,
    description: siteDescription,
    url: siteUrl,
    siteName,
    images: [
      {
        url: `${siteUrl}/api/og`,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: [`${siteUrl}/api/og`],
    creator: '@olivernewth',
  },
  alternates: {
    canonical: siteUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  author: {
    '@type': 'Person',
    name: 'Oliver Newth',
    url: 'https://n3wth.com',
  },
  publisher: {
    '@type': 'Organization',
    name: 'n3wth',
    url: 'https://n3wth.com',
    email: 'hey@n3wth.com',
  },
};

export default function RootLayout({
  children,
}: Readonly<{children: React.ReactNode}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#08090b" />
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f%5B%5D=satoshi@400,500,700,900&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{__html: JSON.stringify(jsonLdWebSite)}}
        />
      </head>
      <GoogleAnalytics gaId="G-4QRMSG5HXK" />
      <body>
        <a
          href="#main"
          className="skip-link"
          data-nosnippet=""
          tabIndex={0}
        >
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
