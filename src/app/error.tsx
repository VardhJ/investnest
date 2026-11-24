'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="text-gray-600 mb-6">
          We're sorry, an unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Try Again
        </button>
        <div className="mt-4">
          <a href="/" className="text-blue-600 hover:underline text-sm">
            ← Go to Home
          </a>
        </div>
      </div>
    </div>
  );
}