"use client";

import { useState } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  dogOpportunities,
  catOpportunities,
  dogIdeal,
  catIdeal,
  dogBrandChart,
  catBrandChart,
} from "@/lib/innovation-data";
import type { InnovationOpportunity } from "@/lib/innovation-data";
import { ChevronDown, ChevronUp, MessageSquareQuote } from "lucide-react";

function SignalSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 text-amber-500 shrink-0 mt-0.5">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function GapSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-red-400 shrink-0 mt-0.5">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function BulbSvg() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5">
      <path d="M9 18h6M10 22h4M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </svg>
  );
}

function OpportunityCard({
  opp,
  rank,
  accentColor,
}: {
  opp: InnovationOpportunity;
  rank: number;
  accentColor: string;
}) {
  const [showComments, setShowComments] = useState(false);
  const total = opp.evidence + (opp.fase3 || 0);
  const hasComments = opp.comments && opp.comments.length > 0;
  const catLabel = opp.category.charAt(0).toUpperCase() + opp.category.slice(1);

  const catClass: Record<string, string> = {
    producto: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    estrategia: "bg-red-50 text-red-700 border border-red-200",
    canal: "bg-amber-50 text-amber-700 border border-amber-200",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex justify-between items-start gap-3 mb-3">
          <div className="flex gap-3 items-start flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {rank}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 leading-tight">
                {opp.title}
              </h3>
              <div className="flex flex-wrap gap-1.5 mt-1.5 items-center">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${catClass[opp.category] || catClass.producto}`}>
                  {catLabel}
                </span>
              </div>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-2xl font-bold text-gray-900" style={{ fontVariantNumeric: "tabular-nums" }}>
              {total}
            </div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wide">
              Menciones
            </div>
          </div>
        </div>

        <div className="space-y-3 mt-4">
          <div className="flex gap-2">
            <SignalSvg />
            <div>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                Senal detectada
              </span>
              <p className="text-sm text-gray-700 mt-0.5">{opp.signal}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <GapSvg />
            <div>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                Brecha competitiva
              </span>
              <p className="text-sm text-gray-700 mt-0.5">{opp.gap}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <BulbSvg />
            <div>
              <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">
                Oportunidad
              </span>
              <p className="text-sm text-gray-700 mt-0.5 font-medium">{opp.opportunity}</p>
            </div>
          </div>
        </div>

        {opp.brands.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {opp.brands.map(([name, count]) => (
              <span
                key={String(name)}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md"
              >
                {name}{" "}
                {typeof count === "number" && (
                  <span className="font-semibold text-gray-800">({count})</span>
                )}
              </span>
            ))}
          </div>
        )}

        {hasComments && (
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 mt-4 text-sm font-medium"
            style={{ color: accentColor }}
          >
            <MessageSquareQuote className="w-4 h-4" />
            {showComments ? "Ocultar" : "Ver"} comentarios ({opp.comments.length})
            {showComments ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {showComments && hasComments && (
        <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-4 rounded-b-xl">
          <div className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-2">
            Comentarios reales
          </div>
          <div className="space-y-2">
            {opp.comments.map((c, i) => (
              <div key={i} className="bg-white rounded-lg p-3 border border-gray-100 text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-700 text-xs">{c.brand || "Usuario"}</span>
                  {c.likes > 0 && (
                    <span className="text-xs text-gray-400 ml-auto">{c.likes} likes</span>
                  )}
                </div>
                <p className="text-gray-600 leading-relaxed text-xs">
                  &ldquo;{c.text.slice(0, 300)}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BrandChart({
  data,
  brandLabel,
}: {
  data: { dimensions: string[]; brands: string[]; colors: string[]; data: number[][] };
  brandLabel: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      {data.dimensions.map((dim, di) => {
        const vals = data.brands.map((_, bi) => data.data[di][bi]);
        const total = vals.reduce((a, b) => a + b, 0);
        if (!total) return null;
        return (
          <div key={dim} className="flex items-center gap-2.5 mb-2.5">
            <div className="text-xs text-gray-500 w-[110px] shrink-0 text-right max-sm:w-20 max-sm:text-[11px]">
              {dim}
            </div>
            <div className="flex-1 flex gap-0.5 h-6 rounded overflow-hidden">
              {data.brands.map((brand, bi) => {
                const v = data.data[di][bi];
                if (!v) return null;
                const pct = Math.max((v / total) * 100, 8);
                return (
                  <div
                    key={brand}
                    className="h-full flex items-center justify-center text-[10px] font-semibold text-white hover:opacity-85 transition-opacity"
                    style={{ width: `${pct}%`, background: data.colors[bi] }}
                    title={`${brand}: ${v}`}
                  >
                    <span className="whitespace-nowrap overflow-hidden text-ellipsis px-1">
                      {v}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2.5 mt-3.5 justify-center">
        {data.brands.map((b, i) => (
          <div key={b} className="flex items-center gap-1 text-[11px] text-gray-500">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ background: data.colors[i] }} />
            {b}
          </div>
        ))}
      </div>
      <div className="text-[11px] text-gray-400 text-center mt-2">
        Numero de quejas/menciones por dimension. {brandLabel} no aparece = cero quejas = oportunidad de entrada limpia.
      </div>
    </div>
  );
}

export default function InnovacionPage() {
  const [activeTab, setActiveTab] = useState<"perro" | "gato">("perro");

  const opportunities = activeTab === "perro" ? dogOpportunities : catOpportunities;
  const ideal = activeTab === "perro" ? dogIdeal : catIdeal;
  const brandChart = activeTab === "perro" ? dogBrandChart : catBrandChart;
  const accentColor = activeTab === "perro" ? "#C77D32" : "#6C4F9E";
  const brandLabel = activeTab === "perro" ? "Donkan" : "DonKat";

  return (
    <ProtectedLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{
              background: activeTab === "perro"
                ? "linear-gradient(135deg,#C77D32,#C77D32cc)"
                : "linear-gradient(135deg,#6C4F9E,#6C4F9Ecc)",
            }}
          >
            💡
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Radar de Innovacion
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Oportunidades de producto para {brandLabel}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          <button
            onClick={() => setActiveTab("perro")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "perro"
                ? "text-white shadow-md"
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
            style={activeTab === "perro" ? { backgroundColor: "#C77D32" } : {}}
          >
            Donkan (Perros)
          </button>
          <button
            onClick={() => setActiveTab("gato")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "gato"
                ? "text-white shadow-md"
                : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
            }`}
            style={activeTab === "gato" ? { backgroundColor: "#6C4F9E" } : {}}
          >
            DonKat (Gatos)
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
              Total analizado
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-0.5" style={{ fontVariantNumeric: "tabular-nums" }}>
              10.601
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              10.123 comentarios + 478 hallazgos cruzados
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="text-[10px] text-gray-500 uppercase tracking-wide font-medium">
              Marcas analizadas
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-0.5" style={{ fontVariantNumeric: "tabular-nums" }}>
              10
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              7 perros + 3 gatos en 4 plataformas
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="space-y-4 mb-8">
          {opportunities.map((opp, i) => (
            <OpportunityCard
              key={opp.id}
              opp={opp}
              rank={i + 1}
              accentColor={accentColor}
            />
          ))}
        </div>

        {/* Producto ideal */}
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          El producto ideal segun los consumidores
        </h2>
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
            {ideal.map((it) => (
              <div
                key={it.n}
                className="flex gap-2.5 p-3 rounded-lg bg-gray-50 border border-gray-100"
              >
                <div className="text-sm font-bold text-gray-400 w-6 text-center mt-0.5 shrink-0">
                  {it.n}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900 mb-0.5">
                    {it.title}
                  </div>
                  <div className="text-xs text-gray-500 leading-snug">
                    {it.desc}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {it.src}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Brand chart */}
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Mapa de quejas por marca
        </h2>
        <div className="mb-8">
          <BrandChart data={brandChart} brandLabel={brandLabel} />
        </div>

        {/* Methodology */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-xs text-gray-500 space-y-2">
          <p>
            <span className="font-medium text-gray-600">Fuentes:</span>{" "}
            10.123 comentarios de Instagram y Facebook (10 marcas de mascotas) + 478 hallazgos de X y Reddit filtrados por Colombia/espanol. Total: 10.601 registros analizados.
          </p>
          <p>
            <span className="font-medium text-gray-600">Metodo:</span>{" "}
            Fase 2 (deteccion por keywords en comentarios) cruzada con Fase 3 (busqueda abierta con queries de innovacion). Confianza = validacion multiplataforma. Insights derivados de cruces entre categorias y patrones emergentes en comentarios reales.
          </p>
          <p>
            <span className="font-medium text-gray-600">Nota:</span>{" "}
            Comentarios de consumidores reales en redes sociales de marcas colombianas. Septiembre 2026.
          </p>
        </div>
      </div>
    </ProtectedLayout>
  );
}
