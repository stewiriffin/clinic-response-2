'use client'

import { ErrorBoundary } from './ErrorBoundary'
import { ReactNode } from 'react'

/**
 * Global error boundary wrapper for the entire application
 * Place this in your root layout
 */
export function GlobalErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Additional global error handling
        // Could send to analytics, Sentry, etc.
        if (process.env.NODE_ENV === 'production') {
          // TODO: Send to error monitoring service
          console.error('Global error caught:', error, errorInfo)
        }
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
