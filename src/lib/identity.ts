'use client';

import {useEffect, useMemo, useSyncExternalStore} from 'react';

const STORAGE_KEY = 'canvas.viewer';

const ANIMALS = [
  'otter',
  'heron',
  'lynx',
  'marten',
  'ibis',
  'tapir',
  'shrike',
  'vole',
  'gannet',
  'civet',
];

export type Viewer = {id: string; name: string};

/**
 * Identity for one browser tab.
 *
 * Deliberately sessionStorage, not localStorage: localStorage is shared across
 * tabs on the same origin, which would make two tabs of one canvas look like a
 * single viewer and break the check that tells a remote edit from this tab's
 * own write echoing back through the subscription.
 *
 * Read through useSyncExternalStore so the snapshot stays a pure read and the
 * server renders the same empty state the client hydrates with.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readStored(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function readServer(): null {
  return null;
}

function parse(raw: string | null): Viewer | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<Viewer>;
    if (typeof parsed.id === 'string' && typeof parsed.name === 'string') {
      return {id: parsed.id, name: parsed.name};
    }
  } catch {
    // Corrupt entry; the caller mints a replacement.
  }
  return null;
}

/** Writes to the store and notifies subscribers. Never touches React state. */
function ensureStored(): void {
  if (parse(readStored()) !== null) return;

  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  const name = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({id, name}));
  } catch {
    return;
  }
  for (const listener of listeners) listener();
}

/** Returns null until the tab's identity has been read or minted. */
export function useViewer(): Viewer | null {
  const raw = useSyncExternalStore(subscribe, readStored, readServer);

  useEffect(ensureStored, []);

  return useMemo(() => parse(raw), [raw]);
}
