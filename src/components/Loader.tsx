// Branded loading states (wireframe palette). PageLoader for whole screens,
// skeletons for feed/list pages so layout doesn't jump when data lands.

export const Spinner = ({ size = 28 }: { size?: number }) => (
  <div className="spinner" style={{ width: size, height: size }} aria-hidden />
)

export const PageLoader = ({ label = 'Loading' }: { label?: string }) => (
  <div className="page-loader" role="status" aria-live="polite">
    <Spinner />
    <div className="loader-label">{label}…</div>
  </div>
)

// Mirrors .feed-card: header row, image band, title, actions
export const FeedSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="feed-grid" role="status" aria-label="Loading feed">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="feed-card" aria-hidden>
        <div className="card-top">
          <div className="skeleton" style={{ width: 28, height: 28, borderRadius: '50%' }} />
          <div style={{ flex: 1 }}>
            <div className="skeleton" style={{ width: '40%', height: 11, marginBottom: 5 }} />
            <div className="skeleton" style={{ width: '55%', height: 9 }} />
          </div>
        </div>
        <div className="skeleton" style={{ height: 140, borderRadius: 0 }} />
        <div className="card-body">
          <div className="skeleton" style={{ width: '60%', height: 12, marginBottom: 7 }} />
          <div className="skeleton" style={{ width: '80%', height: 10, marginBottom: 12 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="skeleton" style={{ flex: 1, height: 32, borderRadius: 10 }} />
            <div className="skeleton" style={{ width: 56, height: 32, borderRadius: 10 }} />
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Mirrors .masonry / .m-card
export const MasonrySkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="masonry" role="status" aria-label="Loading">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="m-card" aria-hidden>
        <div className="skeleton" style={{ height: i % 2 ? 140 : 105, borderRadius: 0 }} />
        <div className="m-body">
          <div className="skeleton" style={{ width: '65%', height: 10, marginBottom: 6 }} />
          <div className="skeleton" style={{ width: 60, height: 16, borderRadius: 8 }} />
        </div>
      </div>
    ))}
  </div>
)

// Mirrors .list-card rows (bookings, admin queue)
export const ListSkeleton = ({ count = 3 }: { count?: number }) => (
  <div role="status" aria-label="Loading list">
    {Array.from({ length: count }, (_, i) => (
      <div key={i} className="list-card" aria-hidden>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div className="skeleton" style={{ width: '50%', height: 11 }} />
          <div className="skeleton" style={{ width: 64, height: 18, borderRadius: 8 }} />
        </div>
        <div className="skeleton" style={{ width: '35%', height: 9 }} />
      </div>
    ))}
  </div>
)
