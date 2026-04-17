"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type Role = "admin" | "user" | null;

type AuthContextValue = {
  token: string | null;
  email: string | null;
  role: Role;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuthSession: (token: string, email: string, role?: Role) => void;
  clearAuthSession: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const API = "http://localhost:4321";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    const syncFromStorage = () => {
      const storedToken = localStorage.getItem("token");
      const storedEmail = localStorage.getItem("email") || localStorage.getItem("samrakshya_email");
      const storedRole = localStorage.getItem("role") as Role;
      setToken(storedToken);
      setEmail(storedEmail);
      setRole(storedRole);
    };

    syncFromStorage();

    const onStorage = () => syncFromStorage();
    const onFocus = () => syncFromStorage();

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Resolve role from backend when we have a token but no cached role.
  useEffect(() => {
    if (!token || role) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const fetchedRole = json?.data?.user?.role as Role;
        if (!cancelled && fetchedRole) {
          localStorage.setItem("role", fetchedRole);
          setRole(fetchedRole);
        }
      } catch {
        // Silent — role simply stays null, UI will render user variant.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, role]);

  const setAuthSession = useCallback((nextToken: string, nextEmail: string, nextRole?: Role) => {
    localStorage.setItem("token", nextToken);
    localStorage.setItem("email", nextEmail);
    localStorage.setItem("samrakshya_email", nextEmail);
    if (nextRole) localStorage.setItem("role", nextRole);
    setToken(nextToken);
    setEmail(nextEmail);
    if (nextRole) setRole(nextRole);
  }, []);

  const clearAuthSession = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("samrakshya_email");
    localStorage.removeItem("role");
    localStorage.removeItem("activeSosId");
    setToken(null);
    setEmail(null);
    setRole(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      email,
      role,
      isAuthenticated: Boolean(token && email),
      isAdmin: role === "admin",
      setAuthSession,
      clearAuthSession,
    }),
    [token, email, role, setAuthSession, clearAuthSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
