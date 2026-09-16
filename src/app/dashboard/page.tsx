"use client";

import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  AlertTriangle,
  Info,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getTotalFollowers, getAvgEngagement, formatNumber, executiveInsights, sentimentByBrand } from "@/lib/mock-data";
import { useClientData } from "@/lib/client-data";

const insightCategoryStyles = {
  oportunidad: { border: "border-l-emerald-500", bg: "bg-emerald-50", label: "Oportunidad", color: "text-emerald-700" },
  riesgo: { border: "border-l-red-500", bg: "bg-red-50", label: "Riesgo", color: "text-red-700" },
  tendencia: { border: "border-l-blue-500", bg: "bg-blue-50", label: "Tendencia", color: "text-blue-700" },
  accion: { border: "border-l-amber-500", bg: "bg-amber-50", label: "Acción requerida", color: "text-amber-700" },
};

const severityStyles = {
  info: "border-l-blue-400 bg-blue-50",
  warning: "border-l-amber-400 bg-amber-50",
  critical: "border-l-red-400 bg-red-50",
};

const severityIcons = {
  info: Info,
  warning: AlertTriangle,
  critical: Zap,
};

export default function DashboardPage() {
  const { ownBrands, sovData, alerts, clientDescription, brandColors } = useClientData();

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
          <p className="text-xs text-gray-400 mt-1">Marcas propias, todas las redes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Engagement promedio</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{avgEngOwn.toFixed(1)}%</p>
          <p className="text-xs text-gray-400 mt-1">Últimos 30 días</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Menciones propias</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(totalMentions)}</p>
          <p className="text-xs text-gray-400 mt-1">Veces que se mencionan nuestras marcas en redes</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Sentimiento neto</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">+{ownSentimentAvg}%</p>
          <p className="text-xs text-gray-400 mt-1">% positivo menos % negativo</p>
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
            Cálculo: total de menciones públicas de cada marca en X, TikTok, Facebook, Instagram, LinkedIn, Reddit y Google Maps durante el período, dividido por el total de menciones de la categoría. Fuente: escucha activa por keywords.
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
            Snapshot sep 2026 — se actualizará con scraping quincenal para mostrar tendencia de crecimiento.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Insights ejecutivos
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Hallazgos accionables basados en el análisis de 498 publicaciones reales
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {executiveInsights.map((insight, i) => {
            const style = insightCategoryStyles[insight.category];
            return (
              <div
                key={i}
                className={`border-l-4 ${style.border} ${style.bg} rounded-r-lg p-4`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-bold uppercase ${style.color}`}>
                    {style.label}
                  </span>
                </div>
                <p className="text-sm font-medium text-gray-900">{insight.title}</p>
                <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                {insight.metric && (
                  <p className="text-xs font-semibold text-gray-800 mt-2">{insight.metric}</p>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {insight.brands.map((b) => (
                    <span key={b} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white/70 text-gray-600">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-gray-300 mt-3 leading-relaxed">
          Basado en análisis de sentimiento y engagement de 216 posts de Instagram, 200 de Facebook y 82 de TikTok. Período: últimos 3 meses.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          Alertas y cambios significativos
        </h3>
        <div className="space-y-3">
          {alerts.map((alert, i) => {
            const Icon = severityIcons[alert.severity];
            return (
              <div
                key={i}
                className={`border-l-4 rounded-r-lg p-4 ${severityStyles[alert.severity]}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-4 w-4 mt-0.5 shrink-0 text-gray-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {alert.description}
                    </p>
                    <div className="flex gap-3 mt-2">
                      <span
                        className="text-[10px] font-bold uppercase"
                        style={{ color: brandColors[alert.brand] || "#9ca3af" }}
                      >
                        {alert.brand}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        {alert.date}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ProtectedLayout>
  );
}
