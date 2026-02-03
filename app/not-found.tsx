import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-input px-4">
      <div className="max-w-md text-center space-y-4">
        <div className="text-6xl font-bold text-primary">404</div>
        <h1 className="text-2xl font-bold text-foreground">Page Not Found</h1>
        <p className="text-muted">The page you're looking for doesn't exist</p>
        <div className="flex gap-3 justify-center pt-4">
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
          </Link>
          <Link href="/" className="btn-secondary">
            Go Home
          </Link>
        </div>
      </div>
    </div>
  )
}
