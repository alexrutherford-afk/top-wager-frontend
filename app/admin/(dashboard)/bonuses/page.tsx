'use client'

import { useState, useEffect } from 'react'

interface BonusTemplate {
  id: string
  name: string
  trigger: string
  trigger_amount: number | null
  reward_type: string
  reward_value: number
  reward_max: number | null
  wagering_requirement: number
  min_deposit: number | null
  max_withdrawal: number | null
  activation_expiry_hours: number | null
  wagering_expiry_hours: number | null
  market_scope: string[] | null
  is_active: boolean
  created_at: string
}

const TRIGGERS = ['register', 'first_deposit', 'deposit', 'deposit_over_amount', 'cumulative_bets', 'cumulative_losses', 'manual']
const REWARD_TYPES = ['deposit_match', 'free_spins', 'free_bonus_cash']

export default function BonusesPage() {
  const [templates, setTemplates] = useState<BonusTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '', trigger: 'first_deposit', reward_type: 'deposit_match',
    reward_value: '', reward_max: '', wagering_requirement: '30',
    min_deposit: '', max_withdrawal: '', activation_expiry_hours: '72',
    wagering_expiry_hours: '168', trigger_amount: '',
  })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/bonuses')
    const json = await res.json()
    setTemplates(json.templates ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleToggle = async (id: string, current: boolean) => {
    setToggling(id)
    await fetch(`/api/admin/bonuses/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    await load()
    setToggling(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (!form.name || !form.trigger || !form.reward_type || !form.reward_value || !form.wagering_requirement) {
      setFormError('Name, trigger, reward type, reward value, and wagering requirement are required.')
      return
    }
    setSaving(true)
    const res = await fetch('/api/admin/bonuses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        trigger: form.trigger,
        trigger_amount: form.trigger_amount ? Number(form.trigger_amount) : null,
        reward_type: form.reward_type,
        reward_value: Number(form.reward_value),
        reward_max: form.reward_max ? Number(form.reward_max) : null,
        wagering_requirement: Number(form.wagering_requirement),
        min_deposit: form.min_deposit ? Number(form.min_deposit) : null,
        max_withdrawal: form.max_withdrawal ? Number(form.max_withdrawal) : null,
        activation_expiry_hours: form.activation_expiry_hours ? Number(form.activation_expiry_hours) : null,
        wagering_expiry_hours: form.wagering_expiry_hours ? Number(form.wagering_expiry_hours) : null,
      }),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setFormError(json.error ?? 'Failed to create'); return }
    setShowForm(false)
    setForm({ name: '', trigger: 'first_deposit', reward_type: 'deposit_match', reward_value: '', reward_max: '', wagering_requirement: '30', min_deposit: '', max_withdrawal: '', activation_expiry_hours: '72', wagering_expiry_hours: '168', trigger_amount: '' })
    await load()
  }

  const INPUT = 'w-full rounded-lg border border-white/10 bg-[#0D1117] px-3 py-2 text-sm text-white outline-none placeholder-white/20'
  const SELECT = 'w-full rounded-lg border border-white/10 bg-[#0D1117] px-3 py-2 text-sm text-white outline-none'
  const LABEL = 'mb-1 block text-xs font-bold'

  return (
    <div className="p-6" style={{ background: '#0D1117', minHeight: '100vh' }}>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Bonus Templates</h1>
          <p className="text-xs mt-0.5" style={{ color: '#5A7090' }}>{templates.length} templates</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="rounded-xl px-4 py-2 text-sm font-black"
          style={{ background: '#1A5C38', color: 'white' }}
        >
          {showForm ? 'Cancel' : '+ New template'}
        </button>
      </div>

      {/* Help */}
      <div className="mb-5 rounded-xl border border-white/[0.06] px-4 py-3 text-xs space-y-1.5" style={{ background: '#131B24', color: '#7A95B0' }}>
        <p className="font-bold text-white text-sm">How bonus templates work</p>
        <p><span className="font-semibold" style={{ color: '#F5A623' }}>Trigger</span> — when the bonus fires. <span className="text-white">first_deposit</span> = on their very first deposit. <span className="text-white">deposit</span> = on any deposit. <span className="text-white">register</span> = on sign-up. <span className="text-white">manual</span> = ops team awards it directly from the player page.</p>
        <p><span className="font-semibold" style={{ color: '#F5A623' }}>Reward value</span> — for <span className="text-white">deposit_match</span>, this is the percentage (e.g. 100 = 100% match). For <span className="text-white">free_bonus_cash</span>, it's a fixed amount in the player's currency. For <span className="text-white">free_spins</span>, it's the number of spins.</p>
        <p><span className="font-semibold" style={{ color: '#F5A623' }}>Wagering requirement</span> — how many times the player must wager the bonus before they can withdraw. 30× on a 10,000 UGX bonus = player must wager 300,000 UGX.</p>
        <p><span className="font-semibold" style={{ color: '#F5A623' }}>Activation expiry</span> — hours the player has to accept/activate the bonus before it disappears. 72 = 3 days.</p>
        <p><span className="font-semibold" style={{ color: '#F5A623' }}>Wagering expiry</span> — hours to complete wagering after activating. 168 = 7 days. If not completed in time, the bonus is cancelled.</p>
        <p><span className="font-semibold" style={{ color: '#F5A623' }}>Max withdrawal</span> — caps how much a player can withdraw from winnings made with bonus funds. Leave blank for no cap.</p>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="mb-5 rounded-2xl border border-white/[0.06] p-5" style={{ background: '#131B24' }}>
          <p className="text-sm font-black text-white mb-4">New Bonus Template</p>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={LABEL} style={{ color: '#5A7090' }}>Name</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Welcome Bonus 100%" className={INPUT} />
            </div>
            <div>
              <label className={LABEL} style={{ color: '#5A7090' }}>Trigger</label>
              <select value={form.trigger} onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))} className={SELECT}>
                {TRIGGERS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL} style={{ color: '#5A7090' }}>Trigger Amount (optional)</label>
              <input type="number" value={form.trigger_amount} onChange={e => setForm(f => ({ ...f, trigger_amount: e.target.value }))} placeholder="0" className={INPUT} />
            </div>
            <div>
              <label className={LABEL} style={{ color: '#5A7090' }}>Reward Type</label>
              <select value={form.reward_type} onChange={e => setForm(f => ({ ...f, reward_type: e.target.value }))} className={SELECT}>
                {REWARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL} style={{ color: '#5A7090' }}>Reward Value</label>
              <input type="number" value={form.reward_value} onChange={e => setForm(f => ({ ...f, reward_value: e.target.value }))} placeholder="e.g. 100 for 100%" className={INPUT} />
            </div>
            <div>
              <label className={LABEL} style={{ color: '#5A7090' }}>Max Reward</label>
              <input type="number" value={form.reward_max} onChange={e => setForm(f => ({ ...f, reward_max: e.target.value }))} placeholder="optional cap" className={INPUT} />
            </div>
            <div>
              <label className={LABEL} style={{ color: '#5A7090' }}>Wagering Req (×)</label>
              <input type="number" value={form.wagering_requirement} onChange={e => setForm(f => ({ ...f, wagering_requirement: e.target.value }))} placeholder="30" className={INPUT} />
            </div>
            <div>
              <label className={LABEL} style={{ color: '#5A7090' }}>Min Deposit</label>
              <input type="number" value={form.min_deposit} onChange={e => setForm(f => ({ ...f, min_deposit: e.target.value }))} placeholder="optional" className={INPUT} />
            </div>
            <div>
              <label className={LABEL} style={{ color: '#5A7090' }}>Max Withdrawal</label>
              <input type="number" value={form.max_withdrawal} onChange={e => setForm(f => ({ ...f, max_withdrawal: e.target.value }))} placeholder="optional" className={INPUT} />
            </div>
            <div>
              <label className={LABEL} style={{ color: '#5A7090' }}>Activation Expiry (hours)</label>
              <input type="number" value={form.activation_expiry_hours} onChange={e => setForm(f => ({ ...f, activation_expiry_hours: e.target.value }))} placeholder="72" className={INPUT} />
            </div>
            <div>
              <label className={LABEL} style={{ color: '#5A7090' }}>Wagering Expiry (hours)</label>
              <input type="number" value={form.wagering_expiry_hours} onChange={e => setForm(f => ({ ...f, wagering_expiry_hours: e.target.value }))} placeholder="168" className={INPUT} />
            </div>
            {formError && (
              <div className="col-span-2">
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{formError}</p>
              </div>
            )}
            <div className="col-span-2">
              <button type="submit" disabled={saving}
                className="rounded-xl px-5 py-2.5 text-sm font-black disabled:opacity-50"
                style={{ background: '#1A5C38', color: 'white' }}>
                {saving ? 'Creating…' : 'Create template'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Templates List */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden" style={{ background: '#131B24' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Name', 'Trigger', 'Reward', 'Wagering', 'Status', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide" style={{ color: '#5A7090' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: '#5A7090' }}>Loading…</td></tr>
              )}
              {!loading && templates.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: '#5A7090' }}>No templates yet</td></tr>
              )}
              {!loading && templates.map(t => (
                <tr key={t.id} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3 font-semibold text-white">{t.name}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#7A95B0' }}>{t.trigger}</td>
                  <td className="px-4 py-3 text-xs text-white">
                    {t.reward_type === 'deposit_match' ? `${t.reward_value}% match` : `${t.reward_value} ${t.reward_type}`}
                    {t.reward_max ? ` (max ${t.reward_max})` : ''}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#7A95B0' }}>{t.wagering_requirement}×</td>
                  <td className="px-4 py-3">
                    <span className="rounded px-1.5 py-0.5 text-[11px] font-bold"
                      style={{ background: t.is_active ? 'rgba(93,232,152,0.1)' : 'rgba(90,112,144,0.12)', color: t.is_active ? '#5DE898' : '#5A7090' }}>
                      {t.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggle(t.id, t.is_active)}
                      disabled={toggling === t.id}
                      className="rounded-lg px-2.5 py-1 text-xs font-bold disabled:opacity-40"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#7A95B0' }}
                    >
                      {toggling === t.id ? '…' : t.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
