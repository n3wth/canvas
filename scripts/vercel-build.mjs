#!/usr/bin/env node
/**
 * Vercel build entry point.
 *
 * With CONVEX_DEPLOY_KEY set, `convex deploy` pushes the backend and hands the
 * resulting deployment URL to the Next build as NEXT_PUBLIC_CONVEX_URL, so the
 * frontend is always built against the backend it shipped with.
 *
 * Without the key, fall through to a plain build rather than failing. The app
 * renders a "no backend connected" page in that state, which is a more useful
 * outcome than a red deploy, and the next build picks the backend up
 * automatically once the key is added.
 */
import {spawnSync} from 'node:child_process';

const hasDeployKey = Boolean(process.env.CONVEX_DEPLOY_KEY);

const [command, args] = hasDeployKey
  ? ['npx', ['convex', 'deploy', '--cmd', 'npm run build']]
  : ['npm', ['run', 'build']];

if (!hasDeployKey) {
  console.warn(
    '\nCONVEX_DEPLOY_KEY is not set, so the Convex backend was not deployed.',
  );
  console.warn(
    'Add it in the Vercel project settings to build against a real deployment.',
  );
  console.warn('Building the frontend on its own for now.\n',
  );
}

const result = spawnSync(command, args, {stdio: 'inherit', shell: true});

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);
