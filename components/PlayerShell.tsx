'use client'

import { usePathname } from 'next/navigation'
import { Nav } from '@/components/Nav'
import { GeoGate } from '@/components/GeoGate'

/**
 * Wraps player-facing pages with Nav, GeoGate, and footer.
 * Renders nothing extra for /admin/* routes so the admin layout
 * has a clean slate with no casino chrome.
 */
export function PlayerShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <GeoGate>
      <div className="sticky top-0 z-50">
        <Nav />
      </div>
      <main className="flex-1">{children}</main>
      <footer
        className="border-t border-white/5 py-6 text-center text-xs pb-20 md:pb-6"
        style={{ color: '#5A7090', background: '#0D1117' }}
      >
        <p className="mb-1">TopWager Casino · Licensed by Tobique First Nation</p>
        <p>18+ · Please gamble responsibly · BeGambleAware.org</p>
      </footer>
    </GeoGate>
  )
}
