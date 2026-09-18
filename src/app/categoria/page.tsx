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
import { formatNumber, getTotalInteractions, networkColors } from "@/lib/mock-data";
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
  const { sovData, sentimentByBrand, mentionsByNetwork, ownBrands, competitors, brandColors, categoryTrends, networkIntelligence, competitorStrategies } = useClientData();
  const allBrands = [...ownBrands, ...competitors];

  const sovChartData = sovData.map((s) => ({
    ...s,
    fill: brandColors[s.brand] || "#64748b",
  }));

  const networkPieData = mentionsByNetwork.map((m) => ({
    ...m,
    color: networkColors[m.network.toLowerCase()] || "#6b7280",
  }));

  const availableNetworks = useMemo(() => {
    const nets = new Set<Network>();
    allBrands.forEach((b) => {
      (Object.keys(b.networks) as Network[]).forEach((n) => {
        if (b.networks[n]) nets.add(n);
      });
    });
    return Array.from(nets);
  }, [allBrands]);

  const networkLabelsMap: Record<string, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    linkedin: "LinkedIn",
    x: "X",
  };

  const sovByNetwork = useMemo(() => {
    const result: Record<string, { brand: string; interactions: number; fill: string }[]> = {};
    for (const net of availableNetworks) {
      const entries = allBrands
        .filter((b) => b.networks[net])
        .map((b) => ({
          brand: b.brand,
          interactions: getTotalInteractions(b, net),
          fill: brandColors[b.brand] || "#64748b",
        }))
        .sort((a, b) => b.interactions - a.interactions);

      const total = entries.reduce((s, e) => s + e.interactions, 0);
      result[net] = entries.map((e) => ({
        ...e,
        percentage: total > 0 ? Number(((e.interactions / total) * 100).toFixed(1)) : 0,
      }));
    }
    return result;
  }, [allBrands, availableNetworks, ownBrands, brandColors]);

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableNetworks.map((net) => {
            const data = sovByNetwork[net];
            if (!data || data.length === 0) return null;
            const chartData = data.map((d) => ({
              brand: d.brand,
              percentage: Math.round((d as Record<string, unknown>).percentage as number),
              interactions: d.interactions,
              fill: d.fill,
            }));

            return (
              <div key={net} className="rounded-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-gray-700">{networkLabelsMap[net] || net}</p>
                  <p className="text-[10px] text-gray-400">{chartData.length} marcas</p>
                </div>
                {chartData.length > 2 && (
                  <div className="flex h-6 rounded-full overflow-hidden mb-3">
                    {chartData.slice(0, 6).map((d, i) => (
                      <div
                        key={i}
                        className="h-full flex items-center justify-center text-white text-[9px] font-bold"
                        style={{ width: d.percentage + "%", minWidth: d.percentage > 5 ? 24 : 0, background: d.fill }}
                        title={`${d.brand}: ${d.percentage}%`}
                      >
                        {d.percentage >= 8 && `${d.percentage}%`}
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-1.5">
                  {chartData.map((d) => {
                    const isOwn = ownBrands.some((b) => b.brand === d.brand);
                    return (
                      <div key={d.brand} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.fill }} />
                          <span className={`text-xs ${isOwn ? "font-bold" : "font-medium"} text-gray-700`}>{d.brand}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] text-gray-400 tabular-nums">{formatNumber(d.interactions)}</span>
                          <span className="text-xs font-bold text-gray-900 tabular-nums w-8 text-right">{d.percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-gray-300 mt-4 leading-relaxed">
          Cálculo: total de interacciones de cada marca en cada plataforma, dividido por el total de la categoría en esa misma plataforma.
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
