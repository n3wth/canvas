'use client';

import type {ReactNode} from 'react';
import {Link} from '@astryxdesign/core/Link';
import {HStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

type IslandNavProps = {
  /** Optional product controls on the right of the island (workspace actions). */
  endContent?: ReactNode;
  /** Optional title shown after the brand, for the canvas workspace. */
  title?: string;
  /** Optional badge or meta next to the title. */
  titleMeta?: ReactNode;
};

/**
 * Floating island navbar shared across the n3wth family (n3wth.com, garden).
 * Not Astryx TopNav — that is a full-bleed app chrome. The island is the
 * public product mark: centered glass pill, n3wth/{product} brand, quiet.
 */
export function IslandNav({endContent, title, titleMeta}: IslandNavProps) {
  return (
    <header className="site-nav" aria-label="Site">
      <HStack className="nav-island" gap={2} vAlign="center">
        <Link href="/" color="primary" isStandalone weight="semibold" className="nav-brand">
          n3wth
          <Text as="span" color="disabled" weight="semibold">
            /
          </Text>
          canvas
        </Link>

        {title ? (
          <HStack gap={2} vAlign="center" className="nav-island-title">
            <Text color="secondary" weight="medium" maxLines={1}>
              {title}
            </Text>
            {titleMeta}
          </HStack>
        ) : (
          <nav aria-label="Main" className="nav-island-links">
            <Link
              href="mailto:hey@n3wth.com"
              color="secondary"
              isStandalone
              weight="medium"
              className="nav-link"
            >
              Contact
            </Link>
          </nav>
        )}

        {endContent ? (
          <HStack gap={3} vAlign="center" className="nav-island-end">
            {endContent}
          </HStack>
        ) : null}
      </HStack>
    </header>
  );
}
