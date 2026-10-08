import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { api, type User } from "@/src/api";
import { storage } from "@/src/utils/storage";

type Session = { user: User | null; loading: boolean; signIn: (email: string, password: string) => Promise<void>; signUp: (name: string, email: string, password: string, experience: string) => Promise<void>; signOut: () => Promise<void>; refresh: () => Promise<void> };
const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.me().then(setUser).catch(() => storage.secureRemove("syntaxai_token")).finally(() => setLoading(false)); }, []);
  const value = useMemo<Session>(() => ({ user, loading, signIn: async (email, password) => { const result = await api.login({ email, password }); await storage.secureSet("syntaxai_token", result.token); setUser(result.user); }, signUp: async (name, email, password, experience) => { const result = await api.register({ name, email, password, experience }); await storage.secureSet("syntaxai_token", result.token); setUser(result.user); }, signOut: async () => { await storage.secureRemove("syntaxai_token"); setUser(null); }, refresh: async () => { setUser(await api.me()); } }), [loading, user]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() { const context = useContext(SessionContext); if (!context) throw new Error("useSession harus digunakan di dalam SessionProvider"); return context; }