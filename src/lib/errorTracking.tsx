'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

export function initErrorTracking() {
  if (typeof window === 'undefined') return;

  // Global error handler
  window.addEventListener('error', (event) => {
    posthog.capture('$exception', {
      $exception_list: [
        {
          type: event.error?.name || 'Error',
          value: event.error?.message || event.message,
          mechanism: { handled: false, type: 'onerror' },
          stacktrace: {
            frames: event.error?.stack?.split('\n').map((line: string) => ({ filename: line })) || [],
          },
        },
      ],
      $exception_source: 'window.onerror',
    });
  });

  // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    posthog.capture('$exception', {
      $exception_list: [
        {
          type: event.reason?.name || 'UnhandledPromiseRejection',
          value: event.reason?.message || String(event.reason),
          mechanism: { handled: false, type: 'unhandledrejection' },
          stacktrace: {
            frames: event.reason?.stack?.split('\n').map((line: string) => ({ filename: line })) || [],
          },
        },
      ],
      $exception_source: 'unhandledrejection',
    });
  });
}

export function captureError(error: Error, context?: Record<string, any>) {
  if (typeof window === 'undefined') return;
  posthog.capture('$exception', {
    $exception_list: [
      {
        type: error.name,
        value: error.message,
        mechanism: { handled: true, type: 'manual' },
        stacktrace: {
          frames: error.stack?.split('\n').map((line: string) => ({ filename: line })) || [],
        },
      },
    ],
    ...context,
  });
}