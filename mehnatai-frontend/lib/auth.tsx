"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi, setTokens, clearTokens, getAccessToken, UserMe } from "@/lib/api";

export type Role = "rahbar" | "xodim" | "hr" | null;

interface AuthContextType {
  role: Role;
  user: UserMe | null;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  user: null,
  login: async () => ({ ok: false }),
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>(null);
  const [user, setUser] = useState<UserMe | null>(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore session from token
  useEffect(() => {
    const restore = async () => {
      const token = getAccessToken();
      if (!token) { setLoading(false); return; }
      try {
        const me = await authApi.me();
        setUser(me);
        setRole(me.role);
        localStorage.setItem("mehnatai_role", me.role);
      } catch {
        clearTokens();
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const login = async (username: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    try {
      const tokens = await authApi.login(username, password);
      setTokens(tokens.access_token, tokens.refresh_token);

      const me = await authApi.me();
      setUser(me);
      setRole(me.role);
      localStorage.setItem("mehnatai_role", me.role);
      localStorage.setItem("mehnatai_user", JSON.stringify(me));
      return { ok: true };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Xatolik yuz berdi";
      return { ok: false, error: message };
    }
  };

  const logout = () => {
    clearTokens();
    setRole(null);
    setUser(null);
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ role, user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
