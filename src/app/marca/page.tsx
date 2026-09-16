"use client";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  networkLabels,
  networkColors,
  formatNumber,
  getTotalFollowers,
  getAvgEngagement,
} from "@/lib/mock-data";
import type { BrandData, Network } from "@/lib/mock-data";
import { useClientData } from "@/lib/client-data";
import {
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaTiktok, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

const networkIcons: Record<string, React.ComponentType<{ className?: string; size?: number; color?: string }>> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  linkedin: FaLinkedinIn,
  x: FaXTwitter,
};

function NetworkCard({
  network,
  metrics,
}: {
  network: string;
  metrics: { followers: number; posts: number; engagementRate: number; growth: number; avgLikes: number; avgComments: number };
}) {
  const GrowthIcon =
    metrics.growth > 0 ? TrendingUp : metrics.growth < 0 ? TrendingDown : Minus;
  const growthColor =
    metrics.growth > 0
      ? "text-emerald-600"
      : metrics.growth < 0
        ? "text-red-500"
        : "text-gray-400";

  const Icon = networkIcons[network];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
          style={{ background: networkColors[network] || "#6b7280" }}
        >
          {Icon ? <Icon size={18} /> : <span className="text-xs font-bold">{network.slice(0, 2).toUpperCase()}</span>}
        </div>
        <p className="text-sm font-semibold text-gray-900">
          {networkLabels[network] || network}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
            Seguidores
          </p>
          <p className="text-lg font-bold text-gray-900">
            {formatNumber(metrics.followers)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
            Engagement
          </p>
          <p className="text-lg font-bold text-gray-900">
            {metrics.engagementRate}%
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
            Posts
          </p>
          <p className="text-sm font-semibold text-gray-700">
            {metrics.posts}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-gray-400 uppercase tracking-wide">
            Crecimiento
          </p>
          <p className={`text-sm font-semibold flex items-center gap-1 ${growthColor}`}>
            <GrowthIcon className="h-3.5 w-3.5" />
            {metrics.growth > 0 ? "+" : ""}
            {metrics.growth}%
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MarcaPage() {
  const { ownBrands, mentions, sentimentByBrand, sentimentCategorySummaries, brandColors, brandTopicMaps, clientDescription, sovData } = useClientData();

  const totalFollowersOwn = ownBrands.reduce((s, b) => s + getTotalFollowers(b), 0);
  const avgEngOwn = ownBrands.length > 0
    ? ownBrands.reduce((s, b) => s + getAvgEngagement(b), 0) / ownBrands.length
    : 0;
  const totalMentions = sovData
    .filter((s) => ownBrands.some((b) => b.brand === s.brand))
    .reduce((s, d) => s + d.mentions, 0);
  const ownSentimentData = sentimentByBrand.filter((s) => ownBrands.some((b) => b.brand === s.brand));
  const ownSentimentAvg = ownSentimentData.length > 0
    ? Math.round(ownSentimentData.reduce((sum, s) => sum + s.positive - s.negative, 0) / ownSentimentData.length)
    : 0;

  const [selectedBrand, setSelectedBrand] = useState(ownBrands[0]?.brand ?? "");

  useEffect(() => {
    if (ownBrands.length > 0 && !ownBrands.some(b => b.brand === selectedBrand)) {
      setSelectedBrand(ownBrands[0].brand);
    }
  }, [ownBrands, selectedBrand]);

  const currentBrand = ownBrands.find((b) => b.brand === selectedBrand);
  const brandMentions = mentions.filter((m) => m.brand === selectedBrand);
  const brandSentiment = sentimentByBrand.find(
    (s) => s.brand === selectedBrand
  );
  const brandTopics = brandTopicMaps.find((t) => t.brand === selectedBrand);

  const networkEntries = currentBrand
    ? (Object.entries(currentBrand.networks) as [Network, NonNullable<BrandData["networks"][Network]>][]).filter(
        ([, v]) => v != null
      )
    : [];

  const totalFollowers = networkEntries.reduce((sum, [, m]) => sum + m.followers, 0);
  const totalPosts = networkEntries.reduce((sum, [, m]) => sum + m.posts, 0);

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Nuestras Marcas</h2>
        <p className="text-gray-500 text-sm mt-1">
          Desempeño y escucha — {clientDescription}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Seguidores totales</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalFollowersOwn)}</p>
          <p className="text-xs text-gray-400 mt-1">Marcas propias, todas las redes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Engagement promedio</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{avgEngOwn.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-1">Últimos 30 días</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Menciones propias</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalMentions)}</p>
          <p className="text-xs text-gray-400 mt-1">Veces que se mencionan nuestras marcas</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Sentimiento neto</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">+{ownSentimentAvg}%</p>
          <p className="text-xs text-gray-400 mt-1">% positivo menos % negativo</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {ownBrands.map((b) => {
          const isActive = selectedBrand === b.brand;
          const color = brandColors[b.brand] || "#0d9488";
          return (
            <button
              key={b.brand}
              onClick={() => setSelectedBrand(b.brand)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "text-white"
                  : "bg-white border border-gray-200 hover:bg-gray-50"
              }`}
              style={isActive ? { background: color } : { color }}
            >
              {b.brand}
            </button>
          );
        })}
      </div>

      {currentBrand && (
        <div className="space-y-6">
          {/* Distribución por plataforma — horizontal */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Presencia por plataforma
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              <span className="font-semibold" style={{ color: brandColors[selectedBrand] || "#0d9488" }}>{selectedBrand}</span> tiene {formatNumber(totalFollowers)} seguidores en {networkEntries.length} redes y {totalPosts} publicaciones
            </p>
            <div className="flex items-center gap-1 h-8 rounded-lg overflow-hidden">
              {networkEntries.map(([net, metrics]) => {
                const pct = (metrics.followers / totalFollowers) * 100;
                const Icon = networkIcons[net];
                return (
                  <div
                    key={net}
                    className="h-full flex items-center justify-center gap-1.5 px-2 text-white text-[10px] font-medium relative group"
                    style={{ width: pct + "%", minWidth: 40, background: networkColors[net] || "#6b7280" }}
                    title={`${networkLabels[net]}: ${formatNumber(metrics.followers)} (${pct.toFixed(0)}%)`}
                  >
                    {Icon && <Icon size={12} />}
                    <span>{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {networkEntries.map(([net, metrics]) => {
                const Icon = networkIcons[net];
                return (
                  <div key={net} className="flex items-center gap-1.5 text-xs text-gray-500">
                    {Icon && <Icon size={12} color={networkColors[net]} />}
                    <span>{networkLabels[net]}</span>
                    <span className="font-semibold text-gray-700">{formatNumber(metrics.followers)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Métricas por red social */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Métricas por red social
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {networkEntries.map(([net, metrics]) => (
                <NetworkCard key={net} network={net} metrics={metrics} />
              ))}
            </div>
          </div>

          {/* Mapa de temas de la audiencia */}
          {brandTopics && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                De qué habla nuestra audiencia
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Temas principales del contenido de <span className="font-semibold" style={{ color: brandColors[selectedBrand] || "#0d9488" }}>{selectedBrand}</span> — qué genera conversación en la categoría
              </p>
              <div className="space-y-4">
                {brandTopics.topics.map((topic, i) => {
                  const barColor = brandColors[selectedBrand] || "#0d9488";
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-800">{topic.topic}</span>
                        <span className="text-sm font-bold" style={{ color: barColor }}>{topic.percentage}%</span>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                        <div
                          className="rounded-full transition-all"
                          style={{ width: topic.percentage + "%", background: barColor, opacity: 0.7 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-300 mt-4 leading-relaxed">
                Distribución temática basada en análisis de contenido publicado. Los porcentajes indican la proporción de publicaciones dedicadas a cada tema.
              </p>
            </div>
          )}

          {/* Sentimiento + menciones por categoría */}
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Qué dicen de{" "}
                <span style={{ color: brandColors[selectedBrand] || "#0d9488" }}>
                  {selectedBrand}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Menciones encontradas por búsqueda de keywords (earned media)
              </p>
            </div>

            {brandSentiment && (
              <>
                {/* Tarjeta resumen de sentimiento */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sentimiento general</p>
                  </div>
                  <div className="flex h-8 rounded-lg overflow-hidden mb-4">
                    <div
                      className="flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: brandSentiment.positive + "%", background: "#10b981" }}
                    >
                      {brandSentiment.positive > 10 && `${brandSentiment.positive}%`}
                    </div>
                    <div
                      className="flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: brandSentiment.neutral + "%", background: "#f59e0b" }}
                    >
                      {brandSentiment.neutral > 10 && `${brandSentiment.neutral}%`}
                    </div>
                    <div
                      className="flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: brandSentiment.negative + "%", background: "#ef4444" }}
                    >
                      {brandSentiment.negative > 10 && `${brandSentiment.negative}%`}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-1.5">
                        <span className="text-lg">+</span>
                      </div>
                      <p className="text-xl font-bold text-emerald-600">{brandSentiment.positive}%</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Positivo</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-1.5">
                        <span className="text-lg">=</span>
                      </div>
                      <p className="text-xl font-bold text-amber-500">{brandSentiment.neutral}%</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Neutro</p>
                    </div>
                    <div className="text-center">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-1.5">
                        <span className="text-lg">&minus;</span>
                      </div>
                      <p className="text-xl font-bold text-red-500">{brandSentiment.negative}%</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Negativo</p>
                    </div>
                  </div>
                </div>

                {/* Categorías de sentimiento */}
                <div className="space-y-4">
                  {(
                    [
                      { key: "positive" as const, label: "Positivo", accentColor: "#10b981", bgClass: "bg-emerald-50", textClass: "text-emerald-700", borderClass: "border-emerald-200" },
                      { key: "neutral" as const, label: "Neutro", accentColor: "#f59e0b", bgClass: "bg-amber-50", textClass: "text-amber-700", borderClass: "border-amber-200" },
                      { key: "negative" as const, label: "Negativo", accentColor: "#ef4444", bgClass: "bg-red-50", textClass: "text-red-700", borderClass: "border-red-200" },
                    ] as const
                  ).map(({ key, label, accentColor, bgClass, textClass, borderClass }) => {
                    const summary = sentimentCategorySummaries[selectedBrand]?.[key];
                    const categoryMentions = brandMentions.filter((m) => m.sentiment === key);
                    return (
                      <div key={key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="flex items-stretch">
                          <div className="w-1.5 shrink-0" style={{ background: accentColor }} />
                          <div className="flex-1 p-5">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${bgClass} ${textClass}`}>
                                {label}
                              </span>
                              <span className="text-xs text-gray-400">{categoryMentions.length} menciones</span>
                            </div>
                            {summary && (
                              <p className="text-sm text-gray-600 mb-4 leading-relaxed">{summary}</p>
                            )}
                            {categoryMentions.length > 0 ? (
                              <div className="space-y-3">
                                {categoryMentions.slice(0, 3).map((m) => {
                                  const Icon = networkIcons[m.network.toLowerCase()];
                                  return (
                                    <div key={m.id} className={`rounded-lg p-4 ${bgClass} border ${borderClass}`}>
                                      <p className="text-sm text-gray-800 leading-relaxed italic">
                                        &ldquo;{m.text}&rdquo;
                                      </p>
                                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200/50">
                                        <div className="flex items-center gap-2">
                                          {Icon && (
                                            <span className="w-5 h-5 rounded flex items-center justify-center text-white" style={{ background: networkColors[m.network.toLowerCase()] || "#6b7280" }}>
                                              <Icon size={10} />
                                            </span>
                                          )}
                                          <span className="text-xs font-medium text-gray-700">{m.author}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                          {m.likes > 0 && <span className="text-[10px] text-gray-500">{formatNumber(m.likes)} me gusta</span>}
                                          <span className="text-[10px] text-gray-400">{m.date}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-400">Sin menciones en esta categoría.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
