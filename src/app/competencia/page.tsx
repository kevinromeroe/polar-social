"use client";

import { useState, Fragment } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  getTotalInteractions,
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

type SortKey = "followers" | "engagement" | "reactions" | "posts" | "growth";

function NetworkTable({
  network,
  networkLabel,
  brands,
  ownBrands,
  disclaimer,
}: {
  network: Network;
  networkLabel: string;
  brands: BrandData[];
  ownBrands: BrandData[];
  disclaimer: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("followers");
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null);

  const visibleBrands = brands.filter((b) => b.networks[network]);

  if (visibleBrands.length === 0) return null;

  const getVal = (b: BrandData, key: SortKey): number => {
    const m = b.networks[network];
    if (!m) return 0;
    switch (key) {
      case "followers": return m.followers;
      case "engagement": return m.engagementRate;
      case "reactions": return getTotalInteractions(b, network);
      case "posts": return m.posts;
      case "growth": return m.growth;
    }
  };

  const sorted = [...visibleBrands].sort((a, b) => getVal(b, sortKey) - getVal(a, sortKey));

  const allFollowers = sorted.map((b) => b.networks[network]!.followers);
  const allEngagements = sorted.map((b) => b.networks[network]!.engagementRate);
  const allReactions = sorted.map((b) => getTotalInteractions(b, network));
  const allPosts = sorted.map((b) => b.networks[network]!.posts);
  const allGrowth = sorted.map((b) => b.networks[network]!.growth);

  const ownBrandNames = new Set(ownBrands.map((b) => b.brand));

  const SortHeader = ({ label, sortId }: { label: string; sortId: SortKey }) => (
    <th
      className="text-right px-4 py-3 text-gray-500 font-medium cursor-pointer hover:text-gray-900 whitespace-nowrap select-none"
      onClick={() => setSortKey(sortId)}
    >
      {label}{" "}
      {sortKey === sortId && <ChevronDown className="inline h-3 w-3" />}
    </th>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900">
          {networkLabel}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">
          {disclaimer}
        </p>
        <p className="text-[10px] text-gray-400 mt-2">
          Click en columna para ordenar · Click en fila para expandir
        </p>
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
          <span className="text-[10px] text-gray-400">(ranking relativo por métrica)</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-5 py-3 text-gray-500 font-medium whitespace-nowrap">
                Marca
              </th>
              <SortHeader label="Seguidores" sortId="followers" />
              <SortHeader label="Engagement" sortId="engagement" />
              <SortHeader label="Reacciones" sortId="reactions" />
              <SortHeader label="Posts" sortId="posts" />
              <SortHeader label="Crecimiento" sortId="growth" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.map((brand) => {
              const m = brand.networks[network]!;
              const isOwn = ownBrandNames.has(brand.brand);
              const isExpanded = expandedBrand === brand.brand;
              const reactions = getTotalInteractions(brand, network);

              return (
                <Fragment key={brand.brand}>
                  <tr
                    className={`cursor-pointer hover:bg-gray-50 transition-colors ${isOwn ? "bg-teal-50/30" : ""}`}
                    onClick={() => setExpandedBrand(isExpanded ? null : brand.brand)}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{brand.brand}</span>
                        {isOwn && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700">
                            Propia
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5 text-gray-400 ml-auto" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-auto" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getSemaforoColor(m.followers, allFollowers)}`} />
                        <span className="font-semibold text-gray-900 tabular-nums">
                          {formatNumber(m.followers)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getSemaforoColor(m.engagementRate, allEngagements)}`} />
                        <span className="text-gray-700 tabular-nums">{m.engagementRate}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getSemaforoColor(reactions, allReactions)}`} />
                        <span className="text-gray-700 tabular-nums">{formatNumber(reactions)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getSemaforoColor(m.posts, allPosts)}`} />
                        <span className="text-gray-700 tabular-nums">{m.posts}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${getSemaforoColor(m.growth, allGrowth)}`} />
                        <span
                          className={`inline-flex items-center gap-1 tabular-nums ${
                            m.growth > 0 ? "text-emerald-600" : m.growth < 0 ? "text-red-500" : "text-gray-400"
                          }`}
                        >
                          {m.growth > 0 ? <TrendingUp className="h-3 w-3" /> : m.growth < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                          {m.growth > 0 ? "+" : ""}{m.growth}%
                        </span>
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-gray-50/50">
                      <td colSpan={6} className="px-5 pb-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Promedio Likes</p>
                            <p className="text-sm font-bold text-gray-900">{formatNumber(m.avgLikes)}</p>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Promedio Comentarios</p>
                            <p className="text-sm font-bold text-gray-900">{formatNumber(m.avgComments)}</p>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Promedio Compartidos</p>
                            <p className="text-sm font-bold text-gray-900">{formatNumber(m.avgShares)}</p>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Interacción por post</p>
                            <p className="text-sm font-bold text-gray-900">
                              {m.posts > 0 ? formatNumber(Math.round(reactions / m.posts)) : "0"}
                            </p>
                          </div>
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Usuario</p>
                            <p className="text-sm font-medium text-gray-700 break-all">@{m.username}</p>
                          </div>
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
  );
}

export default function CompetenciaPage() {
  const { ownBrands, competitors } = useClientData();
  const allBrands = [...ownBrands, ...competitors];

  const hasInstagram = allBrands.some((b) => b.networks.instagram);
  const hasFacebook = allBrands.some((b) => b.networks.facebook);

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Competencia</h2>
        <p className="text-gray-500 text-sm mt-1">
          Benchmarking comparativo — marcas propias vs. competidores
        </p>
      </div>

      {hasInstagram && (
        <NetworkTable
          network="instagram"
          networkLabel="Instagram"
          brands={allBrands}
          ownBrands={ownBrands}
          disclaimer="Datos acumulados del período de monitoreo (dic 2025 – ago 2026). Seguidores al corte más reciente. Reacciones = total de likes + comentarios + compartidos. Engagement rate = interacciones / seguidores."
        />
      )}

      {hasFacebook && (
        <NetworkTable
          network="facebook"
          networkLabel="Facebook"
          brands={allBrands}
          ownBrands={ownBrands}
          disclaimer="Datos acumulados del período de monitoreo (dic 2025 – ago 2026). Seguidores al corte más reciente. Reacciones = total de likes + comentarios + compartidos. Engagement rate = interacciones / seguidores."
        />
      )}
    </ProtectedLayout>
  );
}
