"use client";

import { useState, useMemo, Component, type ReactNode } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import { formatNumber, networkColors } from "@/lib/mock-data";
import { useClientData } from "@/lib/client-data";
import { FaInstagram, FaFacebookF, FaTiktok, FaLinkedinIn, FaXTwitter, FaRedditAlien } from "react-icons/fa6";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div className="m-8 p-6 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-bold text-red-700">Error de renderizado</p>
          <p className="text-xs text-red-600 mt-2 font-mono">{this.state.error.message}</p>
          <pre className="text-[10px] text-red-500 mt-2 overflow-auto max-h-40">{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const networkIcons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  linkedin: FaLinkedinIn,
  x: FaXTwitter,
  reddit: FaRedditAlien,
};

const networkLabelsMap: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  x: "X",
  reddit: "Reddit",
};

const sentimentLabel: Record<string, string> = {
  positive: "Positivo",
  neutral: "Neutral",
  negative: "Negativo",
};

const sentimentColors: Record<string, { bg: string; text: string; dot: string }> = {
  positive: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  neutral: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  negative: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

const ITEMS_PER_PAGE = 15;

export default function EscuchaActivaPage() {
  const {
    sovData,
    sentimentByBrand,
    mentionsByNetwork,
    mentions,
    ownBrands,
    competitors,
    brandColors,
    sovByNetwork: realSOVByNetwork,
    dataStatus,
    dataError,
  } = useClientData();

  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [networkFilter, setNetworkFilter] = useState<string>("all");
  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const totalMentions = mentions.length;
  const positiveCount = mentions.filter((m) => m.sentiment === "positive").length;
  const negativeCount = mentions.filter((m) => m.sentiment === "negative").length;
  const netSentiment = totalMentions > 0 ? Math.round(((positiveCount - negativeCount) / totalMentions) * 100) : 0;

  const topNetwork = useMemo(() => {
    if (mentionsByNetwork.length === 0) return null;
    return mentionsByNetwork.reduce((prev, curr) => (curr.mentions > prev.mentions ? curr : prev));
  }, [mentionsByNetwork]);

  const topCelebran = useMemo(
    () =>
      [...mentions]
        .filter((m) => m.sentiment === "positive")
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 3),
    [mentions],
  );

  const topCritican = useMemo(
    () =>
      [...mentions]
        .filter((m) => m.sentiment === "negative")
        .sort((a, b) => (b.likes || 0) - (a.likes || 0))
        .slice(0, 3),
    [mentions],
  );

  const allBrands = useMemo(() => {
    const set = new Set(mentions.map((m) => m.brand));
    return Array.from(set).sort();
  }, [mentions]);

  const allNetworks = useMemo(() => {
    const set = new Set(mentions.map((m) => m.network.toLowerCase()));
    return Array.from(set).sort();
  }, [mentions]);

  const filteredMentions = useMemo(() => {
    let filtered = mentions;
    if (sentimentFilter !== "all") filtered = filtered.filter((m) => m.sentiment === sentimentFilter);
    if (networkFilter !== "all") filtered = filtered.filter((m) => m.network.toLowerCase() === networkFilter);
    if (brandFilter !== "all") filtered = filtered.filter((m) => m.brand === brandFilter);
    return filtered;
  }, [mentions, sentimentFilter, networkFilter, brandFilter]);

  const sovNetworks = useMemo(
    () =>
      Object.keys(realSOVByNetwork)
        .filter((n) => n !== "unknown")
        .sort((a, b) => {
          const order = ["instagram", "facebook", "tiktok", "x", "reddit", "linkedin"];
          return (order.indexOf(a) === -1 ? 99 : order.indexOf(a)) - (order.indexOf(b) === -1 ? 99 : order.indexOf(b));
        }),
    [realSOVByNetwork],
  );

  return (
    <ErrorBoundary>
    <ProtectedLayout>
      {dataStatus === "loading" && (
        <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
          <span className="text-sm text-blue-700">Cargando datos reales de Supabase...</span>
        </div>
      )}
      {dataStatus === "error" && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-700">Error cargando datos</p>
          <p className="text-xs text-red-600 mt-1">{dataError}</p>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Escucha Activa</h2>
        <p className="text-gray-500 text-sm mt-1">Conversaciones reales sobre tus marcas — qué celebran, qué critican, dónde hablan</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total comentarios</p>
          <p className="text-2xl font-extrabold text-gray-900 mt-1">{formatNumber(totalMentions)}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {formatNumber(positiveCount)} positivos · {formatNumber(negativeCount)} negativos
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sentimiento neto</p>
          <p className={`text-2xl font-extrabold mt-1 ${netSentiment >= 0 ? "text-emerald-600" : "text-red-600"}`}>
            {netSentiment >= 0 ? "+" : ""}
            {netSentiment}%
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">(positivos − negativos) / total</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Red más activa</p>
          {topNetwork ? (
            <>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{networkLabelsMap[topNetwork.network.toLowerCase()] || topNetwork.network}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{formatNumber(topNetwork.mentions)} comentarios · {Math.round(topNetwork.percentage)}% del total</p>
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-1">Cargando...</p>
          )}
        </div>
      </div>

      {/* Lo que más celebran / Lo que más critican */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-semibold text-gray-900">Lo que más celebran</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Top comentarios positivos con más interacción</p>
          {topCelebran.length > 0 ? (
            <div className="space-y-3">
              {topCelebran.map((m) => {
                const NetIcon = networkIcons[m.network.toLowerCase()];
                return (
                  <div key={m.id} className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                    <p className="text-sm text-emerald-900 leading-relaxed">&ldquo;{m.text.length > 200 ? m.text.slice(0, 200) + "…" : m.text}&rdquo;</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-emerald-600">
                      {NetIcon && <NetIcon size={10} />}
                      <span className="font-semibold">{m.author}</span>
                      <span>·</span>
                      <span className="font-semibold" style={{ color: brandColors[m.brand] || "#0d9488" }}>{m.brand}</span>
                      {m.likes > 0 && (
                        <>
                          <span>·</span>
                          <span>♥ {formatNumber(m.likes)}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Sin comentarios positivos aún</p>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <h3 className="text-sm font-semibold text-gray-900">Lo que más critican</h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">Top comentarios negativos — oportunidades de mejora</p>
          {topCritican.length > 0 ? (
            <div className="space-y-3">
              {topCritican.map((m) => {
                const NetIcon = networkIcons[m.network.toLowerCase()];
                return (
                  <div key={m.id} className="bg-red-50 border border-red-100 rounded-lg p-3">
                    <p className="text-sm text-red-900 leading-relaxed">&ldquo;{m.text.length > 200 ? m.text.slice(0, 200) + "…" : m.text}&rdquo;</p>
                    <div className="flex items-center gap-2 mt-2 text-[10px] text-red-600">
                      {NetIcon && <NetIcon size={10} />}
                      <span className="font-semibold">{m.author}</span>
                      <span>·</span>
                      <span className="font-semibold" style={{ color: brandColors[m.brand] || "#dc2626" }}>{m.brand}</span>
                      {m.likes > 0 && (
                        <>
                          <span>·</span>
                          <span>♥ {formatNumber(m.likes)}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">Sin comentarios negativos aún</p>
          )}
        </div>
      </div>

      {/* Sentimiento por marca */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Sentimiento por marca</h3>
        <p className="text-xs text-gray-400 mb-4">Clasificación por keywords y emojis</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
          {sentimentByBrand.slice(0, 8).map((s) => (
            <div key={s.brand}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color: brandColors[s.brand] || "#374151" }}>
                  {s.brand}
                </span>
                <span className="text-[10px] text-gray-400">
                  +{s.positive}% / −{s.negative}%
                </span>
              </div>
              <div className="flex h-5 rounded-md overflow-hidden">
                <div className="flex items-center justify-center text-white text-[9px] font-bold" style={{ width: s.positive + "%", background: "#10b981" }}>
                  {s.positive > 15 && `${s.positive}%`}
                </div>
                <div className="flex items-center justify-center text-white text-[9px] font-bold" style={{ width: s.neutral + "%", background: "#f59e0b" }}>
                  {s.neutral > 15 && `${s.neutral}%`}
                </div>
                <div className="flex items-center justify-center text-white text-[9px] font-bold" style={{ width: s.negative + "%", background: "#ef4444" }}>
                  {s.negative > 15 && `${s.negative}%`}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Positivo
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Neutral
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            Negativo
          </span>
        </div>
      </div>

      {/* SOV por plataforma */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Share of Voice por plataforma</h3>
        <p className="text-xs text-gray-400 mb-4">Quién domina la conversación en cada red — basado en interacciones reales</p>

        {(() => {
          const networksToShow = sovNetworks.length > 0 ? sovNetworks : [];
          const hasNetworkData = networksToShow.length > 0;

          if (hasNetworkData) {
            return (
              <div className="space-y-5">
                {networksToShow.map((net) => {
                  const entries = realSOVByNetwork[net];
                  if (!entries || entries.length === 0) return null;
                  const NetIcon = networkIcons[net];
                  const totalComments = entries.reduce((s, e) => s + e.comments, 0);
                  const maxComments = Math.max(...entries.map((e) => e.comments), 1);

                  return (
                    <div key={net}>
                      <div className="flex items-center gap-2 mb-2">
                        {NetIcon && <NetIcon size={14} className="text-gray-500" />}
                        <span className="text-xs font-bold" style={{ color: networkColors[net] || "#6b7280" }}>
                          {networkLabelsMap[net] || net}
                        </span>
                        <span className="text-[10px] text-gray-400">{formatNumber(totalComments)} comentarios</span>
                      </div>
                      <div className="rounded-lg border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-gray-100 bg-gray-50">
                              <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-1.5 pl-3 pr-1 w-6">#</th>
                              <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-1.5 px-2">Marca</th>
                              <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-1.5 px-2 text-right w-20">Comentarios</th>
                              <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-1.5 px-2 text-right w-14">SOV</th>
                              <th className="py-1.5 px-3 w-[35%]"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {entries.map((e, i) => {
                              const isOwn = ownBrands.some((b) => b.brand === e.brand);
                              const barW = maxComments > 0 ? Math.max((e.comments / maxComments) * 100, 1) : 1;
                              return (
                                <tr key={e.brand} className={`border-b border-gray-50 last:border-0 ${isOwn ? "bg-teal-50/40" : ""}`}>
                                  <td className="text-[10px] text-gray-400 tabular-nums py-1.5 pl-3 pr-1">{i + 1}</td>
                                  <td className="py-1.5 px-2">
                                    <span className={`text-xs ${isOwn ? "font-bold text-teal-700" : "font-medium text-gray-700"}`}>{e.brand}</span>
                                  </td>
                                  <td className="text-xs tabular-nums text-gray-600 py-1.5 px-2 text-right font-medium">{formatNumber(e.comments)}</td>
                                  <td className="text-xs tabular-nums font-bold text-gray-900 py-1.5 px-2 text-right">{e.percentage}%</td>
                                  <td className="py-1.5 px-3">
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full rounded-full" style={{ width: barW + "%", background: brandColors[e.brand] || "#64748b" }} />
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          }

          if (sovData.length > 0) {
            const maxMentions = Math.max(...sovData.map((s) => s.mentions), 1);
            return (
              <div className="rounded-lg border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-1.5 pl-3 pr-1 w-6">#</th>
                      <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-1.5 px-2">Marca</th>
                      <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-1.5 px-2 text-right w-20">Comentarios</th>
                      <th className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide py-1.5 px-2 text-right w-14">SOV</th>
                      <th className="py-1.5 px-3 w-[35%]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sovData.map((s, i) => {
                      const isOwn = ownBrands.some((b) => b.brand === s.brand);
                      const barW = maxMentions > 0 ? Math.max((s.mentions / maxMentions) * 100, 1) : 1;
                      return (
                        <tr key={s.brand} className={`border-b border-gray-50 last:border-0 ${isOwn ? "bg-teal-50/40" : ""}`}>
                          <td className="text-[10px] text-gray-400 tabular-nums py-1.5 pl-3 pr-1">{i + 1}</td>
                          <td className="py-1.5 px-2">
                            <span className={`text-xs ${isOwn ? "font-bold text-teal-700" : "font-medium text-gray-700"}`}>{s.brand}</span>
                          </td>
                          <td className="text-xs tabular-nums text-gray-600 py-1.5 px-2 text-right font-medium">{formatNumber(s.mentions)}</td>
                          <td className="text-xs tabular-nums font-bold text-gray-900 py-1.5 px-2 text-right">{s.percentage}%</td>
                          <td className="py-1.5 px-3">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: barW + "%", background: brandColors[s.brand] || "#64748b" }} />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }

          return <p className="text-xs text-gray-400 italic">Cargando datos de comentarios...</p>;
        })()}

        <p className="text-[10px] text-gray-300 mt-4 leading-relaxed">
          Basado en comentarios reales scrapeados. SOV = comentarios de la marca / total de comentarios en la categoría.
        </p>
      </div>

      {/* Feed de conversaciones */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Conversaciones</h3>
        <p className="text-xs text-gray-400 mb-4">Todos los comentarios capturados — filtra por sentimiento, red o marca</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {/* Sentiment filter */}
          {["all", "positive", "neutral", "negative"].map((s) => {
            const label = s === "all" ? "Todos" : sentimentLabel[s];
            const count = s === "all" ? mentions.length : mentions.filter((m) => m.sentiment === s).length;
            const active = sentimentFilter === s;
            return (
              <button
                key={s}
                onClick={() => {
                  setSentimentFilter(s);
                  setVisibleCount(ITEMS_PER_PAGE);
                }}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  active ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                }`}
              >
                {label} <span className="font-normal opacity-70">({formatNumber(count)})</span>
              </button>
            );
          })}

          <span className="w-px h-6 bg-gray-200 self-center mx-1" />

          {/* Network filter */}
          <select
            value={networkFilter}
            onChange={(e) => {
              setNetworkFilter(e.target.value);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            className="text-xs font-medium text-gray-700 border border-gray-200 rounded-full px-3 py-1.5 bg-white"
          >
            <option value="all">Todas las redes</option>
            {allNetworks.map((n) => (
              <option key={n} value={n}>
                {networkLabelsMap[n] || n}
              </option>
            ))}
          </select>

          {/* Brand filter */}
          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(e.target.value);
              setVisibleCount(ITEMS_PER_PAGE);
            }}
            className="text-xs font-medium text-gray-700 border border-gray-200 rounded-full px-3 py-1.5 bg-white"
          >
            <option value="all">Todas las marcas</option>
            {allBrands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <p className="text-[10px] text-gray-400 mb-3">
          Mostrando {Math.min(visibleCount, filteredMentions.length)} de {formatNumber(filteredMentions.length)} comentarios
        </p>

        {/* Comment list */}
        <div className="space-y-2">
          {filteredMentions.slice(0, visibleCount).map((m) => {
            const sent = sentimentColors[m.sentiment];
            const NetIcon = networkIcons[m.network.toLowerCase()];
            return (
              <div key={m.id} className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: networkColors[m.network.toLowerCase()] || "#6b7280" }}
                  >
                    {NetIcon ? <NetIcon size={14} /> : m.network[0]?.toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-gray-800">{m.author}</span>
                    <span className="text-[10px] text-gray-400">{networkLabelsMap[m.network.toLowerCase()] || m.network}</span>
                    <span
                      className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ color: brandColors[m.brand] || "#374151", background: (brandColors[m.brand] || "#374151") + "15" }}
                    >
                      {m.brand}
                    </span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${sent.bg} ${sent.text}`}>{sentimentLabel[m.sentiment]}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{m.text}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-400">
                    <span>{m.date}</span>
                    {m.likes > 0 && <span>♥ {formatNumber(m.likes)}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {visibleCount < filteredMentions.length && (
          <button
            onClick={() => setVisibleCount((prev) => prev + ITEMS_PER_PAGE)}
            className="w-full mt-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
          >
            Ver más comentarios ({formatNumber(filteredMentions.length - visibleCount)} restantes)
          </button>
        )}
      </div>

      <p className="text-[10px] text-gray-300 mb-6 leading-relaxed">
        Fuentes: comentarios reales de Facebook, Instagram, X y Reddit · Sentimiento: clasificación por keywords y emojis · Nota: los porcentajes se calculan sobre el total de comentarios analizados.
      </p>
    </ProtectedLayout>
    </ErrorBoundary>
  );
}
