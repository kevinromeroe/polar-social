"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";
import { Sidebar } from "./Sidebar";

export function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <main className="pl-64">
        <div className="p-8">
          {children}
          <div className="mt-10 pt-4 border-t border-gray-200">
            <p className="text-[10px] text-gray-300 leading-relaxed">
              Datos correspondientes al periodo junio – septiembre 2026. Actualización quincenal. Plataforma de escucha activa operada por Datalitica.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
