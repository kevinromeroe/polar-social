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

const profileUrlBase: Record<string, string> = {
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/",
  tiktok: "https://www.tiktok.com/@",
  linkedin: "https://www.linkedin.com/company/",
  x: "https://x.com/",
};

const topicColors = ["#0d9488", "#6366f1", "#e11d48", "#ea580c", "#0284c7", "#7c3aed", "#ca8a04", "#059669"];

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
          <p className="text-xs text-gray-400 mt-1">Snapshot · sep 2026</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Engagement promedio</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{avgEngOwn.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-1">Snapshot · sep 2026</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Comentarios propios</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalMentions)}</p>
          <p className="text-xs text-gray-400 mt-1">Acumulado · jun–sep 2026</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Sentimiento neto</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">+{ownSentimentAvg}%</p>
          <p className="text-xs text-gray-400 mt-1">Acumulado · jun–sep 2026</p>
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
          {/* Presencia y métricas por red social — unificado */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Presencia en redes sociales
              </h3>
              <p className="text-xs text-gray-400">
                Snapshot · sep 2026 · {formatNumber(totalFollowers)} seguidores · {totalPosts} publicaciones
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {networkEntries.map(([net, metrics]) => {
                const Icon = networkIcons[net];
                const pct = (metrics.followers / totalFollowers) * 100;
                const profileUrl = metrics.username ? profileUrlBase[net] + metrics.username : undefined;
                const GrowthIcon = metrics.growth > 0 ? TrendingUp : metrics.growth < 0 ? TrendingDown : Minus;
                const growthColor = metrics.growth > 0 ? "text-emerald-600" : metrics.growth < 0 ? "text-red-500" : "text-gray-400";

                return (
                  <div key={net} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="h-1.5" style={{ background: networkColors[net] || "#6b7280" }} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white" style={{ background: networkColors[net] || "#6b7280" }}>
                            {Icon ? <Icon size={16} /> : <span className="text-[10px] font-bold">{net.slice(0, 2).toUpperCase()}</span>}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{networkLabels[net] || net}</p>
                            {metrics.username && (
                              <p className="text-[10px] text-gray-400">@{metrics.username}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{pct.toFixed(0)}%</span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Seguidores</p>
                          <p className="text-base font-bold text-gray-900">{formatNumber(metrics.followers)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Engagement</p>
                          <p className="text-base font-bold text-gray-900">{metrics.engagementRate}%</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Posts</p>
                          <p className="text-sm font-semibold text-gray-700">{metrics.posts}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-wide">Crecimiento</p>
                          <p className={`text-sm font-semibold flex items-center gap-1 ${growthColor}`}>
                            <GrowthIcon className="h-3.5 w-3.5" />
                            {metrics.growth > 0 ? "+" : ""}{metrics.growth}%
                          </p>
                        </div>
                      </div>

                      {profileUrl && (
                        <a
                          href={profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                          style={{ color: networkColors[net] || "#6b7280" }}
                        >
                          {Icon && <Icon size={12} />}
                          Ver perfil
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mapa de temas de la audiencia — mitad del ancho */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {brandTopics && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  De qué habla nuestra audiencia
                </h3>
                <p className="text-xs text-gray-400 mb-4">
                  Temas principales de <span className="font-semibold" style={{ color: brandColors[selectedBrand] || "#0d9488" }}>{selectedBrand}</span>
                </p>
                <div className="space-y-3">
                  {brandTopics.topics.map((topic, i) => {
                    const barColor = topicColors[i % topicColors.length];
                    return (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: barColor }} />
                            <span className="text-xs font-medium text-gray-800">{topic.topic}</span>
                          </div>
                          <span className="text-xs font-bold" style={{ color: barColor }}>{topic.percentage}%</span>
                        </div>
                        <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100 ml-[18px]">
                          <div className="rounded-full transition-all" style={{ width: topic.percentage + "%", background: barColor, opacity: 0.75 }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[10px] text-gray-300 mt-4 leading-relaxed">
                  Hallazgo · basado en análisis de contenido publicado (acumulado jun–sep 2026).
                </p>
              </div>
            )}

            {brandSentiment && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Sentimiento general
                </h3>
                <p className="text-xs text-gray-400 mb-5">
                  Qué dicen de <span className="font-semibold" style={{ color: brandColors[selectedBrand] || "#0d9488" }}>{selectedBrand}</span>
                </p>
                <div className="space-y-4">
                  {([
                    { label: "Positivo", value: brandSentiment.positive, color: "#10b981", textClass: "text-emerald-600" },
                    { label: "Neutro", value: brandSentiment.neutral, color: "#f59e0b", textClass: "text-amber-500" },
                    { label: "Negativo", value: brandSentiment.negative, color: "#ef4444", textClass: "text-red-500" },
                  ] as const).map((s) => (
                    <div key={s.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.color }} />
                          <span className="text-xs font-medium text-gray-700">{s.label}</span>
                        </div>
                        <span className={`text-sm font-bold ${s.textClass}`}>{s.value}%</span>
                      </div>
                      <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100 ml-[18px]">
                        <div className="rounded-full" style={{ width: s.value + "%", background: s.color, opacity: 0.8 }} />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-300 mt-4 leading-relaxed">
                  Hallazgo acumulado · jun–sep 2026. Clasificación por keywords y emojis en comentarios reales.
                </p>
              </div>
            )}
          </div>

          {/* Menciones por categoría de sentimiento */}
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">
                Qué dicen de{" "}
                <span style={{ color: brandColors[selectedBrand] || "#0d9488" }}>
                  {selectedBrand}
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Hallazgos · comentarios reales acumulados jun–sep 2026
              </p>
            </div>

            {brandSentiment && (
              <>
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
