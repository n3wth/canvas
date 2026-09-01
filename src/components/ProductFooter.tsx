'use client';

import {Link} from '@astryxdesign/core/Link';
import {HStack, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';

const links = [
  {label: 'Contact', href: 'mailto:hey@n3wth.com'},
  {label: 'n3wth.com', href: 'https://n3wth.com'},
  {label: 'garden', href: 'https://garden.n3wth.com'},
  {label: 'kit', href: 'https://kit.n3wth.com'},
  {label: 'skills', href: 'https://skills.n3wth.com'},
  {label: 'r3', href: 'https://r3.n3wth.com'},
] as const;

/**
 * Quiet product footer — one copyright line and a short family strip.
 * Matches garden/n3wth.com: no sitemap columns, no marketing blocks.
 */
export function ProductFooter() {
  return (
    <VStack as="footer" className="product-footer" gap={0}>
      <HStack
        className="product-footer-inner"
        gap={6}
        vAlign="center"
        hAlign="between"
        wrap="wrap"
      >
        <Text type="supporting" color="secondary">
          © 2026 Oliver Newth
        </Text>
        <nav aria-label="Footer">
          <HStack
            gap={5}
            vAlign="center"
            wrap="wrap"
            as="ul"
            className="product-footer-links"
          >
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  color="secondary"
                  isStandalone
                  weight="normal"
                  size="sm"
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={
                    link.href.startsWith('http')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </HStack>
        </nav>
      </HStack>
    </VStack>
  );
}
