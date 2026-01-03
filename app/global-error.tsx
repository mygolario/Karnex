"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to Sentry
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backgroundColor: '#f9fafb',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{
            maxWidth: '400px',
            width: '100%',
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#fef2f2',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
            }}>
              <AlertTriangle style={{ width: '32px', height: '32px', color: '#dc2626' }} />
            </div>
            
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: '#111827',
              marginBottom: '0.5rem',
            }}>
              Critical Error
            </h1>
            
            <p style={{
              color: '#6b7280',
              marginBottom: '1.5rem',
            }}>
              Something went wrong at the application level. Please try refreshing the page.
            </p>
            
            {error.digest && (
              <p style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                marginBottom: '1rem',
                fontFamily: 'monospace',
              }}>
                Error ID: {error.digest}
              </p>
            )}
            
            <button
              onClick={reset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <RefreshCw style={{ width: '16px', height: '16px' }} />
              Try Again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
