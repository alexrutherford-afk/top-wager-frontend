'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

interface Props {
  admin: {
    email: string
    fullName: string | null
    roles: string[]
  }
}

const NAV_ITEMS = [
  {
    href: '/admin',
    label: 'Dashboard',
    exact: true,
    roles: null, // all roles
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    href: '/admin/transactions',
    label: 'Transactions',
    exact: false,
    roles: ['finance', 'operations', 'support', 'super_admin'],
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M2 8h12M10 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: '/admin/players',
    label: 'Players',
    exact: false,
    roles: ['operations', 'support', 'finance', 'super_admin'],
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="5" r="3" />
        <path d="M2 14c0-3.314 2.686-6 6-6s6 2.686 6 6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/bonuses',
    label: 'Bonuses',
    exact: false,
    roles: ['operations', 'super_admin'],
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="8,1 10,6 15,6 11,9.5 12.5,15 8,11.5 3.5,15 5,9.5 1,6 6,6" />
      </svg>
    ),
  },
  {
    href: '/admin/affiliates',
    label: 'Affiliates',
    exact: false,
    roles: ['affiliate_manager', 'operations', 'super_admin'],
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="4" cy="8" r="2" />
        <circle cx="12" cy="4" r="2" />
        <circle cx="12" cy="12" r="2" />
        <line x1="6" y1="7" x2="10" y2="5" />
        <line x1="6" y1="9" x2="10" y2="11" />
      </svg>
    ),
  },
  {
    href: '/admin/banners',
    label: 'Banners',
    exact: false,
    roles: ['content_manager', 'super_admin'],
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="3" width="14" height="10" rx="1" />
        <path d="M1 6h14" />
      </svg>
    ),
  },
]

function canSee(item: typeof NAV_ITEMS[0], roles: string[]): boolean {
  if (!item.roles) return true
  if (roles.includes('super_admin')) return true
  return item.roles.some(r => roles.includes(r))
}

export function AdminSidebar({ admin }: Props) {
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <aside
      className="flex w-56 shrink-0 flex-col border-r border-white/[0.06]"
      style={{ background: '#0D1117', minHeight: '100vh' }}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-white/[0.06] px-4">
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black"
          style={{ background: 'linear-gradient(135deg,#1A5C38,#2D7A50)', color: '#F5A623' }}
        >
          TW
        </div>
        <span className="text-sm font-black text-white">Admin</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-3">
        {NAV_ITEMS.filter(item => canSee(item, admin.roles)).map(item => {
          const active = isActive(item.href, item.exact)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors"
              style={{
                background: active ? 'rgba(61,157,103,0.12)' : 'transparent',
                color: active ? '#3A9E67' : '#7A95B0',
              }}
            >
              <span className="shrink-0" style={{ color: active ? '#3A9E67' : '#5A7090' }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-3 space-y-1">
        {/* Roles */}
        <div className="flex flex-wrap gap-1 px-3 pb-1">
          {admin.roles.map(role => (
            <span
              key={role}
              className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide"
              style={{ background: 'rgba(245,166,35,0.1)', color: '#F5A623' }}
            >
              {role.replace('_', ' ')}
            </span>
          ))}
        </div>

        {/* Email */}
        <div className="px-3 py-1">
          <p className="truncate text-xs" style={{ color: '#5A7090' }}>{admin.email}</p>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors hover:bg-white/5"
          style={{ color: '#5A7090' }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3M11 11l4-3-4-3M15 8H6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  )
}
