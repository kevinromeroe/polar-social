"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Star,
  Swords,
  Ear,
  Lightbulb,
  LogOut,
  PawPrint,
  UtensilsCrossed,
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { useClientData } from "@/lib/client-data";

const alimentosLinks = [
  { name: "Escucha Activa", href: "/categoria", icon: Ear },
  { name: "Competencia", href: "/competencia", icon: Swords },
  { name: "Nuestras Marcas", href: "/marca", icon: Star },
];

const mascotasLinks = [
  { name: "Escucha Activa", href: "/categoria", icon: Ear },
  { name: "Competencia", href: "/competencia", icon: Swords },
  { name: "Radar Innovación", href: "/innovacion", icon: Lightbulb },
];

export function Sidebar() {
  const pathname = usePathname();
  const { selectedProductLine, setSelectedProductLine, productLineOptions, hasMultipleProductLines } = useClientData();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  const alimentosOptions = productLineOptions.filter(o => !o.key.startsWith("mascotas"));
  const mascotasOptions = productLineOptions.filter(o => o.key.startsWith("mascotas"));
  const hasMascotas = mascotasOptions.length > 0;
  const isMascotasActive = selectedProductLine.startsWith("mascotas");

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

      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-6">
        {/* Alimentos section */}
        <div>
          <div className="flex items-center gap-2 px-3 mb-2">
            <UtensilsCrossed className="h-3.5 w-3.5 text-slate-500" />
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Alimentos</p>
          </div>

          {hasMultipleProductLines && alimentosOptions.length > 1 && (
            <div className="flex gap-1 mx-2 mb-2 p-1 rounded-lg bg-slate-800/80">
              {alimentosOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => {
                    setSelectedProductLine(opt.key);
                    if (pathname === "/innovacion") {
                      router.push("/competencia");
                    }
                  }}
                  className={`flex-1 px-2 py-1.5 rounded-md text-xs font-semibold text-center transition-colors ${
                    selectedProductLine === opt.key
                      ? "bg-slate-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="space-y-0.5">
            {alimentosLinks.map((item) => {
              const isActive = pathname?.startsWith(item.href) && !isMascotasActive;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (isMascotasActive && alimentosOptions.length > 0) {
                      setSelectedProductLine(alimentosOptions[0].key);
                    }
                  }}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-teal-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Mascotas section */}
        {hasMascotas && (
          <div>
            <div className="flex items-center gap-2 px-3 mb-2">
              <PawPrint className="h-3.5 w-3.5 text-slate-500" />
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Mascotas</p>
            </div>

            {mascotasOptions.length > 1 && (
              <div className="flex gap-1 mx-2 mb-2 p-1 rounded-lg bg-slate-800/80">
                {mascotasOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSelectedProductLine(opt.key);
                      if (!pathname || (!mascotasLinks.some(l => pathname.startsWith(l.href)))) {
                        router.push("/competencia");
                      }
                    }}
                    className={`flex-1 px-2 py-1.5 rounded-md text-xs font-semibold text-center transition-colors ${
                      selectedProductLine === opt.key
                        ? "bg-slate-600 text-white shadow-sm"
                        : "text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-0.5">
              {mascotasLinks.map((item) => {
                const isActive = pathname?.startsWith(item.href) && isMascotasActive;
                return (
                  <Link
                    key={`mascotas-${item.name}`}
                    href={item.href}
                    onClick={() => {
                      if (!isMascotasActive && mascotasOptions.length > 0) {
                        setSelectedProductLine(mascotasOptions[0].key);
                      }
                    }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-teal-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-4.5 w-4.5 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-700/50">
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
