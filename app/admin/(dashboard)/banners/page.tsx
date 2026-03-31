'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string | null
  position: string
  is_active: boolean
  sort_order: number
  market_scope: string[] | null
  created_at: string
}

const POSITIONS = [
  { value: 'lobby_hero', label: 'Lobby — Hero' },
  { value: 'lobby_promo', label: 'Lobby — Promo Strip' },
  { value: 'deposit_page', label: 'Deposit Page' },
]

const POSITION_LABELS: Record<string, string> = {
  lobby_hero: 'Lobby Hero',
  lobby_promo: 'Lobby Promo',
  deposit_page: 'Deposit Page',
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    link_url: '',
    position: 'lobby_hero',
    sort_order: '0',
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/banners')
    const json = await res.json()
    setBanners(json.banners ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')

    if (!form.title) { setFormError('Title is required.'); return }
    if (!file) { setFormError('Please select an image.'); return }

    setUploading(true)

    // Upload image first
    const fd = new FormData()
    fd.append('file', file)
    const uploadRes = await fetch('/api/admin/banners/upload', { method: 'POST', body: fd })
    const uploadJson = await uploadRes.json()

    if (!uploadRes.ok) {
      setUploading(false)
      setFormError(uploadJson.error ?? 'Image upload failed.')
      return
    }

    // Create banner record
    const createRes = await fetch('/api/admin/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        image_url: uploadJson.url,
        link_url: form.link_url || null,
        position: form.position,
        sort_order: Number(form.sort_order) || 0,
      }),
    })
    const createJson = await createRes.json()
    setUploading(false)

    if (!createRes.ok) { setFormError(createJson.error ?? 'Failed to create banner.'); return }

    setShowForm(false)
    setForm({ title: '', link_url: '', position: 'lobby_hero', sort_order: '0' })
    setFile(null)
    setPreview(null)
    if (fileRef.current) fileRef.current.value = ''
    await load()
  }

  const handleToggle = async (id: string, current: boolean) => {
    setToggling(id)
    await fetch(`/api/admin/banners/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    await load()
    setToggling(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner? This cannot be undone.')) return
    setDeleting(id)
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' })
    await load()
    setDeleting(null)
  }

  const INPUT = 'w-full rounded-lg border border-white/10 bg-[#0D1117] px-3 py-2 text-sm text-white outline-none placeholder-white/20'
  const SELECT = 'w-full rounded-lg border border-white/10 bg-[#0D1117] px-3 py-2 text-sm text-white outline-none'
  const LABEL = 'mb-1 block text-xs font-bold'

  const byPosition = POSITIONS.map(p => ({
    ...p,
    items: banners.filter(b => b.position === p.value),
  }))

  return (
    <div className="p-6" style={{ background: '#0D1117', minHeight: '100vh' }}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Banners</h1>
          <p className="text-xs mt-0.5" style={{ color: '#5A7090' }}>{banners.length} banners across {POSITIONS.length} positions</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="rounded-xl px-4 py-2 text-sm font-black"
          style={{ background: '#1A5C38', color: 'white' }}
        >
          {showForm ? 'Cancel' : '+ Upload banner'}
        </button>
      </div>

      {/* Upload Form */}
      {showForm && (
        <div className="mb-6 rounded-2xl border border-white/[0.06] p-5" style={{ background: '#131B24' }}>
          <p className="text-sm font-black text-white mb-4">New Banner</p>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={LABEL} style={{ color: '#5A7090' }}>Title</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Welcome Bonus 200%" className={INPUT} />
              </div>
              <div>
                <label className={LABEL} style={{ color: '#5A7090' }}>Position</label>
                <select value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} className={SELECT}>
                  {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL} style={{ color: '#5A7090' }}>Link URL (optional)</label>
                <input value={form.link_url} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                  placeholder="https://… or /deposit" className={INPUT} />
              </div>
              <div>
                <label className={LABEL} style={{ color: '#5A7090' }}>Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))}
                  placeholder="0" className={INPUT} />
                <p className="mt-1 text-xs" style={{ color: '#3A4A5A' }}>Lower = shown first</p>
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label className={LABEL} style={{ color: '#5A7090' }}>Image (JPEG, PNG, WebP — max 5MB)</label>
              <div
                className="relative flex items-center justify-center rounded-xl border-2 border-dashed cursor-pointer overflow-hidden"
                style={{ borderColor: 'rgba(255,255,255,0.1)', minHeight: '140px', background: '#0D1117' }}
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-40 max-w-full object-contain" />
                ) : (
                  <div className="text-center py-8 px-4">
                    <p className="text-sm font-semibold" style={{ color: '#5A7090' }}>Click to select image</p>
                    <p className="text-xs mt-1" style={{ color: '#3A4A5A' }}>Recommended: 1200×400px</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              {file && (
                <p className="mt-1 text-xs" style={{ color: '#5A7090' }}>{file.name} — {(file.size / 1024).toFixed(0)}KB</p>
              )}
            </div>

            {formError && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{formError}</p>
            )}

            <button type="submit" disabled={uploading}
              className="rounded-xl px-5 py-2.5 text-sm font-black disabled:opacity-50"
              style={{ background: '#1A5C38', color: 'white' }}>
              {uploading ? 'Uploading…' : 'Upload & publish'}
            </button>
          </form>
        </div>
      )}

      {/* Banners by position */}
      {loading ? (
        <p className="text-sm" style={{ color: '#5A7090' }}>Loading…</p>
      ) : (
        <div className="space-y-6">
          {byPosition.map(({ value, label, items }) => (
            <div key={value}>
              <div className="flex items-center gap-2 mb-3">
                <p className="text-sm font-black text-white">{label}</p>
                <span className="rounded px-1.5 py-0.5 text-[11px] font-bold" style={{ background: 'rgba(255,255,255,0.06)', color: '#5A7090' }}>
                  {items.length} banner{items.length !== 1 ? 's' : ''}
                </span>
              </div>

              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/[0.06] py-6 text-center">
                  <p className="text-sm" style={{ color: '#3A4A5A' }}>No banners for this position</p>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(b => (
                    <div key={b.id} className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: '#131B24' }}>
                      {/* Image */}
                      <div className="relative h-32 w-full overflow-hidden" style={{ background: '#0D1117' }}>
                        <img
                          src={b.image_url}
                          alt={b.title}
                          className="h-full w-full object-cover"
                        />
                        {!b.is_active && (
                          <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
                            <span className="rounded-lg px-2 py-1 text-xs font-bold" style={{ background: '#131B24', color: '#5A7090' }}>Inactive</span>
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <p className="font-semibold text-white text-sm truncate">{b.title}</p>
                        {b.link_url && (
                          <p className="text-xs truncate mt-0.5" style={{ color: '#5A7090' }}>{b.link_url}</p>
                        )}
                        <p className="text-xs mt-0.5" style={{ color: '#3A4A5A' }}>Order: {b.sort_order}</p>

                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => handleToggle(b.id, b.is_active)}
                            disabled={toggling === b.id}
                            className="flex-1 rounded-lg py-1.5 text-xs font-bold disabled:opacity-40"
                            style={{ background: 'rgba(255,255,255,0.06)', color: b.is_active ? '#5DE898' : '#5A7090' }}
                          >
                            {toggling === b.id ? '…' : b.is_active ? 'Active' : 'Inactive'}
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            disabled={deleting === b.id}
                            className="rounded-lg px-3 py-1.5 text-xs font-bold disabled:opacity-40"
                            style={{ background: 'rgba(232,77,28,0.1)', color: '#E84D1C' }}
                          >
                            {deleting === b.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
