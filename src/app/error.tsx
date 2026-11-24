'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { captureError } from '@/lib/errorTracking';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
    captureError(error, { source: 'error_boundary', digest: error.digest });
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-16 px-4">
      <div className="text-center max-w-md mx-auto bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Service Temporarily Unavailable</h1>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          An unexpected exception occurred while retrieving financial or auction records. Please retry or return to discovery home.
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Retry Request
          </button>
          <Link
            href="/"
            className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
