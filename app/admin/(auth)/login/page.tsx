'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const INPUT =
    'w-full rounded-xl border border-white/10 bg-[#1A2332] px-4 py-3 text-base text-white placeholder-white/20 outline-none transition-colors focus:border-white/20'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Enter your email and password.')
      return
    }
    setLoading(true)

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setLoading(false)
      setError('Incorrect email or password.')
      return
    }

    // Verify the signed-in user has an admin_users row
    const res = await fetch('/api/admin/auth/check')
    if (!res.ok) {
      await supabase.auth.signOut()
      setLoading(false)
      setError('You do not have admin access.')
      return
    }

    router.push('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4" style={{ background: '#0D1117' }}>
      <div className="w-full max-w-sm">

        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-base font-black border"
            style={{
              background: 'linear-gradient(135deg,#1A5C38,#2D7A50)',
              color: '#F5A623',
              borderColor: 'rgba(245,166,35,0.2)',
              boxShadow: '0 4px 20px rgba(26,92,56,0.5)',
            }}
          >
            TW
          </div>
          <h1 className="text-2xl font-black text-white">Admin Access</h1>
          <p className="mt-1 text-sm" style={{ color: '#5A7090' }}>TopWager Operations</p>
        </div>

        <div className="rounded-2xl border border-white/[0.07] p-6" style={{ background: '#131B24' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@topwager.com"
                className={INPUT}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={INPUT}
              />
            </div>
            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-xl py-3 text-sm font-black disabled:opacity-50 transition-opacity hover:opacity-90"
              style={{ background: '#F5A623', color: '#0A0E14' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
