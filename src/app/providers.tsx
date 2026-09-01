'use client';

import {type ReactNode, useState} from 'react';
import NextLink from 'next/link';
import {ConvexProvider, ConvexReactClient} from 'convex/react';
import {Theme} from '@astryxdesign/core/theme';
import {LinkProvider} from '@astryxdesign/core/Link';
import {n3wthTheme} from '@/theme/n3wth';
import {BackendNotice} from '@/components/BackendNotice';

// Inlined at build time. Absent on a deploy that has not been pointed at a
// Convex deployment yet.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export function Providers({children}: {children: ReactNode}) {
  // Constructing the client eagerly would throw while prerendering when the
  // URL is missing, taking the whole build down over one unset variable.
  const [convex] = useState(() =>
    convexUrl ? new ConvexReactClient(convexUrl) : null,
  );

  return (
    <LinkProvider component={NextLink}>
      <Theme theme={n3wthTheme} mode="dark">
        {convex ? (
          <ConvexProvider client={convex}>{children}</ConvexProvider>
        ) : (
          <BackendNotice />
        )}
      </Theme>
    </LinkProvider>
  );
}
