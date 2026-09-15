"use client";

import { useState, useMemo } from "react";
import { ProtectedLayout } from "@/components/layout/ProtectedLayout";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { formatNumber, getTotalInteractions } from "@/lib/mock-data";
import type { MentionData, Network } from "@/lib/mock-data";
import { useClientData } from "@/lib/client-data";

const sentimentLabels: Record<string, string> = {
  positive: "Positivo",
  neutral: "Neutral",
  negative: "Negativo",
};

const pieColors = ["#1DA1F2", "#000000", "#1877F2", "#FF4500", "#E4405F", "#0A66C2", "#34A853"];

function MentionCard({ mention, brandColor }: { mention: MentionData; brandColor?: string }) {
  const sentColor =
    mention.sentiment === "positive"
      ? "text-emerald-600 bg-emerald-50"
      : mention.sentiment === "negative"
        ? "text-red-600 bg-red-50"
        : "text-amber-600 bg-amber-50";

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold"
            style={{ color: brandColor || "#0d9488" }}
          >
            {mention.brand}
          </span>
          <span className="text-[10px] text-gray-300">|</span>
          <span className="text-xs font-semibold text-gray-500">
            {mention.network}
          </span>
          <span className="text-xs text-gray-400">{mention.author}</span>
        </div>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${sentColor}`}>
          {sentimentLabels[mention.sentiment]}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{mention.text}</p>
      <div className="flex items-center justify-between mt-3">
        <span className="text-xs text-gray-400">{mention.date}</span>
        <span className="text-xs text-gray-400">
          {mention.likes > 0 && `${formatNumber(mention.likes)} likes`}
        </span>
      </div>
    </div>
  );
}

export default function EscuchaActivaPage() {
  const { sovData, sentimentByBrand, mentionsByNetwork, mentions, ownBrands, competitors, brandColors } = useClientData();

  const [brandFilter, setBrandFilter] = useState<string>("all");
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");

  const allBrandNames = sovData.map((s) => s.brand);
  const allBrands = [...ownBrands, ...competitors];

  const sovChartData = sovData.map((s) => ({
    ...s,
    fill: ownBrands.some((b) => b.brand === s.brand) ? (brandColors[s.brand] || "#0d9488") : "#94a3b8",
  }));

  const networkPieData = mentionsByNetwork.map((m, i) => ({
    ...m,
    color: pieColors[i % pieColors.length],
  }));

  const availableNetworks = useMemo(() => {
    const nets = new Set<Network>();
    allBrands.forEach((b) => {
      (Object.keys(b.networks) as Network[]).forEach((n) => {
        if (b.networks[n]) nets.add(n);
      });
    });
    return Array.from(nets);
  }, [allBrands]);

  const networkLabelsMap: Record<string, string> = {
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    linkedin: "LinkedIn",
    x: "X",
  };

  const sovByNetwork = useMemo(() => {
    const result: Record<string, { brand: string; interactions: number; fill: string }[]> = {};
    for (const net of availableNetworks) {
      const entries = allBrands
        .filter((b) => b.networks[net])
        .map((b) => ({
          brand: b.brand,
          interactions: getTotalInteractions(b, net),
          fill: ownBrands.some((o) => o.brand === b.brand) ? (brandColors[b.brand] || "#0d9488") : "#94a3b8",
        }))
        .sort((a, b) => b.interactions - a.interactions);

      const total = entries.reduce((s, e) => s + e.interactions, 0);
      result[net] = entries.map((e) => ({
        ...e,
        percentage: total > 0 ? Number(((e.interactions / total) * 100).toFixed(1)) : 0,
      }));
    }
    return result;
  }, [allBrands, availableNetworks, ownBrands, brandColors]);

  const filteredMentions = mentions.filter((m) => {
    if (brandFilter !== "all" && m.brand !== brandFilter) return false;
    if (sentimentFilter !== "all" && m.sentiment !== sentimentFilter) return false;
    return true;
  });

  return (
    <ProtectedLayout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Escucha Activa</h2>
        <p className="text-gray-500 text-sm mt-1">
          Qué dicen sobre las marcas y la categoría en redes sociales, foros y
          reseñas
        </p>
      </div>

      {/* Share of Voice por plataforma */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-1">
          Share of Voice por plataforma
        </h3>
        <p className="text-xs text-gray-400 mb-1">
          Porcentaje de interacciones (likes + comentarios + compartidos) de cada marca sobre el total de la categoría en cada red social.
        </p>
        <p className="text-xs text-gray-400 mb-5">
          Indica qué proporción de la conversación e interacción total de la categoría le corresponde a cada marca.
        </p>

        <div className="space-y-6">
          {availableNetworks.map((net) => {
            const data = sovByNetwork[net];
            if (!data || data.length === 0) return null;
            const chartData = data.map((d) => ({
              brand: d.brand,
              percentage: (d as Record<string, unknown>).percentage as number,
              fill: d.fill,
            }));
            return (
              <div key={net}>
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  {networkLabelsMap[net] || net}
                </p>
                <ResponsiveContainer width="100%" height={Math.max(180, chartData.length * 32)}>
                  <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 10, right: 30 }}
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
                      tick={{ fontSize: 12, fill: "#334155" }}
                    />
                    <Tooltip
                      formatter={(value) => [
                        Number(value).toFixed(1) + "%",
                        "SOV",
                      ]}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "1px solid #e2e8f0",
                      }}
                    />
                    <Bar dataKey="percentage" radius={[0, 4, 4, 0]} fill="#94a3b8">
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>

        <p className="text-[10px] text-gray-300 mt-4 leading-relaxed">
          Cálculo: total de interacciones (likes + comentarios + compartidos) de cada marca en cada plataforma durante el período, dividido por el total de interacciones de la categoría en esa misma plataforma. Fuente: datos públicos de redes sociales.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sentimiento por marca — barras más gruesas con % dentro */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Sentimiento por marca
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Distribución positivo / neutral / negativo
          </p>
          <div className="space-y-4">
            {sentimentByBrand.slice(0, 8).map((s) => (
              <div key={s.brand}>
                <p className="text-xs font-medium text-gray-700 mb-1.5"
                   style={{ color: brandColors[s.brand] || "#374151" }}
                >
                  {s.brand}
                </p>
                <div className="flex h-7 rounded-lg overflow-hidden">
                  <div
                    className="flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ width: s.positive + "%", background: "#10b981" }}
                  >
                    {s.positive > 12 && `${s.positive}%`}
                  </div>
                  <div
                    className="flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ width: s.neutral + "%", background: "#f59e0b" }}
                  >
                    {s.neutral > 12 && `${s.neutral}%`}
                  </div>
                  <div
                    className="flex items-center justify-center text-white text-[10px] font-bold"
                    style={{ width: s.negative + "%", background: "#ef4444" }}
                  >
                    {s.negative > 12 && `${s.negative}%`}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Positivo
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              Neutral
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              Negativo
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-1">
            Volumen de menciones por plataforma
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Dónde ocurren las conversaciones sobre la categoría
          </p>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={networkPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="mentions"
                >
                  {networkPieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    formatNumber(Number(value)),
                    "Menciones",
                  ]}
                  contentStyle={{
                    fontSize: 12,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 flex-1">
              {networkPieData.map((n) => (
                <div
                  key={n.network}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: n.color }}
                    />
                    <span className="text-xs font-medium text-gray-700">
                      {n.network}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {n.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Menciones destacadas
            </h3>
            <p className="text-xs text-gray-400">
              Conversaciones relevantes encontradas por keywords
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white"
            >
              <option value="all">Todas las marcas</option>
              {allBrandNames.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
            <select
              value={sentimentFilter}
              onChange={(e) => setSentimentFilter(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 bg-white"
            >
              <option value="all">Todo sentimiento</option>
              <option value="positive">Positivo</option>
              <option value="neutral">Neutral</option>
              <option value="negative">Negativo</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredMentions.map((m) => (
            <MentionCard key={m.id} mention={m} brandColor={brandColors[m.brand]} />
          ))}
        </div>
      </div>
    </ProtectedLayout>
  );
}
