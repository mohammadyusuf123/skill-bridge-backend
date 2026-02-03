'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[v0] Error occurred:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-input px-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-6xl font-bold text-destructive">⚠️</div>
        <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
        <p className="text-muted">{error.message || 'An unexpected error occurred'}</p>
        <div className="flex gap-3 justify-center pt-4">
          <button onClick={reset} className="btn-primary">
            Try Again
          </button>
          <a href="/dashboard" className="btn-secondary">
            Go Home
          </a>
        </div>
      </div>
    </div>
  )
}
