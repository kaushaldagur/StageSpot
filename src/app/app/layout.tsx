// Signed-in app screens are mobile-first (per the wireframes). Headers span
// the full width; each page constrains its own <main> content width per
// screen type (feed, list, form) so desktop gets a real adaptation rather
// than a phone column (PRD Section 8: responsive design).
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen w-full">{children}</div>
}
