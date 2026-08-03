import Link from 'next/link'

// 404 page (Next.js not-found.js convention)
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ backgroundColor: 'var(--bg)' }}>
      <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎭</div>
      <h1 className="text-lg font-semibold mb-2" style={{ color: 'var(--text)' }}>
        This stage doesn&apos;t exist
      </h1>
      <p className="text-sm mb-6 text-center" style={{ color: 'var(--text-2)', maxWidth: '320px' }}>
        The page you&apos;re looking for was moved, removed, or never booked a slot here.
      </p>
      <Link href="/" className="btn btn-primary" style={{ padding: '10px 20px', textDecoration: 'none' }}>
        Back to StageSpot
      </Link>
    </div>
  )
}
