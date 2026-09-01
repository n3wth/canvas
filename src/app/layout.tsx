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
  title: 'canvas',
  description:
    'Live canvases. Write source, get a running preview, share the URL — every view stays in sync.',
  metadataBase: new URL('https://canvas.n3wth.com'),
  openGraph: {
    title: 'canvas',
    description:
      'Live canvases. Write source, get a running preview, share the URL — every view stays in sync.',
    url: 'https://canvas.n3wth.com',
    siteName: 'canvas',
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
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f%5B%5D=satoshi@400,500,700,900&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
