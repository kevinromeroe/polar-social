"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { StaticUser, StaticSession } from "@/lib/auth";
import { getSession, onAuthChange } from "@/lib/auth";

interface AuthContextType {
  user: StaticUser | null;
  session: StaticSession | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<StaticUser | null>(null);
  const [session, setSession] = useState<StaticSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const unsub = onAuthChange(() => {
      getSession().then((s) => {
        setSession(s);
        setUser(s?.user ?? null);
      });
    });

    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
