"use client";

import { useState } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getTotalFollowers,
  getAvgEngagement,
  networkLabels,
  networkColors,
  formatNumber,
} from "@/lib/mock-data";
import type { BrandData, Network } from "@/lib/mock-data";
import { useClientData } from "@/lib/client-data";
import { FaInstagram, FaFacebookF, FaTiktok, FaLinkedinIn, FaXTwitter } from "react-icons/fa6";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const networkIcons: Record<string, React.ComponentType<{ className?: string; size?: number; color?: string }>> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  linkedin: FaLinkedinIn,
  x: FaXTwitter,
};

const ALL_NETWORKS: Network[] = ["instagram", "facebook", "tiktok", "linkedin", "x"];

function getFollowersForNetwork(brand: BrandData, network: Network): number {
  return brand.networks[network]?.followers ?? 0;
}

function getEngagementForNetwork(brand: BrandData, network: Network): number {
  return brand.networks[network]?.engagementRate ?? 0;
}

function getPostsForNetwork(brand: BrandData, network: Network): number {
  return brand.networks[network]?.posts ?? 0;
}

function getGrowthForNetwork(brand: BrandData, network: Network): number {
  return brand.networks[network]?.growth ?? 0;
}

function getTotalPosts(brand: BrandData): number {
  return Object.values(brand.networks).reduce((sum, n) => sum + (n?.posts ?? 0), 0);
}

function getAvgGrowth(brand: BrandData): number {
  const nets = Object.values(brand.networks).filter(Boolean);
  if (nets.length === 0) return 0;
  return Number(
    (nets.reduce((sum, n) => sum + (n?.growth ?? 0), 0) / nets.length).toFixed(1)
  );
}

function getNetworkCount(brand: BrandData): number {
  return Object.keys(brand.networks).length;
}

type SortKey = "followers" | "engagement" | "posts" | "growth";

export default function CompetenciaPage() {
  const { ownBrands, competitors, productLineLabels } = useClientData();

  const [selectedNetwork, setSelectedNetwork] = useState<Network | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("followers");
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);

  const allBrands = [...ownBrands, ...competitors];

  const getFollowers = (b: BrandData) =>
    selectedNetwork === "all" ? getTotalFollowers(b) : getFollowersForNetwork(b, selectedNetwork);
  const getEngagement = (b: BrandData) =>
    selectedNetwork === "all" ? getAvgEngagement(b) : getEngagementForNetwork(b, selectedNetwork);
  const getPosts = (b: BrandData) =>
    selectedNetwork === "all" ? getTotalPosts(b) : getPostsForNetwork(b, selectedNetwork);
  const getGrowth = (b: BrandData) =>
    selectedNetwork === "all" ? getAvgGrowth(b) : getGrowthForNetwork(b, selectedNetwork);

  const sortedBrands = [...allBrands].sort((a, b) => {
    switch (sortKey) {
      case "followers": return getFollowers(b) - getFollowers(a);
      case "engagement": return getEngagement(b) - getEngagement(a);
      case "posts": return getPosts(b) - getPosts(a);
      case "growth": return getGrowth(b) - getGrowth(a);
      default: return 0;
    }
  });

  // Radar chart — top 4 por seguidores (consolidado)
  const top4 = [...allBrands].sort((a, b) => getTotalFollowers(b) - getTotalFollowers(a)).slice(0, 4);
  const radarData = [
    { metric: "Seguidores", ...Object.fromEntries(top4.map((b) => [b.brand, Math.min(100, (getTotalFollowers(b) / getTotalFollowers(top4[0])) * 100)])) },
    { metric: "Engagement", ...Object.fromEntries(top4.map((b) => [b.brand, Math.min(100, (getAvgEngagement(b) / 5) * 100)])) },
    { metric: "Posts", ...Object.fromEntries(top4.map((b) => [b.brand, Math.min(100, (getTotalPosts(b) / Math.max(...top4.map(getTotalPosts))) * 100)])) },
    { metric: "Crecimiento", ...Object.fromEntries(top4.map((b) => [b.brand, Math.min(100, Math.max(0, getAvgGrowth(b) * 20))])) },
    { metric: "Redes", ...Object.fromEntries(top4.map((b) => [b.brand, (getNetworkCount(b) / 5) * 100])) },
  ];
  const radarColors = ["#0d9488", "#6366f1", "#f59e0b", "#ef4444"];

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Competencia</h2>
        <p className="text-gray-500 text-sm mt-1">
          Benchmarking comparativo — marcas propias vs. competidores
        </p>
      </div>

      {/* Radar chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Comparación multidimensional
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Top 4 marcas — 5 dimensiones normalizadas
        </p>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis
              dataKey="metric"
              tick={{ fontSize: 11, fill: "#64748b" }}
            />
            <PolarRadiusAxis tick={false} domain={[0, 100]} />
            {top4.map((b, i) => (
              <Radar
                key={b.brand}
                name={b.brand}
                dataKey={b.brand}
                stroke={radarColors[i]}
                fill={radarColors[i]}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            ))}
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla comparativa con segmentador por plataforma */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Tabla comparativa
              </h3>
              <p className="text-xs text-gray-400">
                Click en columna para ordenar. Selecciona una plataforma para ver métricas específicas.
              </p>
            </div>
          </div>

          {/* Segmentador por plataforma */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <button
              onClick={() => setSelectedNetwork("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                selectedNetwork === "all"
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Consolidado
            </button>
            {ALL_NETWORKS.map((net) => {
              const Icon = networkIcons[net];
              return (
                <button
                  key={net}
                  onClick={() => setSelectedNetwork(net)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    selectedNetwork === net
                      ? "text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  style={selectedNetwork === net ? { background: networkColors[net] } : {}}
                >
                  {Icon && <Icon size={12} />}
                  {networkLabels[net]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">
                  Marca
                </th>
                <th className="text-left px-5 py-3 text-gray-500 font-medium">
                  Tipo
                </th>
                <th
                  className="text-right px-5 py-3 text-gray-500 font-medium cursor-pointer hover:text-gray-900"
                  onClick={() => setSortKey("followers")}
                >
                  Seguidores{" "}
                  {sortKey === "followers" && (
                    <ChevronDown className="inline h-3 w-3" />
                  )}
                </th>
                <th
                  className="text-right px-5 py-3 text-gray-500 font-medium cursor-pointer hover:text-gray-900"
                  onClick={() => setSortKey("engagement")}
                >
                  Engagement{" "}
                  {sortKey === "engagement" && (
                    <ChevronDown className="inline h-3 w-3" />
                  )}
                </th>
                <th
                  className="text-right px-5 py-3 text-gray-500 font-medium cursor-pointer hover:text-gray-900"
                  onClick={() => setSortKey("posts")}
                >
                  Posts{" "}
                  {sortKey === "posts" && (
                    <ChevronDown className="inline h-3 w-3" />
                  )}
                </th>
                <th
                  className="text-right px-5 py-3 text-gray-500 font-medium cursor-pointer hover:text-gray-900"
                  onClick={() => setSortKey("growth")}
                >
                  Crecimiento{" "}
                  {sortKey === "growth" && (
                    <ChevronDown className="inline h-3 w-3" />
                  )}
                </th>
                {selectedNetwork === "all" && (
                  <th className="text-center px-5 py-3 text-gray-500 font-medium">
                    Redes
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedBrands.map((brand) => {
                const isOwn = brand.type === "own";
                const isExpanded = expandedBrand === brand.brand;
                const growth = getGrowth(brand);
                const followers = getFollowers(brand);
                const engagement = getEngagement(brand);
                const posts = getPosts(brand);
                const lineLabel = brand.productLine
                  ? productLineLabels[brand.productLine] || brand.productLine
                  : null;

                if (selectedNetwork !== "all" && !brand.networks[selectedNetwork]) {
                  return null;
                }

                return (
                  <tr key={brand.brand} className="group">
                    <td colSpan={selectedNetwork === "all" ? 7 : 6} className="p-0">
                      <div
                        className={`grid items-center cursor-pointer hover:bg-gray-50 transition-colors ${isOwn ? "bg-teal-50/30" : ""}`}
                        style={{
                          gridTemplateColumns: selectedNetwork === "all"
                            ? "1fr auto auto auto auto auto auto"
                            : "1fr auto auto auto auto auto",
                        }}
                        onClick={() =>
                          setExpandedBrand(isExpanded ? null : brand.brand)
                        }
                      >
                        <div className="px-5 py-3">
                          <span className="font-medium text-gray-900">
                            {brand.brand}
                          </span>
                        </div>
                        <div className="px-5 py-3 text-right">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${isOwn ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"}`}
                          >
                            {isOwn ? "Propia" : lineLabel || "Competidor"}
                          </span>
                        </div>
                        <div className="px-5 py-3 text-right font-semibold text-gray-900 tabular-nums">
                          {formatNumber(followers)}
                        </div>
                        <div className="px-5 py-3 text-right text-gray-700 tabular-nums">
                          {engagement}%
                        </div>
                        <div className="px-5 py-3 text-right text-gray-700 tabular-nums">
                          {posts}
                        </div>
                        <div className="px-5 py-3 text-right tabular-nums">
                          <span
                            className={`flex items-center justify-end gap-1 ${growth > 0 ? "text-emerald-600" : growth < 0 ? "text-red-500" : "text-gray-400"}`}
                          >
                            {growth > 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : growth < 0 ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : null}
                            {growth > 0 ? "+" : ""}
                            {growth}%
                          </span>
                        </div>
                        {selectedNetwork === "all" && (
                          <div className="px-5 py-3 text-center text-gray-500">
                            {getNetworkCount(brand)}
                            {isExpanded ? (
                              <ChevronUp className="inline h-3 w-3 ml-1" />
                            ) : (
                              <ChevronDown className="inline h-3 w-3 ml-1" />
                            )}
                          </div>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="px-5 pb-4 bg-gray-50/50 border-t border-gray-100">
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
                            {(
                              Object.entries(brand.networks) as [
                                Network,
                                NonNullable<BrandData["networks"][Network]>,
                              ][]
                            )
                              .filter(([, v]) => v != null)
                              .map(([net, metrics]) => {
                                const Icon = networkIcons[net];
                                return (
                                  <div
                                    key={net}
                                    className="bg-white border border-gray-200 rounded-lg p-3"
                                  >
                                    <div className="flex items-center gap-2 mb-2">
                                      <span
                                        className="w-6 h-6 rounded flex items-center justify-center text-white"
                                        style={{ background: networkColors[net] || "#6b7280" }}
                                      >
                                        {Icon ? <Icon size={12} /> : null}
                                      </span>
                                      <span className="text-xs font-semibold text-gray-700">
                                        {networkLabels[net]}
                                      </span>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">
                                      {formatNumber(metrics.followers)}
                                    </p>
                                    <p className="text-[10px] text-gray-400">
                                      {metrics.engagementRate}% eng · {metrics.growth > 0 ? "+" : ""}
                                      {metrics.growth}%
                                    </p>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedLayout>
  );
}
