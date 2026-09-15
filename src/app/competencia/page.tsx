"use client";

import { useState, Fragment } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
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

function getSemaforoColor(value: number, allValues: number[]): string {
  if (allValues.length === 0) return "bg-amber-400";
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const range = max - min;
  if (range === 0) return "bg-amber-400";
  const normalized = (value - min) / range;
  if (normalized >= 0.6) return "bg-emerald-500";
  if (normalized >= 0.3) return "bg-amber-400";
  return "bg-red-400";
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

  const visibleBrands = selectedNetwork === "all"
    ? sortedBrands
    : sortedBrands.filter(b => b.networks[selectedNetwork]);

  const allEngagements = visibleBrands.map(getEngagement);

  const barData = [...allBrands]
    .sort((a, b) => getTotalFollowers(b) - getTotalFollowers(a))
    .map(b => ({
      brand: b.brand,
      followers: getTotalFollowers(b),
      isOwn: b.type === "own",
    }));

  const availableNetworks = ALL_NETWORKS.filter(net =>
    allBrands.some(b => b.networks[net])
  );

  const totalCols = selectedNetwork === "all" ? 8 : 7;

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Competencia</h2>
        <p className="text-gray-500 text-sm mt-1">
          Benchmarking comparativo — marcas propias vs. competidores
        </p>
      </div>

      {/* Bar chart — seguidores por marca */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Comparación de seguidores
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Total de seguidores por marca — todas las plataformas
        </p>
        <ResponsiveContainer width="100%" height={barData.length * 48 + 20}>
          <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => formatNumber(v)}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
            />
            <YAxis
              type="category"
              dataKey="brand"
              width={95}
              tick={{ fontSize: 12, fill: "#334155" }}
            />
            <Tooltip
              formatter={(v) => [formatNumber(Number(v)), "Seguidores"]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
            />
            <Bar dataKey="followers" radius={[0, 4, 4, 0]} barSize={28}>
              {barData.map((entry, i) => (
                <Cell key={i} fill={entry.isOwn ? "#0d9488" : "#cbd5e1"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded bg-teal-600" />
            Marca propia
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-3 h-3 rounded bg-slate-300" />
            Competidor
          </div>
        </div>
      </div>

      {/* Tabla comparativa */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Tabla comparativa
            </h3>
            <p className="text-xs text-gray-400">
              Click en columna para ordenar · Click en fila para expandir
            </p>
          </div>

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
            {availableNetworks.map((net) => {
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

          <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-100">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Semáforo</span>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Alto
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Medio
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" /> Bajo
            </div>
            <span className="text-[10px] text-gray-400">(basado en engagement)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-gray-500 font-medium whitespace-nowrap">
                  Marca
                </th>
                <th className="text-left px-3 py-3 text-gray-500 font-medium whitespace-nowrap">
                  Tipo
                </th>
                <th className="text-center px-3 py-3 text-gray-500 font-medium whitespace-nowrap">
                  Estado
                </th>
                <th
                  className="text-right px-5 py-3 text-gray-500 font-medium cursor-pointer hover:text-gray-900 whitespace-nowrap"
                  onClick={() => setSortKey("followers")}
                >
                  Seguidores{" "}
                  {sortKey === "followers" && <ChevronDown className="inline h-3 w-3" />}
                </th>
                <th
                  className="text-right px-5 py-3 text-gray-500 font-medium cursor-pointer hover:text-gray-900 whitespace-nowrap"
                  onClick={() => setSortKey("engagement")}
                >
                  Engagement{" "}
                  {sortKey === "engagement" && <ChevronDown className="inline h-3 w-3" />}
                </th>
                <th
                  className="text-right px-5 py-3 text-gray-500 font-medium cursor-pointer hover:text-gray-900 whitespace-nowrap"
                  onClick={() => setSortKey("posts")}
                >
                  Posts{" "}
                  {sortKey === "posts" && <ChevronDown className="inline h-3 w-3" />}
                </th>
                <th
                  className="text-right px-5 py-3 text-gray-500 font-medium cursor-pointer hover:text-gray-900 whitespace-nowrap"
                  onClick={() => setSortKey("growth")}
                >
                  Crecimiento{" "}
                  {sortKey === "growth" && <ChevronDown className="inline h-3 w-3" />}
                </th>
                {selectedNetwork === "all" && (
                  <th className="text-center px-3 py-3 text-gray-500 font-medium whitespace-nowrap">
                    Redes
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {visibleBrands.map((brand) => {
                const isOwn = brand.type === "own";
                const isExpanded = expandedBrand === brand.brand;
                const growth = getGrowth(brand);
                const followers = getFollowers(brand);
                const engagement = getEngagement(brand);
                const posts = getPosts(brand);
                const semaforoClass = getSemaforoColor(engagement, allEngagements);

                return (
                  <Fragment key={brand.brand}>
                    <tr
                      className={`cursor-pointer hover:bg-gray-50 transition-colors ${isOwn ? "bg-teal-50/30" : ""}`}
                      onClick={() => setExpandedBrand(isExpanded ? null : brand.brand)}
                    >
                      <td className="px-5 py-3">
                        <span className="font-medium text-gray-900">{brand.brand}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isOwn ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {isOwn ? "Propia" : "Competidor"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block w-3 h-3 rounded-full ${semaforoClass}`} />
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900 tabular-nums">
                        {formatNumber(followers)}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">
                        {engagement}%
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700 tabular-nums">
                        {posts}
                      </td>
                      <td className="px-5 py-3 text-right tabular-nums">
                        <span
                          className={`inline-flex items-center justify-end gap-1 ${
                            growth > 0 ? "text-emerald-600" : growth < 0 ? "text-red-500" : "text-gray-400"
                          }`}
                        >
                          {growth > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : growth < 0 ? (
                            <TrendingDown className="h-3 w-3" />
                          ) : null}
                          {growth > 0 ? "+" : ""}
                          {growth}%
                        </span>
                      </td>
                      {selectedNetwork === "all" && (
                        <td className="px-3 py-3 text-center text-gray-500">
                          {getNetworkCount(brand)}
                          {isExpanded ? (
                            <ChevronUp className="inline h-3 w-3 ml-1" />
                          ) : (
                            <ChevronDown className="inline h-3 w-3 ml-1" />
                          )}
                        </td>
                      )}
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50/50">
                        <td colSpan={totalCols} className="px-5 pb-4 border-t border-gray-100">
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
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedLayout>
  );
}
