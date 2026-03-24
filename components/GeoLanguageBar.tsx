'use client';

import { useState, useRef, useEffect } from 'react';
import { useGeo } from '@/context/GeoContext';
import { useI18n, Lang, LANG_LABELS } from '@/context/I18nContext';
import { ALL_SELECTABLE } from '@/data/geoConfig';

export function GeoLanguageBar() {
  const { countryCode, countryConfig, setCountry } = useGeo();
  const { lang, setLang, t } = useI18n();
  const [showCountry, setShowCountry] = useState(false);
  const [showLang,    setShowLang]    = useState(false);
  const [search,      setSearch]      = useState('');
  const countryRef = useRef<HTMLDivElement>(null);
  const langRef    = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (countryRef.current && !countryRef.current.contains(e.target as Node)) setShowCountry(false);
      if (langRef.current    && !langRef.current.contains(e.target as Node))    setShowLang(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = ALL_SELECTABLE.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const currentCountry = ALL_SELECTABLE.find(c => c.code === countryCode) ?? countryConfig;

  return (
    <div className="flex items-center justify-end gap-2 px-4 py-1.5"
      style={{ background: '#080B10', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>

      {/* Country selector */}
      <div ref={countryRef} className="relative">
        <button onClick={() => { setShowCountry(!showCountry); setShowLang(false); }}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] transition-colors hover:bg-white/5"
          style={{ color: '#5A7090' }}>
          <span>{currentCountry.flag}</span>
          <span>{currentCountry.code === 'OTHER' ? 'Global' : currentCountry.name}</span>
          <span style={{ color: '#3A4A5A' }}>▾</span>
        </button>

        {showCountry && (
          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl shadow-2xl"
            style={{ background: '#131720', border: '1px solid rgba(255,255,255,0.09)' }}>
            <div className="p-2">
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search country…"
                className="w-full rounded-lg px-3 py-1.5 text-xs outline-none"
                style={{ background: '#0B0E14', border: '1px solid rgba(255,255,255,0.07)', color: '#E2E8F0' }} />
            </div>
            <div className="max-h-56 overflow-y-auto pb-1">
              {filtered.map(c => (
                <button key={c.code}
                  onClick={() => { setCountry(c.code); setShowCountry(false); setSearch(''); }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors hover:bg-white/5"
                  style={{ color: c.code === countryCode ? '#22C55E' : '#E2E8F0' }}>
                  <span>{c.flag}</span>
                  <span className="flex-1">{c.name}</span>
                  <span style={{ color: '#4A5568' }}>{c.currency}</span>
                  {c.code === countryCode && <span style={{ color: '#22C55E' }}>✓</span>}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <span style={{ color: '#2D3748' }}>|</span>

      {/* Language selector */}
      <div ref={langRef} className="relative">
        <button onClick={() => { setShowLang(!showLang); setShowCountry(false); }}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] transition-colors hover:bg-white/5"
          style={{ color: '#5A7090' }}>
          <span>{LANG_LABELS[lang].split(' ')[0]}</span>
          <span>{LANG_LABELS[lang].split(' ')[1]}</span>
          <span style={{ color: '#3A4A5A' }}>▾</span>
        </button>

        {showLang && (
          <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-xl shadow-2xl"
            style={{ background: '#131720', border: '1px solid rgba(255,255,255,0.09)' }}>
            {(Object.keys(LANG_LABELS) as Lang[]).map(l => (
              <button key={l}
                onClick={() => { setLang(l); setShowLang(false); }}
                className="flex w-full items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-white/5"
                style={{ color: l === lang ? '#22C55E' : '#E2E8F0' }}>
                <span>{LANG_LABELS[l]}</span>
                {l === lang && <span>✓</span>}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
