/**
 * lib/supabase-server.ts
 *
 * Server-side Supabase client for API routes and Server Components.
 * Uses the anon key + session cookies — respects RLS.
 *
 * Separate from lib/supabase.ts (browser client) and
 * lib/wallet.ts (service role client).
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // setAll called from a Server Component — cookies are read-only.
            // Safe to ignore; session refresh is handled by middleware.
          }
        },
      },
    }
  )
}

/**
 * Returns the authenticated user from the current request session,
 * or null if the request is unauthenticated.
 *
 * Usage in API routes:
 *   const user = await getAuthenticatedUser()
 *   if (!user) return unauthorizedResponse()
 */
export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}
