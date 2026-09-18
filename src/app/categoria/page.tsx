"use client";

import { useState, useMemo } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatNumber, networkColors } from "@/lib/mock-data";
import type { Network, NetworkIntelligence, CompetitorStrategy } from "@/lib/mock-data";
import { useClientData } from "@/lib/client-data";
import { FaInstagram, FaFacebookF, FaTiktok, FaLinkedinIn, FaXTwitter, FaRedditAlien } from "react-icons/fa6";

const networkIcons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  linkedin: FaLinkedinIn,
  x: FaXTwitter,
  reddit: FaRedditAlien,
};

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  dominante: { label: "Dominante", bg: "bg-emerald-100", text: "text-emerald-800" },
  competitivo: { label: "Competitivo", bg: "bg-blue-100", text: "text-blue-800" },
  rezagado: { label: "Rezagado", bg: "bg-amber-100", text: "text-amber-800" },
  ausente: { label: "Ausente", bg: "bg-red-100", text: "text-red-800" },
};

const threatConfig: Record<string, { label: string; color: string; bg: string }> = {
  critica: { label: "Prioridad crítica", color: "text-red-700", bg: "bg-red-50" },
  alta: { label: "Prioridad alta", color: "text-orange-700", bg: "bg-orange-50" },
  media: { label: "Prioridad media", color: "text-amber-700", bg: "bg-amber-50" },
  baja: { label: "Prioridad baja", color: "text-gray-600", bg: "bg-gray-50" },
};

const networkStatusDot: Record<string, string> = {
  domina: "bg-emerald-500",
  fuerte: "bg-blue-500",
  presente: "bg-amber-400",
  debil: "bg-orange-400",
  ausente: "bg-gray-300",
};

function NetworkIntelligenceCard({ intel }: { intel: NetworkIntelligence }) {
  const status = statusConfig[intel.panStatus];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white" style={{ background: intel.color }}>
              {networkIcons[intel.network] ? (() => { const Icon = networkIcons[intel.network]; return <Icon size={20} />; })() : <span className="text-sm font-bold">{intel.label[0]}</span>}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{intel.label}</h4>
              <p className="text-[11px] text-gray-400">{intel.totalBrands} marcas activas &middot; ER promedio {intel.categoryAvgER}%</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${status.bg} ${status.text}`}>
              P.A.N.: {status.label}
            </span>
            <p className="text-[10px] text-gray-400 mt-1">ER {intel.panER}% &middot; {formatNumber(intel.panFollowers)} seg.</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0 mt-0.5">L&iacute;der:</span>
            <div>
              <span className="text-xs font-semibold text-gray-900">{intel.leader.brand}</span>
              <span className="text-xs text-gray-500"> &middot; ER {intel.leader.er}% &middot; {formatNumber(intel.leader.followers)} seg.</span>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{intel.leader.secret}</p>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-800 leading-relaxed font-medium mb-3">{intel.keyInsight}</p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-teal-700 hover:text-teal-900 transition-colors"
        >
          {expanded ? "Ocultar detalle ▲" : "Ver formatos de contenido y recomendación ▼"}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Qu&eacute; funciona en {intel.label}</p>
              <div className="space-y-2">
                {intel.contentFormats.map((f, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-800">{f.format}</span>
                        <span className="text-xs text-gray-500">{f.share}% del contenido</span>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 mb-1">
                        <div className="rounded-full" style={{ width: f.share + "%", background: intel.color, opacity: 0.6 }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500">Avg. engagement: {formatNumber(f.avgEngagement)}</span>
                        <span className="text-[10px] text-gray-400">L&iacute;der: {f.topBrand}</span>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5 italic">&quot;{f.proof}&quot;</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
              <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider mb-1">Recomendaci&oacute;n para P.A.N.</p>
              <p className="text-xs text-teal-900 leading-relaxed">{intel.recommendation}</p>
            </div>

            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">Brecha actual</p>
              <p className="text-xs text-amber-900 leading-relaxed">{intel.panGap}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CompetitorCard({ competitor, brandColor }: { competitor: CompetitorStrategy; brandColor?: string }) {
  const threat = threatConfig[competitor.threatLevel];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border overflow-hidden ${competitor.threatLevel === "critica" ? "border-red-200" : "border-gray-200"}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold" style={{ color: brandColor || "#334155" }}>{competitor.brand}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${threat.bg} ${threat.color}`}>{threat.label}</span>
          </div>
          <div className="flex items-center gap-1">
            {competitor.networks.map((n) => (
              <div key={n.network} className="flex items-center gap-1" title={`${n.network}: ${n.status} (ER ${n.er}%)`}>
                <span className={`w-2 h-2 rounded-full ${networkStatusDot[n.status]}`} />
                <span className="text-[9px] text-gray-400">{n.network[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-1">{competitor.mainStrength}</p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[11px] font-semibold text-teal-700 hover:text-teal-900 transition-colors mt-1"
        >
          {expanded ? "Ocultar ▲" : "Ver estrategia, qué copiar y qué evitar ▼"}
        </button>

        {expanded && (
          <div className="mt-3 space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estrategia</p>
              <p className="text-xs text-gray-700 leading-relaxed">{competitor.strategy}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-100">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">Copiar</p>
                <p className="text-xs text-emerald-900 leading-relaxed mb-2">{competitor.toCopy.action}</p>
                <p className="text-[10px] text-emerald-700 italic">{competitor.toCopy.proof}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1">Evitar</p>
                <p className="text-xs text-red-900 leading-relaxed mb-2">{competitor.toAvoid.action}</p>
                <p className="text-[10px] text-red-700 italic">{competitor.toAvoid.proof}</p>
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {competitor.networks.map((n) => (
                <div key={n.network} className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-lg px-2.5 py-1.5">
                  <span className={`w-2 h-2 rounded-full ${networkStatusDot[n.status]}`} />
                  <span className="text-[11px] font-medium text-gray-700">{n.network}</span>
                  <span className="text-[10px] text-gray-400">ER {n.er}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EscuchaActivaPage() {
  const { sovData, sentimentByBrand, mentionsByNetwork, ownBrands, competitors, brandColors, categoryTrends, networkIntelligence, competitorStrategies, sovByNetwork: realSOVByNetwork } = useClientData();
  const allBrands = [...ownBrands, ...competitors];

  const sovChartData = sovData.map((s) => ({
    ...s,
    fill: brandColors[s.brand] || "#64748b",
  }));

  const networkPieData = mentionsByNetwork.map((m) => ({
    ...m,
    color: networkColors[m.network.toLowerCase()] || "#6b7280",
  }));

  const networkLabelsMap: Record<string, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    linkedin: "LinkedIn",
    x: "X",
  };

  const sovNetworks = useMemo(() =>
    Object.keys(realSOVByNetwork).filter(n => n !== "unknown").sort((a, b) => {
      const order = ["instagram", "facebook", "tiktok", "x", "linkedin"];
      return order.indexOf(a) - order.indexOf(b);
    }),
  [realSOVByNetwork]);

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Escucha Activa</h2>
        <p className="text-gray-500 text-sm mt-1">
          Qué dicen sobre las marcas y la categoría a nivel digital
        </p>
      </div>

      {/* Share of Voice por plataforma — compacto, enfocado en hallazgos */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Share of Voice por plataforma
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Quién domina la conversación en cada red — basado en interacciones reales
        </p>

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
                        <span className="text-[10px] text-gray-400">
                          {formatNumber(totalComments)} comentarios
                        </span>
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
              <div>
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
              </div>
            );
          }

          return <p className="text-xs text-gray-400 italic">Cargando datos de comentarios...</p>;
        })()}

        <p className="text-[10px] text-gray-300 mt-4 leading-relaxed">
          Basado en comentarios reales scrapeados. SOV = comentarios de la marca / total de comentarios en la categoría.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sentimiento por marca — barras más gruesas con % dentro */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Sentimiento por marca
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Clasificación por keywords y emojis
          </p>
          <div className="space-y-4">
            {sentimentByBrand.slice(0, 8).map((s) => (
              <div key={s.brand}>
                <p className="text-xs font-medium text-gray-700 mb-1.5"
                   style={{ color: brandColors[s.brand] || "#374151" }}
                >
                  {s.brand}
                </p>
                <div className="flex h-7 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ width: s.positive + "%", background: "#10b981" }}
                  >
                    {s.positive > 12 && `${s.positive}%`}
                  </div>
                  <div
                    className="flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ width: s.neutral + "%", background: "#f59e0b" }}
                  >
                    {s.neutral > 12 && `${s.neutral}%`}
                  </div>
                  <div
                    className="flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ width: s.negative + "%", background: "#ef4444" }}
                  >
                    {s.negative > 12 && `${s.negative}%`}
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

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Volumen de menciones por plataforma
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Dónde ocurren las conversaciones sobre la categoría
          </p>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="55%" height={280}>
              <PieChart>
                <Pie
                  data={networkPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={110}
                  paddingAngle={2}
                  dataKey="mentions"
                >
                  {networkPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    formatNumber(Number(value)),
                    "Menciones",
                  ]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3 flex-1">
              {networkPieData.map((n) => (
                <div
                  key={n.network}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ background: n.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {n.network}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 tabular-nums">{formatNumber(n.mentions)}</span>
                    <span className="text-sm font-bold text-gray-900 tabular-nums">
                      {Math.round(n.percentage)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tendencias de la categoría */}
      {categoryTrends.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Tendencias de la categoría
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            De qué habla la audiencia — temas principales identificados por escucha activa
          </p>
          <div className="space-y-3">
            {categoryTrends.map((t) => {
              const sentColor = t.sentiment === "positive" ? "#10b981" : t.sentiment === "negative" ? "#ef4444" : "#f59e0b";
              return (
                <div key={t.topic}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-800">{t.topic}</span>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: sentColor }} />
                    </div>
                    <span className="text-xs font-bold text-gray-900">{t.percentage}%</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 mb-1">
                    <div className="rounded-full" style={{ width: t.percentage + "%", background: sentColor, opacity: 0.7 }} />
                  </div>
                  <p className="text-[11px] text-gray-500 leading-snug">{t.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {networkIntelligence.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Inteligencia de contenido por red
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Qu&eacute; funciona en cada plataforma, qui&eacute;n lidera y qu&eacute; deber&iacute;a hacer P.A.N. &mdash; basado en datos reales de engagement
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {networkIntelligence.map((intel) => (
              <NetworkIntelligenceCard key={intel.network} intel={intel} />
            ))}
          </div>
          <p className="text-[10px] text-gray-300 mt-4 leading-relaxed">
            An&aacute;lisis basado en engagement rates, likes promedio y formatos de contenido de las 10 marcas monitoreadas. Los porcentajes de formato son estimaciones derivadas del an&aacute;lisis de contenido publicado.
          </p>
        </div>
      )}

      {competitorStrategies.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Mapa estrat&eacute;gico competitivo
          </h3>
          <p className="text-xs text-gray-400 mb-2">
            Qu&eacute; copiar y qu&eacute; evitar de cada competidor &mdash; inteligencia accionable para tu estrategia de contenido
          </p>
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> Domina
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> Fuerte
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> Presente
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-orange-400" /> D&eacute;bil
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-2 h-2 rounded-full bg-gray-300" /> Ausente
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {competitorStrategies.map((c) => (
              <CompetitorCard key={c.brand} competitor={c} brandColor={brandColors[c.brand]} />
            ))}
          </div>
          <p className="text-[10px] text-gray-300 mt-4 leading-relaxed">
            Nivel de prioridad calculado por combinaci&oacute;n de: tama&ntilde;o de audiencia, engagement rate, presencia multicanal y crecimiento. Recomendaciones basadas en an&aacute;lisis de contenido real publicado por cada marca.
          </p>
        </div>
      )}
    </ProtectedLayout>
  );
}
