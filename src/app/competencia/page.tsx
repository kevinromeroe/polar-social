"use client";

import { useState } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Cell,
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
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

type SortKey = "followers" | "engagement" | "posts" | "growth";

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

export default function CompetenciaPage() {
  const { ownBrands, competitors, sovData, mentions, productLineLabels, productLineKeys } = useClientData();

  const [selectedLine, setSelectedLine] = useState<string>("all");
  const [sortKey, setSortKey] = useState<SortKey>("followers");
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);

  const allBrands = [...ownBrands, ...competitors];

  const filteredBrands = allBrands.filter((b) => {
    if (selectedLine === "all") return true;
    if (b.type === "own") return true;
    return b.productLine === selectedLine;
  });

  const sortedBrands = [...filteredBrands].sort((a, b) => {
    switch (sortKey) {
      case "followers":
        return getTotalFollowers(b) - getTotalFollowers(a);
      case "engagement":
        return getAvgEngagement(b) - getAvgEngagement(a);
      case "posts":
        return getTotalPosts(b) - getTotalPosts(a);
      case "growth":
        return getAvgGrowth(b) - getAvgGrowth(a);
      default:
        return 0;
    }
  });

  const sovChartData = sovData
    .filter((s) => filteredBrands.some((b) => b.brand === s.brand))
    .map((s) => ({
      ...s,
      fill: ownBrands.some((b) => b.brand === s.brand) ? "#0d9488" : "#94a3b8",
    }));

  const top4 = sortedBrands.slice(0, 4);
  const radarData = [
    { metric: "Seguidores", ...Object.fromEntries(top4.map((b) => [b.brand, Math.min(100, (getTotalFollowers(b) / getTotalFollowers(top4[0])) * 100)])) },
    { metric: "Engagement", ...Object.fromEntries(top4.map((b) => [b.brand, Math.min(100, (getAvgEngagement(b) / 5) * 100)])) },
    { metric: "Posts", ...Object.fromEntries(top4.map((b) => [b.brand, Math.min(100, (getTotalPosts(b) / Math.max(...top4.map(getTotalPosts))) * 100)])) },
    { metric: "Crecimiento", ...Object.fromEntries(top4.map((b) => [b.brand, Math.min(100, Math.max(0, getAvgGrowth(b) * 20))])) },
    { metric: "Redes", ...Object.fromEntries(top4.map((b) => [b.brand, (getNetworkCount(b) / 5) * 100])) },
  ];
  const radarColors = ["#0d9488", "#6366f1", "#f59e0b", "#ef4444"];

  const lineFilterOptions = [
    { key: "all", label: "Todas" },
    ...productLineKeys.map((key) => ({ key, label: productLineLabels[key] || key })),
  ];

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Competencia</h2>
        <p className="text-gray-500 text-sm mt-1">
          Benchmarking comparativo — marcas propias vs. competidores
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {lineFilterOptions.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSelectedLine(opt.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedLine === opt.key
                ? "bg-teal-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Share of Voice
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Porcentaje de menciones por marca
          </p>
          <ResponsiveContainer width="100%" height={Math.max(250, sovChartData.length * 30)}>
            <BarChart
              data={sovChartData}
              layout="vertical"
              margin={{ left: 10, right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickFormatter={(v) => v + "%"}
              />
              <YAxis
                dataKey="brand"
                type="category"
                width={95}
                tick={{ fontSize: 11, fill: "#334155" }}
              />
              <Tooltip
                formatter={(value) => [Number(value).toFixed(1) + "%", "SOV"]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                {sovChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Comparación multidimensional
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Top 4 marcas — 5 dimensiones normalizadas
          </p>
          <ResponsiveContainer width="100%" height={300}>
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
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">
            Tabla comparativa
          </h3>
          <p className="text-xs text-gray-400">
            Click en una marca para ver detalle. Click en columna para ordenar.
          </p>
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
                <th className="text-center px-5 py-3 text-gray-500 font-medium">
                  Redes
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sortedBrands.map((brand) => {
                const isOwn = brand.type === "own";
                const isExpanded = expandedBrand === brand.brand;
                const growth = getAvgGrowth(brand);
                const brandMentions = mentions.filter(
                  (m) => m.brand === brand.brand
                );
                const lineLabel = brand.productLine
                  ? productLineLabels[brand.productLine] || brand.productLine
                  : null;

                return (
                  <tr key={brand.brand} className="group">
                    <td colSpan={7} className="p-0">
                      <div
                        className={`grid grid-cols-[1fr_auto_auto_auto_auto_auto_auto] items-center cursor-pointer hover:bg-gray-50 transition-colors ${isOwn ? "bg-teal-50/30" : ""}`}
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
                          {formatNumber(getTotalFollowers(brand))}
                        </div>
                        <div className="px-5 py-3 text-right text-gray-700 tabular-nums">
                          {getAvgEngagement(brand)}%
                        </div>
                        <div className="px-5 py-3 text-right text-gray-700 tabular-nums">
                          {getTotalPosts(brand)}
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
                        <div className="px-5 py-3 text-center text-gray-500">
                          {getNetworkCount(brand)}
                          {isExpanded ? (
                            <ChevronUp className="inline h-3 w-3 ml-1" />
                          ) : (
                            <ChevronDown className="inline h-3 w-3 ml-1" />
                          )}
                        </div>
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
                              .map(([net, metrics]) => (
                                <div
                                  key={net}
                                  className="bg-white border border-gray-200 rounded-lg p-3"
                                >
                                  <div className="flex items-center gap-2 mb-2">
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{
                                        background:
                                          networkColors[net] || "#6b7280",
                                      }}
                                    />
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
                              ))}
                          </div>

                          {brandMentions.length > 0 && (
                            <div className="mt-4">
                              <p className="text-xs font-semibold text-gray-600 mb-2">
                                Menciones recientes
                              </p>
                              <div className="space-y-2">
                                {brandMentions.slice(0, 3).map((m) => (
                                  <div
                                    key={m.id}
                                    className="bg-white border border-gray-100 rounded-lg p-3"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-[10px] font-semibold text-gray-500">
                                        {m.network}
                                      </span>
                                      <span className="text-[10px] text-gray-400">
                                        {m.author}
                                      </span>
                                      <span
                                        className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ml-auto ${
                                          m.sentiment === "positive"
                                            ? "text-emerald-600 bg-emerald-50"
                                            : m.sentiment === "negative"
                                              ? "text-red-600 bg-red-50"
                                              : "text-amber-600 bg-amber-50"
                                        }`}
                                      >
                                        {m.sentiment === "positive"
                                          ? "+"
                                          : m.sentiment === "negative"
                                            ? "−"
                                            : "~"}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                      {m.text}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
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
