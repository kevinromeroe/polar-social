"use client";

import { useState, useEffect } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  networkLabels,
  networkColors,
  formatNumber,
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
  const { ownBrands, topPosts, mentions, growthTrend, sentimentByBrand, clientDescription } = useClientData();

  const [selectedBrand, setSelectedBrand] = useState(ownBrands[0]?.brand ?? "");

  useEffect(() => {
    if (ownBrands.length > 0 && !ownBrands.some(b => b.brand === selectedBrand)) {
      setSelectedBrand(ownBrands[0].brand);
    }
  }, [ownBrands, selectedBrand]);

  const currentBrand = ownBrands.find((b) => b.brand === selectedBrand);
  const brandTopPosts = topPosts.filter((p) => p.brand === selectedBrand);
  const brandMentions = mentions.filter((m) => m.brand === selectedBrand);
  const brandSentiment = sentimentByBrand.find(
    (s) => s.brand === selectedBrand
  );

  const networkEntries = currentBrand
    ? (Object.entries(currentBrand.networks) as [Network, NonNullable<BrandData["networks"][Network]>][]).filter(
        ([, v]) => v != null
      )
    : [];

  const totalFollowers = networkEntries.reduce((sum, [, m]) => sum + m.followers, 0);
  const totalPosts = networkEntries.reduce((sum, [, m]) => sum + m.posts, 0);

  const lineColors = ["#0d9488", "#6366f1", "#f59e0b", "#ef4444"];
  const ownBrandNames = ownBrands.map((b) => b.brand);

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Nuestras Marcas</h2>
        <p className="text-gray-500 text-sm mt-1">
          Desempeño y escucha — {clientDescription}
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {ownBrands.map((b) => (
          <button
            key={b.brand}
            onClick={() => setSelectedBrand(b.brand)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedBrand === b.brand
                ? "bg-teal-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {b.brand}
          </button>
        ))}
      </div>

      {currentBrand && (
        <div className="space-y-6">
          {/* Distribución por plataforma — horizontal */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Presencia por plataforma
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              {selectedBrand} tiene {formatNumber(totalFollowers)} seguidores en {networkEntries.length} redes y {totalPosts} publicaciones
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

          {/* Evolución de seguidores — mensual, todas las marcas */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Evolución mensual
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Actividad consolidada por mes — marcas propias
            </p>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart
                data={growthTrend}
                margin={{ left: 10, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => formatNumber(v)}
                />
                <Tooltip
                  formatter={(value, name) => [
                    Number(value).toLocaleString("es-CO"),
                    name,
                  ]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {ownBrandNames.map((name, i) => (
                  <Line
                    key={name}
                    type="monotone"
                    dataKey={name}
                    stroke={lineColors[i]}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top publicaciones */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Top publicaciones por engagement
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Las publicaciones con mejor desempeño del período
            </p>
            {brandTopPosts.length > 0 ? (
              <div className="space-y-3">
                {brandTopPosts.map((post, i) => {
                  const Icon = networkIcons[post.network];
                  return (
                    <div
                      key={i}
                      className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white"
                          style={{
                            background: networkColors[post.network] || "#6b7280",
                          }}
                        >
                          {Icon && <Icon size={10} />}
                          {networkLabels[post.network]}
                        </span>
                        <span className="text-xs text-gray-400">{post.date}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-3">
                        {post.caption}
                      </p>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>{formatNumber(post.likes)} likes</span>
                        <span>{formatNumber(post.comments)} comentarios</span>
                        <span>{formatNumber(post.shares)} compartidos</span>
                        {post.views > 0 && (
                          <span className="font-medium text-gray-900">
                            {formatNumber(post.views)} views
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Sin datos de publicaciones aún.
              </p>
            )}
          </div>

          {/* Sentimiento + menciones */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Qué dicen de {selectedBrand}
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Menciones encontradas por búsqueda de keywords (earned media)
            </p>

            {brandSentiment && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    Sentimiento
                  </span>
                  <span className="text-[10px] text-gray-400">
                    +{brandSentiment.positive}% / {brandSentiment.neutral}% / -
                    {brandSentiment.negative}%
                  </span>
                </div>
                <div className="flex h-2.5 rounded-full overflow-hidden bg-gray-100">
                  <div
                    className="bg-emerald-500"
                    style={{ width: brandSentiment.positive + "%" }}
                  />
                  <div
                    className="bg-amber-400"
                    style={{ width: brandSentiment.neutral + "%" }}
                  />
                  <div
                    className="bg-red-400"
                    style={{ width: brandSentiment.negative + "%" }}
                  />
                </div>
              </div>
            )}

            {brandMentions.length > 0 ? (
              <div className="space-y-3">
                {brandMentions.map((m) => {
                  const sentColor =
                    m.sentiment === "positive"
                      ? "text-emerald-600 bg-emerald-50"
                      : m.sentiment === "negative"
                        ? "text-red-600 bg-red-50"
                        : "text-amber-600 bg-amber-50";
                  return (
                    <div
                      key={m.id}
                      className="border border-gray-100 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500">
                            {m.network}
                          </span>
                          <span className="text-xs text-gray-400">
                            {m.author}
                          </span>
                        </div>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sentColor}`}
                        >
                          {m.sentiment === "positive"
                            ? "Positivo"
                            : m.sentiment === "negative"
                              ? "Negativo"
                              : "Neutral"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{m.text}</p>
                      <div className="flex justify-between mt-2">
                        <span className="text-[10px] text-gray-400">
                          {m.date}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {formatNumber(m.likes)} likes
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Sin menciones recientes.</p>
            )}
          </div>
        </div>
      )}
    </ProtectedLayout>
  );
}
