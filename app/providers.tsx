'use client';

import { AuthProvider } from '@/context/AuthContext';
import { GeoProvider }  from '@/context/GeoContext';
import { I18nProvider } from '@/context/I18nContext';
import { ReactNode }    from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GeoProvider>
      <I18nProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </I18nProvider>
    </GeoProvider>
  );
}
