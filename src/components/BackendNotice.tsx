'use client';

import type {CSSProperties} from 'react';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Text} from '@astryxdesign/core/Text';
import {VStack} from '@astryxdesign/core/Layout';

const pageStyle: CSSProperties = {height: '100dvh'};

/**
 * Shown when the app is built without NEXT_PUBLIC_CONVEX_URL. Every canvas
 * lives in Convex, so there is nothing to render without it — but a deploy
 * that is merely missing a variable should say so, not fail the build with a
 * prerender crash.
 */
export function BackendNotice() {
  return (
    <VStack style={pageStyle} hAlign="center" vAlign="center" gap={4} padding={8}>
      <EmptyState
        headingLevel={1}
        title="No backend connected"
        description="This build has no NEXT_PUBLIC_CONVEX_URL, so there is no canvas store to read. Deploy Convex and rebuild."
      />
      <Text type="supporting">
        npx convex deploy --cmd &apos;npm run build&apos;
      </Text>
    </VStack>
  );
}
