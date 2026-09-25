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
import type { InnovationOpportunity, InnovationComment } from "@/lib/innovation-data";

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

function CommentsPopup({
  comments,
  onClose,
}: {
  comments: InnovationComment[];
  onClose: () => void;
}) {
  if (comments.length === 0) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/30 z-[99] md:hidden"
        onClick={onClose}
      />
      <div className="
        hidden md:block absolute top-4 right-0 translate-x-[calc(100%+8px)] w-[310px]
        bg-white dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2E2E34]
        rounded-xl shadow-lg p-3.5 z-[100]
      ">
        <div className="absolute top-6 -left-[7px] w-3 h-3 bg-white dark:bg-[#1F1F23] border-l border-b border-gray-200 dark:border-[#2E2E34] rotate-45" />
        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
          Comentarios reales
        </div>
        {comments.map((c, i) => (
          <div key={i} className="bg-gray-50 dark:bg-[#28282E] rounded-lg p-2.5 mb-1.5 border border-gray-100 dark:border-[#252529]">
            <div className="flex items-center gap-1.5 mb-1 text-[11px]">
              <span className="font-medium text-gray-500 dark:text-gray-400">{c.brand || "Usuario"}</span>
              {c.likes > 0 && (
                <span className="ml-auto text-gray-400 text-[11px]">{c.likes} likes</span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              &ldquo;{c.text.slice(0, 250)}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

function MobileCommentsSheet({
  comments,
  onClose,
}: {
  comments: InnovationComment[];
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-[99]" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1F1F23] border-t border-gray-200 dark:border-[#2E2E34] rounded-t-2xl shadow-2xl p-4 z-[100] max-h-[60vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 dark:bg-[#28282E] text-gray-500 flex items-center justify-center text-base"
        >
          &times;
        </button>
        <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-2">
          Comentarios reales
        </div>
        {comments.map((c, i) => (
          <div key={i} className="bg-gray-50 dark:bg-[#28282E] rounded-lg p-2.5 mb-1.5 border border-gray-100 dark:border-[#252529]">
            <div className="flex items-center gap-1.5 mb-1 text-[11px]">
              <span className="font-medium text-gray-500">{c.brand || "Usuario"}</span>
              {c.likes > 0 && (
                <span className="ml-auto text-gray-400 text-[11px]">{c.likes} likes</span>
              )}
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              &ldquo;{c.text.slice(0, 250)}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </>
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
  const [hovering, setHovering] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const total = opp.evidence + (opp.fase3 || 0);
  const hasComments = opp.comments && opp.comments.length > 0;
  const catLabel = opp.category.charAt(0).toUpperCase() + opp.category.slice(1);

  const catClass: Record<string, string> = {
    producto: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    estrategia: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    canal: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  };

  return (
    <div
      className="bg-white dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2E2E34] rounded-[14px] overflow-visible relative hover:shadow-md transition-shadow"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onClick={() => {
        if (window.innerWidth <= 768 && hasComments) {
          setMobileOpen(!mobileOpen);
        }
      }}
    >
      <div className="p-5 pb-0">
        <div className="flex justify-between items-start gap-3">
          <div className="flex gap-3 items-start flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-white shrink-0"
              style={{ backgroundColor: accentColor }}
            >
              {rank}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-tight">
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
            <div className="text-[22px] font-bold text-gray-900 dark:text-gray-100 tabular-nums">
              {total}
            </div>
            <div className="text-[9px] text-gray-400 uppercase tracking-wider">
              Menciones
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-5 pt-3.5 space-y-2.5">
        <div className="flex gap-2">
          <SignalSvg />
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
              Senal detectada
            </div>
            <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
              {opp.signal}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <GapSvg />
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
              Brecha competitiva
            </div>
            <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
              {opp.gap}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <BulbSvg />
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
              Oportunidad
            </div>
            <p className="text-[13px] text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed font-medium">
              {opp.opportunity}
            </p>
          </div>
        </div>

        {opp.brands.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {opp.brands.map(([name, count]) => (
              <span
                key={String(name)}
                className="text-[11px] bg-gray-100 dark:bg-[#28282E] text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-md"
              >
                {name}{" "}
                {typeof count === "number" && (
                  <strong className="text-gray-800 dark:text-gray-200 font-semibold">
                    ({count})
                  </strong>
                )}
              </span>
            ))}
          </div>
        )}
      </div>

      {hasComments && hovering && (
        <CommentsPopup comments={opp.comments} onClose={() => setHovering(false)} />
      )}
      {hasComments && mobileOpen && (
        <MobileCommentsSheet
          comments={opp.comments}
          onClose={() => setMobileOpen(false)}
        />
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
    <div className="bg-white dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2E2E34] rounded-[14px] p-5">
      {data.dimensions.map((dim, di) => {
        const vals = data.brands.map((_, bi) => data.data[di][bi]);
        const total = vals.reduce((a, b) => a + b, 0);
        if (!total) return null;
        return (
          <div key={dim} className="flex items-center gap-2.5 mb-2.5">
            <div className="text-xs text-gray-500 dark:text-gray-400 w-[110px] shrink-0 text-right max-sm:w-20 max-sm:text-[11px]">
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
          <div key={b} className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
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
      <div className="max-w-[920px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-[22px]"
            style={{
              background: activeTab === "perro"
                ? "linear-gradient(135deg,#C77D32,#C77D32cc)"
                : "linear-gradient(135deg,#6C4F9E,#6C4F9Ecc)",
            }}
          >
            💡
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              Radar de Innovacion
            </h1>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
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
                ? "text-white"
                : "bg-white dark:bg-[#1F1F23] text-gray-500 border border-gray-200 dark:border-[#2E2E34] hover:bg-gray-50 dark:hover:bg-[#28282E]"
            }`}
            style={activeTab === "perro" ? { backgroundColor: "#C77D32" } : {}}
          >
            Donkan (Perros)
          </button>
          <button
            onClick={() => setActiveTab("gato")}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === "gato"
                ? "text-white"
                : "bg-white dark:bg-[#1F1F23] text-gray-500 border border-gray-200 dark:border-[#2E2E34] hover:bg-gray-50 dark:hover:bg-[#28282E]"
            }`}
            style={activeTab === "gato" ? { backgroundColor: "#6C4F9E" } : {}}
          >
            DonKat (Gatos)
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3 mb-7">
          <div className="bg-white dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2E2E34] rounded-xl p-4">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
              Total analizado
            </div>
            <div className="text-[32px] font-bold text-gray-900 dark:text-gray-100 tabular-nums mt-0.5">
              10.601
            </div>
            <div className="text-[11px] text-gray-400">
              10.123 comentarios + 478 hallazgos cruzados
            </div>
          </div>
          <div className="bg-white dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2E2E34] rounded-xl p-4">
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">
              Marcas analizadas
            </div>
            <div className="text-[32px] font-bold text-gray-900 dark:text-gray-100 tabular-nums mt-0.5">
              10
            </div>
            <div className="text-[11px] text-gray-400">
              7 perros + 3 gatos en 4 plataformas
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="flex flex-col gap-3.5 mb-8">
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
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3.5">
          El producto ideal segun los consumidores
        </h2>
        <div className="bg-white dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2E2E34] rounded-[14px] p-6 mb-8">
          <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
            {ideal.map((it) => (
              <div
                key={it.n}
                className="flex gap-2.5 p-2.5 rounded-lg bg-gray-50 dark:bg-[#28282E] border border-gray-100 dark:border-[#252529]"
              >
                <div className="text-sm font-bold text-gray-400 w-6 text-center mt-0.5 shrink-0">
                  {it.n}
                </div>
                <div>
                  <div className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 mb-0.5">
                    {it.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 leading-snug">
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
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3.5">
          Mapa de quejas por marca
        </h2>
        <div className="mb-8">
          <BrandChart data={brandChart} brandLabel={brandLabel} />
        </div>

        {/* Methodology */}
        <div className="bg-gray-50 dark:bg-[#28282E] border border-gray-200 dark:border-[#2E2E34] rounded-xl p-4 text-xs text-gray-400 leading-relaxed space-y-1.5">
          <p>
            <span className="font-semibold text-gray-500 dark:text-gray-300">Fuentes:</span>{" "}
            10.123 comentarios de Instagram y Facebook (10 marcas de mascotas) + 478 hallazgos de X y Reddit filtrados por Colombia/espanol. Total: 10.601 registros analizados.
          </p>
          <p>
            <span className="font-semibold text-gray-500 dark:text-gray-300">Metodo:</span>{" "}
            Fase 2 (deteccion por keywords en comentarios) cruzada con Fase 3 (busqueda abierta con queries de innovacion). Confianza = validacion multiplataforma. Insights derivados de cruces entre categorias y patrones emergentes en comentarios reales.
          </p>
          <p>
            <span className="font-semibold text-gray-500 dark:text-gray-300">Nota:</span>{" "}
            Comentarios de consumidores reales en redes sociales de marcas colombianas. Septiembre 2026.
          </p>
        </div>
      </div>
    </ProtectedLayout>
  );
}
