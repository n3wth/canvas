'use client';

import {type ReactNode, useState} from 'react';
import NextLink from 'next/link';
import {ConvexProvider, ConvexReactClient} from 'convex/react';
import {Theme} from '@astryxdesign/core/theme';
import {LinkProvider} from '@astryxdesign/core/Link';
import {n3wthTheme} from '@/theme/n3wth';

export function Providers({children}: {children: ReactNode}) {
  const [convex] = useState(
    () => new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!),
  );

  return (
    <ConvexProvider client={convex}>
      <LinkProvider component={NextLink}>
        <Theme theme={n3wthTheme} mode="dark">
          {children}
        </Theme>
      </LinkProvider>
    </ConvexProvider>
  );
}
