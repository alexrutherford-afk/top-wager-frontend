/**
 * GET /api/admin/auth/check
 *
 * Called by the admin login page after Supabase auth succeeds,
 * to confirm the user has a row in admin_users.
 *
 * Returns 200 + roles on success, 401 if not an admin.
 */

import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin-auth'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ roles: admin.roles, email: admin.email })
}
