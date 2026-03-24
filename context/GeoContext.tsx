'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getCountryConfig, isBlocked, ALL_SELECTABLE, CountryConfig, ALLOWED_COUNTRIES } from '@/data/geoConfig';

type GeoCtx = {
  countryCode:    string;
  countryConfig:  CountryConfig;
  blocked:        boolean;
  detected:       boolean;   // true once IP lookup is complete
  setCountry:     (code: string) => void;
};

const fallback = ALLOWED_COUNTRIES.find(c => c.code === 'OTHER')!;

const GeoContext = createContext<GeoCtx>({
  countryCode:   'OTHER',
  countryConfig: fallback,
  blocked:       false,
  detected:      false,
  setCountry:    () => {},
});

export function GeoProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCountryCode] = useState<string>('OTHER');
  const [detected,    setDetected]    = useState(false);

  useEffect(() => {
    // Check for manually saved preference first
    const saved = localStorage.getItem('tw_country');
    if (saved) {
      setCountryCode(saved);
      setDetected(true);
      return;
    }

    // Detect via IP
    // TODO: Backend — swap for server-side IP lookup to prevent spoofing
    fetch('https://ipapi.co/json/')
      .then(r => r.json())
      .then(data => {
        const code = data?.country_code ?? 'OTHER';
        setCountryCode(code);
        setDetected(true);
      })
      .catch(() => {
        setCountryCode('OTHER');
        setDetected(true);
      });
  }, []);

  const setCountry = (code: string) => {
    localStorage.setItem('tw_country', code);
    setCountryCode(code);
  };

  const cfg = getCountryConfig(countryCode);
  const blocked = isBlocked(countryCode);
  const countryConfig = blocked ? fallback : (cfg as CountryConfig);

  return (
    <GeoContext.Provider value={{ countryCode, countryConfig, blocked, detected, setCountry }}>
      {children}
    </GeoContext.Provider>
  );
}

export const useGeo = () => useContext(GeoContext);
