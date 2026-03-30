/**
 * lib/admin-auth.ts
 *
 * Server-side admin role helpers. Uses service role — never import from client code.
 *
 * Usage in API routes:
 *   const admin = await requireAdmin(['finance', 'operations'])
 *   if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 *
 * Usage in server components:
 *   const admin = await getAdminUser()
 *   if (!admin) redirect('/admin/login')
 */

import { createClient } from '@supabase/supabase-js'
import { getAuthenticatedUser } from '@/lib/supabase-server'

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  roles: string[]
  is_active: boolean
}

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

/**
 * Returns the authenticated admin user or null.
 * Checks: session exists → email is in admin_users → is_active = true
 */
export async function getAdminUser(): Promise<AdminUser | null> {
  const user = await getAuthenticatedUser()
  if (!user?.email) return null

  const supabase = getServiceClient()
  const { data } = await supabase
    .from('admin_users')
    .select('id, email, full_name, roles, is_active')
    .eq('email', user.email)
    .eq('is_active', true)
    .single()

  return data ?? null
}

/** true if admin has super_admin or the specified role */
export function hasRole(admin: AdminUser, role: string): boolean {
  return admin.roles.includes('super_admin') || admin.roles.includes(role)
}

/**
 * Use in API routes. Returns the admin user or throws 'UNAUTHORIZED'/'FORBIDDEN'.
 * Pass an array of roles — any match is sufficient.
 *
 * try { admin = await requireAdmin(['finance']) } catch { return 401/403 }
 */
export async function requireAdmin(allowedRoles?: string[]): Promise<AdminUser> {
  const admin = await getAdminUser()
  if (!admin) throw new Error('UNAUTHORIZED')

  if (allowedRoles && allowedRoles.length > 0) {
    const permitted =
      admin.roles.includes('super_admin') ||
      allowedRoles.some(r => admin.roles.includes(r))
    if (!permitted) throw new Error('FORBIDDEN')
  }

  return admin
}
