'use client';

import posthog from 'posthog-js';
import {PostHogProvider as PHProvider} from 'posthog-js/react';
import {useEffect, type ReactNode} from 'react';

const POSTHOG_KEY = 'phc_q39ZGuvXLQuwCgCkHZYAeaUlWm5bIhx2XKMCtTdhJ7o';
const POSTHOG_HOST = 'https://elephant.n3wth.com';
const POSTHOG_UI_HOST = 'https://us.i.posthog.com';

export function PostHogProvider({children}: {children: ReactNode}) {
  useEffect(() => {
    if (typeof window !== 'undefined' && !posthog.__loaded) {
      posthog.init(POSTHOG_KEY, {
        api_host: POSTHOG_HOST,
        ui_host: POSTHOG_UI_HOST,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        capture_performance: {web_vitals: true},
        disable_web_experiments: false,
      });
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
