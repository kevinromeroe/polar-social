"use client";

export interface StaticUser {
  email: string;
  id: string;
}

export interface StaticSession {
  user: StaticUser;
}

const STORAGE_KEY = "eac_session";

const listeners = new Set<() => void>();

function notifyChange() {
  listeners.forEach((fn) => fn());
}

export function onAuthChange(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function getStoredSession(): StaticSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function signIn(email: string, password: string) {
  const res = await fetch("/data/auth.json");
  if (!res.ok) throw new Error("No se pudo verificar credenciales");
  const credentials: { email: string; hash: string }[] = await res.json();

  const hash = await sha256(password);
  const match = credentials.find((c) => c.email === email && c.hash === hash);

  if (!match) throw new Error("Credenciales inválidas");

  const session: StaticSession = {
    user: { email: match.email, id: match.email },
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {}
  notifyChange();
  return { user: session.user, session };
}

export async function signOut() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
  notifyChange();
}

export async function getSession(): Promise<StaticSession | null> {
  return getStoredSession();
}

export async function getUser(): Promise<StaticUser | null> {
  return getStoredSession()?.user ?? null;
}
