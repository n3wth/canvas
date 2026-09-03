import type {SVGProps} from 'react';

/** Quiet link glyph for copying the share URL. */
export function LinkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6.4 8.9a3.2 3.2 0 0 0 4.55.35l1.5-1.5a3.2 3.2 0 0 0-4.53-4.53L7.2 3.95"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.6 7.1a3.2 3.2 0 0 0-4.55-.35l-1.5 1.5a3.2 3.2 0 0 0 4.53 4.53L8.8 12.05"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Quiet brackets glyph for toggling source. */
export function SourceIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M5.2 4.5 2.5 8l2.7 3.5M10.8 4.5 13.5 8l-2.7 3.5M9 3.5 7 12.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Quiet plug glyph for connecting agents and humans. */
export function ConnectIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M6.5 3.5v3M9.5 3.5v3M5 6.5h6v1.2a3 3 0 0 1-1.2 2.4v2.4H7.2v-2.4A3 3 0 0 1 6 7.7V6.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 3.5h10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
