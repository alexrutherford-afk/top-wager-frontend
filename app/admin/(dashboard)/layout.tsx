import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin-auth'
import { AdminSidebar } from '@/app/admin/_components/AdminSidebar'

/**
 * Wraps all dashboard admin pages.
 * Middleware handles unauthenticated users before this runs.
 * This catches authenticated non-admin users (e.g. players who reach /admin).
 */
export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await getAdminUser()

  if (!admin) {
    redirect('/admin/login')
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0D1117' }}>
      <AdminSidebar
        admin={{
          email: admin.email,
          fullName: admin.full_name,
          roles: admin.roles,
        }}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
    </div>
  )
}
