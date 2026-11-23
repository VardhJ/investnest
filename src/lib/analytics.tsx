'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
const POSTHOG_HOST = 'https://us.i.posthog.com';

let initialized = false;

export function initPostHog() {
  if (typeof window === 'undefined' || initialized || !POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
  });
  initialized = true;
}

export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return;
  posthog.capture(event, properties);
}

export function identifyUser(userId: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined' || !POSTHOG_KEY) return;
  posthog.identify(userId, properties);
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return <>{children}</>;
}