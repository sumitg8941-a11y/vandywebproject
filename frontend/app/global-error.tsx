'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html>
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '2rem', maxWidth: '400px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.75rem', color: '#111827' }}>Something went wrong</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            A critical error occurred. We've been notified and are working on it.
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => reset()}
              style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{ background: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
