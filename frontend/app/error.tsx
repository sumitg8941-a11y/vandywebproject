'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="text-8xl mb-4">⚠️</div>
          <h1 className="text-3xl font-black text-gray-900 mb-3">Something Went Wrong</h1>
          <p className="text-gray-600 mb-6">
            We encountered an unexpected error. Don't worry, your data is safe.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className="text-left bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <summary className="cursor-pointer font-semibold text-red-700 mb-2">
                Error Details (Dev Only)
              </summary>
              <pre className="text-xs text-red-600 overflow-auto">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition"
          >
            <i className="fa-solid fa-rotate-right"></i> Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-700 transition"
          >
            <i className="fa-solid fa-house"></i> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
