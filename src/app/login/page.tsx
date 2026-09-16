"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";

const userMap: Record<string, string> = {
  admin: "admin@datalitica.com.co",
  polar: "admin@datalitica.com.co",
  havoline: "havoline@datalitica.com.co",
};

function resolveEmail(input: string): string {
  if (input.includes("@")) return input;
  return userMap[input.toLowerCase()] ?? `${input}@datalitica.com.co`;
}

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const email = resolveEmail(username);
      await signIn(email, password);
      router.replace("/marca");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al iniciar sesión";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900">
      <div className="w-full max-w-md px-4">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <svg viewBox="0 0 56 56" className="w-16 h-16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="27" stroke="#2dd4bf" strokeWidth="2" fill="#0f766e" fillOpacity="0.25" />
              <path d="M28 10a18 18 0 0 1 0 36" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
              <path d="M28 16a12 12 0 0 1 0 24" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
              <path d="M28 22a6 6 0 0 1 0 12" stroke="#5eead4" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="28" cy="28" r="2.5" fill="#2dd4bf" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Escucha Activa
          </h1>
          <p className="text-teal-300 mt-0.5 text-sm font-medium">
            de Clientes
          </p>
          <p className="text-slate-400 mt-3 text-xs tracking-widest uppercase">
            Escucha · Analiza · Actúa
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-2xl p-8 space-y-6"
        >
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-gray-900"
              placeholder="ej: polar"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition text-gray-900"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <p className="text-center text-gray-500 text-xs mt-6">
          Datalitica &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
