'use client'

// Route error boundary (Next.js error.js convention)
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎤</div>
      <h1 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
        Something went off-script
      </h1>
      <p className="text-sm mb-6 text-center" style={{ color: 'var(--text-2)', maxWidth: '320px' }}>
        An unexpected error occurred. Try again, and if it keeps happening head back home.
      </p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn btn-primary" style={{ flex: 'none', padding: '10px 20px' }} onClick={() => reset()}>
          Try again
        </button>
        <a href="/" className="btn btn-ghost" style={{ padding: '10px 20px', textDecoration: 'none' }}>
          Go home
        </a>
      </div>
    </div>
  )
}
