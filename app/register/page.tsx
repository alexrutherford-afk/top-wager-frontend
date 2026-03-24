'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type Step = 1 | 2 | 3;

const INPUT = (err?: string) =>
  `w-full rounded-xl border ${err ? 'border-red-500/40 bg-red-500/5' : 'border-white/[0.08] bg-[#1A2332]'} px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-[#F5A623]/40 transition-colors`;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '', dob: '', phone: '', currency: 'EUR', agreedTerms: false, agreedMarketing: false });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!form.email.includes('@')) e.email = 'Enter a valid email address';
      if (form.password.length < 8) e.password = 'Minimum 8 characters';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    if (step === 2) {
      if (!form.firstName) e.firstName = 'Required';
      if (!form.lastName) e.lastName = 'Required';
      if (!form.dob) e.dob = 'Required';
    }
    if (step === 3 && !form.agreedTerms) e.agreedTerms = 'You must accept to continue';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validate()) setStep((s) => (s + 1) as Step); };
  const back = () => setStep((s) => (s - 1) as Step);

  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setSubmitError('');
    const { error } = await register(
      form.email,
      form.password,
      `${form.firstName} ${form.lastName}`.trim(),
      form.currency
    );
    setLoading(false);
    if (error) { setSubmitError(error); return; }
    // Registration successful — Supabase sends a confirmation email
    // TODO: Backend — also save dob, phone, currency to profiles table
    // POST /api/player/profile { dob, phone, currency }
    router.push('/register/confirm');
  };

  const stepLabels = ['Account', 'Personal info', 'Confirm'];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10" style={{ background: '#0D1117' }}>
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl text-sm font-black border" style={{ background: 'linear-gradient(135deg,#1A5C38,#2D7A50)', color: '#F5A623', borderColor: 'rgba(245,166,35,0.2)' }}>TW</div>
          <h1 className="text-2xl font-black text-white">Create account</h1>
          <p className="mt-1 text-sm" style={{ color: '#5A7090' }}>Join TopWager and claim your welcome bonus</p>
        </div>

        {/* Step bar */}
        <div className="mb-6 flex items-center gap-1">
          {([1, 2, 3] as Step[]).map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-1">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black transition-colors"
                style={{ background: s <= step ? '#F5A623' : '#1A2332', color: s <= step ? '#0A0E14' : '#5A7090' }}>
                {s < step ? '✓' : s}
              </div>
              <p className="hidden text-[10px] font-semibold sm:block" style={{ color: s === step ? '#F5A623' : '#5A7090' }}>{stepLabels[i]}</p>
              {s < 3 && <div className="h-px flex-1 transition-colors" style={{ background: s < step ? '#F5A623' : 'rgba(255,255,255,0.07)' }} />}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/[0.07] p-6" style={{ background: '#131B24' }}>
          <form onSubmit={handleSubmit}>

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>Email address</label>
                  <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" className={INPUT(errors.email)} />
                  {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>Password</label>
                  <input type="password" value={form.password} onChange={(e) => set('password', e.target.value)} placeholder="Min. 8 characters" className={INPUT(errors.password)} />
                  {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>Confirm password</label>
                  <input type="password" value={form.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} placeholder="Repeat password" className={INPUT(errors.confirmPassword)} />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>Currency</label>
                  <select value={form.currency} onChange={(e) => set('currency', e.target.value)} className={INPUT()} style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="KES">KES — Kenyan Shilling</option>
                    <option value="TZS">TZS — Tanzanian Shilling</option>
                    <option value="ZAR">ZAR — South African Rand</option>
                  </select>
                </div>
                <button type="button" onClick={next} className="w-full rounded-xl py-3 text-sm font-black text-[#0A0E14]" style={{ background: '#F5A623' }}>Continue</button>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>First name</label>
                    <input type="text" value={form.firstName} onChange={(e) => set('firstName', e.target.value)} placeholder="Alex" className={INPUT(errors.firstName)} />
                    {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>Last name</label>
                    <input type="text" value={form.lastName} onChange={(e) => set('lastName', e.target.value)} placeholder="Smith" className={INPUT(errors.lastName)} />
                    {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>Date of birth</label>
                  <input type="date" value={form.dob} onChange={(e) => set('dob', e.target.value)} className={INPUT(errors.dob)} />
                  {errors.dob && <p className="mt-1 text-xs text-red-400">{errors.dob}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-bold" style={{ color: '#5A7090' }}>Phone (optional)</label>
                  <input type="tel" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+44 7700 900000" className={INPUT()} style={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={back} className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-white/50 hover:bg-white/5">Back</button>
                  <button type="button" onClick={next} className="flex-1 rounded-xl py-3 text-sm font-black text-[#0A0E14]" style={{ background: '#F5A623' }}>Continue</button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-xl p-4 space-y-2" style={{ background: '#1A2332' }}>
                  <p className="text-xs font-black uppercase tracking-wider mb-3" style={{ color: '#5A7090' }}>Account summary</p>
                  {[{ label: 'Email', value: form.email }, { label: 'Name', value: `${form.firstName} ${form.lastName}` }, { label: 'Currency', value: form.currency }].map((r) => (
                    <div key={r.label} className="flex justify-between text-sm">
                      <span style={{ color: '#5A7090' }}>{r.label}</span>
                      <span className="font-semibold text-white">{r.value}</span>
                    </div>
                  ))}
                </div>
                <label className="flex cursor-pointer gap-3">
                  <input type="checkbox" checked={form.agreedTerms} onChange={(e) => set('agreedTerms', e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#F5A623]" />
                  <span className="text-xs" style={{ color: '#7A95B0' }}>
                    I confirm I am 18+ and agree to the{' '}
                    <a href="#" style={{ color: '#F5A623' }}>Terms & Conditions</a> and{' '}
                    <a href="#" style={{ color: '#F5A623' }}>Privacy Policy</a>
                  </span>
                </label>
                {errors.agreedTerms && <p className="text-xs text-red-400">{errors.agreedTerms}</p>}
                {submitError && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{submitError}</p>}
                <label className="flex cursor-pointer gap-3">
                  <input type="checkbox" checked={form.agreedMarketing} onChange={(e) => set('agreedMarketing', e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[#F5A623]" />
                  <span className="text-xs" style={{ color: '#7A95B0' }}>I&rsquo;d like to receive bonus offers by email</span>
                </label>
                <div className="flex gap-3">
                  <button type="button" onClick={back} className="flex-1 rounded-xl border border-white/10 py-3 text-sm font-semibold text-white/50 hover:bg-white/5">Back</button>
                  <button type="submit" disabled={loading} className="flex-1 rounded-xl py-3 text-sm font-black text-[#0A0E14] disabled:opacity-50" style={{ background: '#F5A623' }}>
                    {loading ? 'Creating…' : 'Create account'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="mt-6 text-center text-sm" style={{ color: '#5A7090' }}>
          Already have an account?{' '}
          <Link href="/login" className="font-black" style={{ color: '#F5A623' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
