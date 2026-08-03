import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StageSpot - Get Your First Stage",
  description: "Connect first-time performers with local cafes and restaurants for live performances",
  openGraph: {
    title: "StageSpot",
    description: "Get your first stage - hyperlocal performance platform",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col antialiased" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        {children}
      </body>
    </html>
  );
}
