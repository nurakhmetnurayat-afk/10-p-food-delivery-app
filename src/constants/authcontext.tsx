import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, tokenStore } from '@/api/client';
import type { AuthResult, User } from '@/api/types';

interface AuthContextType {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  applySession: (result: AuthResult) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Pick<User, 'name' | 'phone' | 'address' | 'bio'>>) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (await tokenStore.load()) {
          const { user: me } = await api.get<{ user: User }>('/auth/me');
          setUser(me);
        }
      } catch {
        await tokenStore.save(null);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const applySession = useCallback(async (result: AuthResult) => {
    await tokenStore.save(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const login = useCallback(
    async (email: string, password: string) =>
      applySession(await api.post<AuthResult>('/auth/login', { email, password })),
    [applySession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) =>
      applySession(await api.post<AuthResult>('/auth/register', { name, email, password })),
    [applySession],
  );

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {}
    await tokenStore.save(null);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<Pick<User, 'name' | 'phone' | 'address' | 'bio'>>) => {
    const { user: me } = await api.patch<{ user: User }>('/auth/me', data);
    setUser(me);
    return me;
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, register, applySession, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider');
  return ctx;
}
