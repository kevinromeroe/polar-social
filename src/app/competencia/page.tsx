"use client";

import { useState, Fragment } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  getTotalInteractions,
  formatNumber,
  networkColors,
  networkLabels,
} from "@/lib/mock-data";
import type { BrandData, Network, TopPostData, CompetitorStrategy } from "@/lib/mock-data";
import { useClientData } from "@/lib/client-data";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
} from "lucide-react";
import { FaInstagram, FaFacebookF, FaTiktok, FaLinkedinIn, FaXTwitter, FaRedditAlien } from "react-icons/fa6";

const networkIcons: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  tiktok: FaTiktok,
  linkedin: FaLinkedinIn,
  x: FaXTwitter,
  reddit: FaRedditAlien,
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
  brandColors,
}: {
  network: Network;
  networkLabel: string;
  brands: BrandData[];
  ownBrands: BrandData[];
  disclaimer: string;
  brandColors: Record<string, string>;
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
              <SortHeader label="Posts analizados" sortId="posts" />
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
                        <span
                          className="w-1 h-5 rounded-full shrink-0"
                          style={{ background: brandColors[brand.brand] || "#94a3b8" }}
                        />
                        <span
                          className="font-semibold"
                          style={{ color: brandColors[brand.brand] || "#111827" }}
                        >
                          {brand.brand}
                        </span>
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

function PostCard({ post, brandColors }: { post: TopPostData; brandColors: Record<string, string> }) {
  const Icon = networkIcons[post.network];
  const totalEng = post.likes + post.comments + post.shares;
  const isBest = post.ranking === "best";

  return (
    <div className={`border rounded-xl overflow-hidden ${isBest ? "border-emerald-200" : "border-red-200"}`}>
      <div className={`px-4 py-2 flex items-center justify-between ${isBest ? "bg-emerald-50" : "bg-red-50"}`}>
        <div className="flex items-center gap-2">
          {isBest
            ? <ThumbsUp className="h-3.5 w-3.5 text-emerald-600" />
            : <ThumbsDown className="h-3.5 w-3.5 text-red-500" />
          }
          <span className={`text-[10px] font-bold uppercase ${isBest ? "text-emerald-700" : "text-red-600"}`}>
            {isBest ? "Mejor post" : "Peor post"}
          </span>
        </div>
        <span className={`text-[10px] font-bold ${isBest ? "text-emerald-700" : "text-red-600"}`}>
          {formatNumber(totalEng)} interacciones
        </span>
      </div>
      <div className="p-4">
        <div className="flex gap-4">
          <a href={post.url || "#"} target="_blank" rel="noopener noreferrer" className="shrink-0">
            {post.imageUrl ? (
              <img
                src={post.imageUrl}
                alt=""
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover bg-gray-100"
                loading="lazy"
                onError={(e) => {
                  const el = e.currentTarget;
                  el.style.display = "none";
                  const fallback = el.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-gray-100 items-center justify-center"
              style={{ backgroundColor: (brandColors[post.brand] || "#64748b") + "15", display: post.imageUrl ? "none" : "flex" }}
            >
              <span style={{ color: brandColors[post.brand] || "#64748b", opacity: 0.5 }}><Icon className="h-8 w-8" /></span>
            </div>
          </a>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="font-bold text-xs"
                style={{ color: brandColors[post.brand] || "#334155" }}
              >
                {post.brand}
              </span>
              <span
                className="flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded text-white"
                style={{ background: networkColors[post.network] || "#6b7280" }}
              >
                {Icon && <Icon size={10} />}
                {networkLabels[post.network]}
              </span>
              <span className="text-[10px] text-gray-400">{post.date}</span>
            </div>
            <p className="text-sm text-gray-700 mb-2 line-clamp-3">{post.caption}</p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
              <span>{formatNumber(post.likes)} me gusta</span>
              <span>{formatNumber(post.comments)} comentarios</span>
              <span>{formatNumber(post.shares)} compartidos</span>
              {post.url && (
                <a href={post.url} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 font-medium ml-auto" onClick={(e) => e.stopPropagation()}>
                  Ver post &rarr;
                </a>
              )}
            </div>
          </div>
        </div>
        {post.topComment && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-start gap-2">
              <MessageCircle className="h-3.5 w-3.5 text-gray-400 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-semibold text-gray-600">Comentario destacado</span>
                  <span className="text-[10px] text-gray-400">{post.topComment.author}</span>
                  {post.topComment.likes > 0 && <span className="text-[10px] text-gray-400">{post.topComment.likes} me gusta</span>}
                </div>
                <p className="text-xs text-gray-600 italic leading-relaxed">&ldquo;{post.topComment.text}&rdquo;</p>
              </div>
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

export default function CompetenciaPage() {
  const { ownBrands, competitors, brandColors, topPosts, brandTopicMaps, competitorStrategies } = useClientData();
  const allBrands = [...ownBrands, ...competitors];

  const hasInstagram = allBrands.some((b) => b.networks.instagram);
  const hasFacebook = allBrands.some((b) => b.networks.facebook);
  const hasTiktok = allBrands.some((b) => b.networks.tiktok);
  const hasX = allBrands.some((b) => b.networks.x);

  const ownBrandNames = new Set(ownBrands.map((b) => b.brand));

  const postsByBrand: Record<string, Record<string, { best?: TopPostData; worst?: TopPostData }>> = {};
  for (const p of topPosts) {
    if (!postsByBrand[p.brand]) postsByBrand[p.brand] = {};
    if (!postsByBrand[p.brand][p.network]) postsByBrand[p.brand][p.network] = {};
    const slot = postsByBrand[p.brand][p.network];
    const eng = p.likes + p.comments + p.shares;
    if (p.ranking === "best") {
      if (!slot.best || eng > (slot.best.likes + slot.best.comments + slot.best.shares)) slot.best = p;
    } else {
      if (!slot.worst || eng < (slot.worst.likes + slot.worst.comments + slot.worst.shares)) slot.worst = p;
    }
  }
  const ownBrandsWithPosts = Object.keys(postsByBrand).filter((b) => ownBrandNames.has(b)).sort();
  const compBrandsWithPosts = Object.keys(postsByBrand).filter((b) => !ownBrandNames.has(b)).sort();

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
          brandColors={brandColors}
          disclaimer="Seguidores y engagement actuales. Reacciones acumuladas (likes + comentarios + compartidos). Engagement rate = interacciones / seguidores."
        />
      )}

      {hasFacebook && (
        <NetworkTable
          network="facebook"
          networkLabel="Facebook"
          brands={allBrands}
          ownBrands={ownBrands}
          brandColors={brandColors}
          disclaimer="Seguidores y engagement actuales. Reacciones acumuladas (likes + comentarios + compartidos). Engagement rate = interacciones / seguidores."
        />
      )}

      {hasTiktok && (
        <NetworkTable
          network="tiktok"
          networkLabel="TikTok"
          brands={allBrands}
          ownBrands={ownBrands}
          brandColors={brandColors}
          disclaimer="Seguidores y engagement actuales. Reacciones acumuladas (likes + comentarios + compartidos). Engagement rate = interacciones / seguidores."
        />
      )}

      {hasX && (
        <NetworkTable
          network="x"
          networkLabel="X (Twitter)"
          brands={allBrands}
          ownBrands={ownBrands}
          brandColors={brandColors}
          disclaimer="Seguidores y engagement actuales. Reacciones acumuladas (likes + comentarios + compartidos). Engagement rate = interacciones / seguidores."
        />
      )}

      {/* Mapa de temas por marca */}
      {brandTopicMaps.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mt-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Temas por marca
          </h3>
          <p className="text-xs text-gray-400 mb-5">
            Qué tendencias y temas aprovecha cada marca en su contenido y conversación
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {brandTopicMaps.map((bm) => (
              <div key={bm.brand} className="border border-gray-200 rounded-lg p-4">
                <p
                  className="text-sm font-bold mb-3"
                  style={{ color: brandColors[bm.brand] || "#334155" }}
                >
                  {bm.brand}
                </p>
                <div className="space-y-2.5">
                  {bm.topics.map((t) => (
                    <div key={t.topic}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-700">{t.topic}</span>
                        <span className="text-[10px] font-bold text-gray-500">{t.percentage}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: t.percentage + "%",
                            background: brandColors[bm.brand] || "#94a3b8",
                            opacity: 0.7,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {bm.insight && (
                  <p className="text-[11px] text-gray-500 mt-3 leading-relaxed bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                    {bm.insight}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mapa estratégico competitivo */}
      {competitorStrategies.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
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

      {/* Mejores y peores posts — por marca y red */}
      {topPosts.length > 0 && (
        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Mejores y peores publicaciones
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Por marca y red social — mejor y peor post según interacciones
            </p>
          </div>

          {ownBrandsWithPosts.length > 0 && (
            <div className="space-y-5">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Marcas propias</p>
              {ownBrandsWithPosts.map((brand) => (
                <div key={brand}>
                  <p className="text-sm font-bold mb-3" style={{ color: brandColors[brand] || "#334155" }}>{brand}</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(postsByBrand[brand]).map(([net, posts]) => (
                      <Fragment key={net}>
                        {posts.best && <PostCard post={posts.best} brandColors={brandColors} />}
                        {posts.worst && <PostCard post={posts.worst} brandColors={brandColors} />}
                      </Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {compBrandsWithPosts.length > 0 && (
            <div className="space-y-5">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Competencia</p>
              {compBrandsWithPosts.map((brand) => (
                <div key={brand}>
                  <p className="text-sm font-bold mb-3" style={{ color: brandColors[brand] || "#334155" }}>{brand}</p>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(postsByBrand[brand]).map(([net, posts]) => (
                      <Fragment key={net}>
                        {posts.best && <PostCard post={posts.best} brandColors={brandColors} />}
                        {posts.worst && <PostCard post={posts.worst} brandColors={brandColors} />}
                      </Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </ProtectedLayout>
  );
}
