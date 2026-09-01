#!/usr/bin/env node
/**
 * Vercel build entry point.
 *
 * With CONVEX_DEPLOY_KEY set, `convex deploy` pushes the backend and hands the
 * resulting deployment URL to the Next build as NEXT_PUBLIC_CONVEX_URL, so the
 * frontend is always built against the backend it shipped with. A preview key
 * targets a preview deployment named after the current branch, which the Convex
 * CLI reads from Vercel's own environment.
 *
 * Without the key, fall through to a plain build rather than failing. The app
 * renders a "no backend connected" page in that state, which is a more useful
 * outcome than a red deploy, and the next build picks the backend up
 * automatically once the key is added.
 */
import {spawnSync} from 'node:child_process';

const hasDeployKey = Boolean(process.env.CONVEX_DEPLOY_KEY);

// One shell string rather than an argv array: the quotes around the --cmd
// value have to survive into the shell, which they do not if an array is
// joined by spawnSync({shell: true}).
const command = hasDeployKey
  ? "npx convex deploy --cmd 'npm run build' --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL"
  : 'npm run build';

if (hasDeployKey) {
  console.log(`\nDeploying Convex, then building:\n  ${command}\n`);
} else {
  console.warn(
    '\nCONVEX_DEPLOY_KEY is not set, so the Convex backend was not deployed.',
  );
  console.warn(
    'Add it in the Vercel project settings to build against a real deployment.',
  );
  console.warn('Building the frontend on its own for now.\n');
}

const result = spawnSync(command, {stdio: 'inherit', shell: true});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
