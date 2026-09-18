"use client";

import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
} from "recharts";
import { getTotalFollowers, getAvgEngagement, formatNumber } from "@/lib/mock-data";
import { useClientData } from "@/lib/client-data";

export default function DashboardPage() {
  const { ownBrands, sovData, clientDescription, brandColors, mentionsByNetwork, sentimentByBrand, commentTrend, brandEngagement } = useClientData();

  const totalFollowersOwn = ownBrands.reduce((s, b) => s + getTotalFollowers(b), 0);
  const avgEngOwn =
    ownBrands.reduce((s, b) => s + getAvgEngagement(b), 0) / ownBrands.length;
  const totalMentions = sovData
    .filter((s) => ownBrands.some((b) => b.brand === s.brand))
    .reduce((s, d) => s + d.mentions, 0);
  const ownSentimentData = sentimentByBrand.filter((s) => ownBrands.some((b) => b.brand === s.brand));
  const ownSentimentAvg = ownSentimentData.length > 0
    ? Math.round(ownSentimentData.reduce((sum, s) => sum + s.positive - s.negative, 0) / ownSentimentData.length)
    : 70;

  const sovChartData = sovData.slice(0, 8).map((s) => ({
    ...s,
    fill: brandColors[s.brand] || "#64748b",
  }));

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Resumen</h2>
        <p className="text-gray-500 text-sm mt-1">
          Vista ejecutiva — {clientDescription}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Seguidores totales</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalFollowersOwn)}</p>
          <p className="text-xs text-gray-400 mt-1">Snapshot · sep 2026</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Engagement promedio</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{avgEngOwn.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-1">Snapshot · sep 2026</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Comentarios propios</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalMentions)}</p>
          <p className="text-xs text-gray-400 mt-1">Acumulado · jun–sep 2026</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Sentimiento neto</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">+{ownSentimentAvg}%</p>
          <p className="text-xs text-gray-400 mt-1">Acumulado · jun–sep 2026</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Share of Voice — Categoría
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Porcentaje de menciones de cada marca sobre el total de la categoría (top 8)
          </p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={sovChartData}
              layout="vertical"
              margin={{ left: 10, right: 20, top: 0, bottom: 0 }}
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
                width={90}
                tick={(props: Record<string, unknown>) => {
                  const { x, y, payload } = props as { x: number; y: number; payload: { value: string } };
                  return (
                    <text
                      x={x}
                      y={y}
                      dy={4}
                      textAnchor="end"
                      fontSize={12}
                      fontWeight={ownBrands.some((b) => b.brand === payload.value) ? 700 : 400}
                      fill={brandColors[payload.value] || "#334155"}
                    >
                      {payload.value}
                    </text>
                  );
                }}
              />
              <Tooltip
                formatter={(value) => [Number(value).toFixed(1) + "%", "SOV"]}
                contentStyle={{
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar dataKey="percentage" radius={[0, 4, 4, 0]} fill="#94a3b8">
                {sovChartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-gray-300 mt-3 leading-relaxed">
            Acumulado jun–sep 2026. Cálculo: total de comentarios públicos en las cuentas de cada marca, dividido entre el total de la categoría. Fuente: scraping de comentarios reales.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Seguidores por red social
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Marcas propias — comparativa Instagram vs Facebook
          </p>
          <div className="space-y-4">
            {ownBrands.map((brand) => {
              const ig = brand.networks.instagram;
              const fb = brand.networks.facebook;
              const totalF = (ig?.followers ?? 0) + (fb?.followers ?? 0);
              return (
                <div key={brand.brand}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: brandColors[brand.brand] || "#334155" }}>{brand.brand}</span>
                    <span className="text-sm font-bold text-gray-900">{formatNumber(totalF)}</span>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-500">
                    {ig && (
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span>Instagram</span>
                          <span className="font-medium text-gray-700">{formatNumber(ig.followers)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-pink-500" style={{ width: `${Math.min((ig.followers / (totalF || 1)) * 100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                    {fb && (
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span>Facebook</span>
                          <span className="font-medium text-gray-700">{formatNumber(fb.followers)}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.min((fb.followers / (totalF || 1)) * 100, 100)}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-gray-300 mt-4 leading-relaxed">
            Snapshot sep 2026. Se actualizará con scraping quincenal para mostrar tendencia de crecimiento.
          </p>
        </div>
      </div>

      {commentTrend.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Tendencia de comentarios
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Volumen mensual y distribución de sentimiento — todas las marcas monitoreadas
          </p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={commentTrend} margin={{ left: 0, right: 10, top: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
              />
              <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Positivo" />
              <Area type="monotone" dataKey="neutral" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.4} name="Neutro" />
              <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Negativo" />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-gray-300 mt-3 leading-relaxed">
            Tendencia · jun–sep 2026. Clasificación de sentimiento por keywords y emojis sobre comentarios reales scrapeados.
          </p>
        </div>
      )}

      {brandEngagement.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Ranking de engagement por marca
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Total de interacciones acumuladas — todas las marcas monitoreadas
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-3 text-xs font-medium text-gray-400">#</th>
                  <th className="text-left py-2 pr-3 text-xs font-medium text-gray-400">Marca</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-400">Posts</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-400">Likes</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-400">Comentarios</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-400">Shares</th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-gray-400">Views</th>
                  <th className="text-right py-2 pl-2 text-xs font-medium text-gray-400">Engagement</th>
                </tr>
              </thead>
              <tbody>
                {brandEngagement.slice(0, 10).map((b, i) => {
                  const isOwn = ownBrands.some((ob) => ob.brand === b.brand);
                  return (
                    <tr key={b.brand} className={`border-b border-gray-50 ${isOwn ? "bg-blue-50/40" : ""}`}>
                      <td className="py-2 pr-3 text-xs text-gray-400 font-mono">{i + 1}</td>
                      <td className="py-2 pr-3 font-medium" style={{ color: brandColors[b.brand] || "#334155" }}>
                        {b.brand}
                        {isOwn && <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">propia</span>}
                      </td>
                      <td className="py-2 px-2 text-right text-gray-600 tabular-nums">{formatNumber(b.posts)}</td>
                      <td className="py-2 px-2 text-right text-gray-600 tabular-nums">{formatNumber(b.likes)}</td>
                      <td className="py-2 px-2 text-right text-gray-600 tabular-nums">{formatNumber(b.comments)}</td>
                      <td className="py-2 px-2 text-right text-gray-600 tabular-nums">{formatNumber(b.shares)}</td>
                      <td className="py-2 px-2 text-right text-gray-600 tabular-nums">{formatNumber(b.views)}</td>
                      <td className="py-2 pl-2 text-right font-bold text-gray-900 tabular-nums">{formatNumber(b.totalEngagement)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-gray-300 mt-3 leading-relaxed">
            Acumulado jun–sep 2026. Engagement = likes + comentarios + shares. Views se reportan por separado (principalmente TikTok). Fuente: scraping de publicaciones reales.
          </p>
        </div>
      )}

    </ProtectedLayout>
  );
}
