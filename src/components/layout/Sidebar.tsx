"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Star,
  Swords,
  Ear,
  LogOut,
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { useAuth } from "./AuthProvider";
import { useClientData } from "@/lib/client-data";

const navigation = [
  { name: "Resumen", href: "/dashboard", icon: LayoutDashboard },
  { name: "Nuestras Marcas", href: "/marca", icon: Star },
  { name: "Competencia", href: "/competencia", icon: Swords },
  { name: "Escucha Activa", href: "/categoria", icon: Ear },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { selectedProductLine, setSelectedProductLine, productLineOptions, hasMultipleProductLines } = useClientData();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <svg viewBox="0 0 36 36" className="w-9 h-9 shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="17" stroke="#2dd4bf" strokeWidth="1.5" fill="#0f766e" fillOpacity="0.25" />
            <path d="M18 8a10 10 0 0 1 0 20" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
            <path d="M18 12a6 6 0 0 1 0 12" stroke="#5eead4" strokeWidth="2" strokeLinecap="round" />
            <circle cx="18" cy="18" r="2" fill="#2dd4bf" />
          </svg>
          <h1 className="text-sm font-semibold tracking-tight text-white leading-tight">
            Escucha Activa
            <span className="block text-[10px] font-normal text-slate-400 mt-0.5">de Clientes</span>
          </h1>
        </div>
      </div>

      {hasMultipleProductLines && (
        <div className="px-3 pt-4 pb-3 border-b border-slate-700/50">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2 px-3">Categoría</p>
          <div className="space-y-0.5">
            {productLineOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSelectedProductLine(opt.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedProductLine === opt.key
                    ? "bg-teal-600/20 text-teal-300"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="font-medium">{opt.brandName}</span>
                <span className="text-[10px] text-slate-500 ml-2">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-teal-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
        <div className="text-xs text-slate-400 mb-2 truncate">
          {user?.email}
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors w-full px-3 py-2 rounded-lg hover:bg-slate-800"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
