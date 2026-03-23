'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MOCK_USER } from '@/data/mockUser';

type AuthContextType = {
  isLoggedIn: boolean;
  user: typeof MOCK_USER | null;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('casino_mock_auth');
    if (stored === 'true') setIsLoggedIn(true);
  }, []);

  const login = () => {
    localStorage.setItem('casino_mock_auth', 'true');
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('casino_mock_auth');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user: isLoggedIn ? MOCK_USER : null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
