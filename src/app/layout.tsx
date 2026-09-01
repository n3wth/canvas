import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
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

export const metadata: Metadata = {
  title: 'n3wth/canvas',
  description: 'Make a tool, share the URL.',
  metadataBase: new URL('https://canvas.n3wth.com'),
  authors: [{name: 'Oliver Newth', url: 'https://n3wth.com'}],
  openGraph: {
    title: 'n3wth/canvas',
    description: 'Make a tool, share the URL.',
    url: 'https://canvas.n3wth.com',
    siteName: 'n3wth/canvas',
  },
  other: {
    'theme-color': '#08090b',
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
      </head>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
